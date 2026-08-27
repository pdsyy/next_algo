import {
    NextRequest,
    NextResponse,
} from "next/server";

import crypto from "crypto";

import {
    getCmlOrder,
    recordCmlPayment,
} from "@/lib/cml";


/* =========================
   SORT OBJECT RECURSIVELY
========================= */

function sortObject(
    value: any
): any {

    if (Array.isArray(value)) {
        return value.map(sortObject);
    }

    if (
        value !== null &&
        typeof value === "object"
    ) {

        return Object.keys(value)
            .sort()
            .reduce(
                (
                    result:
                        Record<string, any>,
                    key
                ) => {

                    result[key] =
                        sortObject(
                            value[key]
                        );

                    return result;

                },
                {}
            );
    }

    return value;
}


/* =========================
   VERIFY NOWPAYMENTS IPN
========================= */

function verifyNowPaymentsSignature(
    body: any,
    receivedSignature: string
) {

    const secret =
        process.env
            .NOWPAYMENTS_IPN_SECRET;

    if (!secret) {
        throw new Error(
            "NOWPAYMENTS_IPN_SECRET is missing"
        );
    }


    const sortedBody =
        sortObject(body);


    const stringifiedBody =
        JSON.stringify(
            sortedBody
        );


    const calculatedSignature =
        crypto
            .createHmac(
                "sha512",
                secret
            )
            .update(
                stringifiedBody
            )
            .digest("hex");


    /*
     * timingSafeEqual требует
     * одинаковую длину buffer.
     */

    const receivedBuffer =
        Buffer.from(
            receivedSignature,
            "hex"
        );

    const calculatedBuffer =
        Buffer.from(
            calculatedSignature,
            "hex"
        );


    if (
        receivedBuffer.length !==
        calculatedBuffer.length
    ) {
        return false;
    }


    return crypto.timingSafeEqual(
        receivedBuffer,
        calculatedBuffer
    );
}


/* =========================
   NORMALIZE CML AMOUNT
========================= */

function normalizeAmount(
    value: unknown
) {

    const normalized =
        String(value)
            .replace(
                /[^\d.-]/g,
                ""
            );


    return parseFloat(
        normalized
    );
}


/* =========================
   WEBHOOK
========================= */

export async function POST(
    req: NextRequest
) {

    try {

        /* =========================
           1. READ BODY
        ========================= */

        const body =
            await req.json();


        console.log(
            "NOWPAYMENTS IPN:",
            JSON.stringify(
                body,
                null,
                2
            )
        );


        /* =========================
           2. GET SIGNATURE
        ========================= */

        const signature =
            req.headers.get(
                "x-nowpayments-sig"
            );


        if (!signature) {

            console.error(
                "NOWPAYMENTS IPN: signature missing"
            );


            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Missing signature",
                },
                {
                    status: 401,
                }
            );
        }


        /* =========================
           3. VERIFY SIGNATURE
        ========================= */

        const signatureValid =
            verifyNowPaymentsSignature(
                body,
                signature
            );


        if (!signatureValid) {

            console.error(
                "NOWPAYMENTS IPN: invalid signature"
            );


            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Invalid signature",
                },
                {
                    status: 401,
                }
            );
        }


        console.log(
            "NOWPAYMENTS IPN SIGNATURE: OK"
        );


        /* =========================
           4. REQUIRED VALUES
        ========================= */

        const paymentId =
            String(
                body.payment_id ?? ""
            );


        const orderCode =
            String(
                body.order_id ?? ""
            );


        const paymentStatus =
            String(
                body.payment_status ?? ""
            );


        if (
            !paymentId ||
            !orderCode ||
            !paymentStatus
        ) {

            console.error(
                "NOWPAYMENTS IPN: missing values",
                {
                    paymentId,
                    orderCode,
                    paymentStatus,
                }
            );


            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Invalid IPN payload",
                },
                {
                    status: 400,
                }
            );
        }


        console.log(
            "NOWPAYMENTS IPN STATUS:",
            {
                paymentId,
                orderCode,
                paymentStatus,
            }
        );


        /* =========================
           5. IGNORE NON-FINAL STATES
        ========================= */

        if (
            paymentStatus !==
            "finished"
        ) {

            /*
             * waiting
             * confirming
             * confirmed
             * sending
             *
             * Ничего в CML пока
             * не записываем.
             */

            return NextResponse.json({
                success: true,
                ignored: true,
                status:
                paymentStatus,
            });
        }


        /* =========================
           6. GET CML ORDER
        ========================= */

        const cmlResponse =
            await getCmlOrder(
                orderCode
            );


        const order =
            cmlResponse
                ?.success?.order ??
            cmlResponse
                ?.success
                ?.data?.order ??
            cmlResponse
                ?.data?.order ??
            cmlResponse?.order;


        if (!order) {

            throw new Error(
                `CML order ${orderCode} not found`
            );
        }


        console.log(
            "NOWPAYMENTS → CML ORDER:",
            JSON.stringify(
                order,
                null,
                2
            )
        );


        /* =========================
           7. IDEMPOTENCY
        ========================= */

        /*
         * Если CML уже Paid,
         * повторно payment не пишем.
         *
         * NOWPayments может прислать
         * IPN несколько раз.
         */

        if (
            Number(order.status) === 3
        ) {

            console.log(
                "CML ORDER ALREADY PAID:",
                orderCode
            );


            return NextResponse.json({
                success: true,
                alreadyPaid: true,
            });
        }


        /* =========================
           8. VERIFY ORDER STATUS
        ========================= */

        if (
            Number(order.status) !== 1 &&
            Number(order.status) !== 2
        ) {

            throw new Error(
                `CML order cannot receive payment. Status: ${order.status}`
            );
        }


        /* =========================
           9. VERIFY AMOUNT
        ========================= */

        const orderAmount =
            normalizeAmount(
                order.final_amount
            );


        /*
         * Важно:
         *
         * price_amount — исходная
         * fiat цена заказа.
         *
         * Не pay_amount BTC.
         */

        const nowPaymentsAmount =
            Number(
                body.price_amount
            );


        const nowPaymentsCurrency =
            String(
                body.price_currency ??
                ""
            ).toUpperCase();


        const cmlCurrency =
            String(
                order.currency ??
                ""
            ).toUpperCase();


        console.log(
            "PAYMENT VALIDATION:",
            {
                orderAmount,
                nowPaymentsAmount,
                nowPaymentsCurrency,
                cmlCurrency,
            }
        );


        if (
            !Number.isFinite(
                orderAmount
            ) ||
            !Number.isFinite(
                nowPaymentsAmount
            )
        ) {

            throw new Error(
                "Invalid payment amount"
            );
        }


        /*
         * Float tolerance.
         */

        const difference =
            Math.abs(
                orderAmount -
                nowPaymentsAmount
            );


        if (
            difference > 0.01
        ) {

            throw new Error(
                `Payment amount mismatch. CML: ${orderAmount}, NOWPayments: ${nowPaymentsAmount}`
            );
        }


        if (
            cmlCurrency !==
            nowPaymentsCurrency
        ) {

            throw new Error(
                `Payment currency mismatch. CML: ${cmlCurrency}, NOWPayments: ${nowPaymentsCurrency}`
            );
        }


        /* =========================
           10. RECORD CML PAYMENT
        ========================= */

        const paymentMethod =
            body.pay_currency
                ? String(
                    body.pay_currency
                )
                : "crypto";


        const recordResponse =
            await recordCmlPayment({

                orderCode,

                providerTransactionId:
                paymentId,

                /*
                 * CML хранит fiat amount:
                 * 799.83 EUR
                 */
                amount:
                orderAmount,

                paymentMethod,

                externalReference:
                    `nowpayments:${paymentId}`,
            });


        console.log(
            "CML PAYMENT RECORDED:",
            JSON.stringify(
                recordResponse,
                null,
                2
            )
        );


        /* =========================
           11. SUCCESS
        ========================= */

        return NextResponse.json({
            success: true,

            orderCode,

            paymentId,

            cml:
            recordResponse,
        });


    } catch (error) {

        console.error(
            "NOWPAYMENTS WEBHOOK ERROR:",
            error
        );


        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Webhook error",
            },
            {
                status: 500,
            }
        );
    }
}