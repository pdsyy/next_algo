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
   SORT OBJECT
========================= */

function sortObject(
    value: any
): any {

    if (Array.isArray(value)) {
        return value.map(
            sortObject
        );
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
   GET IPN SECRET
========================= */

function getNowPaymentsIpnSecret() {

    const isSandbox =
        process.env
            .NOWPAYMENTS_MODE ===
        "sandbox";


    const secret =
        isSandbox
            ? process.env
                .NOWPAYMENTS_SANDBOX_IPN_SECRET
            : process.env
                .NOWPAYMENTS_IPN_SECRET;


    if (!secret) {
        throw new Error(
            isSandbox
                ? "NOWPAYMENTS_SANDBOX_IPN_SECRET is missing"
                : "NOWPAYMENTS_IPN_SECRET is missing"
        );
    }


    return secret;
}


/* =========================
   VERIFY SIGNATURE
========================= */

function verifyNowPaymentsSignature(
    body: any,
    receivedSignature: string
) {

    const secret =
        getNowPaymentsIpnSecret();


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
   NORMALIZE AMOUNT
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
           1. BODY
        ========================= */

        const body =
            await req.json();


        console.log(
            "NOWPAYMENTS IPN MODE:",
            process.env
                .NOWPAYMENTS_MODE ??
            "production"
        );


        console.log(
            "NOWPAYMENTS IPN:",
            JSON.stringify(
                body,
                null,
                2
            )
        );


        /* =========================
           2. SIGNATURE
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
           3. VALUES
        ========================= */

        const paymentId =
            String(
                body.payment_id ??
                ""
            );


        const orderCode =
            String(
                body.order_id ??
                ""
            );


        const paymentStatus =
            String(
                body.payment_status ??
                ""
            );


        if (
            !paymentId ||
            !orderCode ||
            !paymentStatus
        ) {

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
           4. NON FINAL STATES
        ========================= */

        if (
            paymentStatus !==
            "finished"
        ) {

            return NextResponse.json({
                success: true,

                ignored: true,

                status:
                paymentStatus,
            });
        }


        /* =========================
           5. CML ORDER
        ========================= */

        const cmlResponse =
            await getCmlOrder(
                orderCode
            );


        const order =
            cmlResponse
                ?.success?.order ??
            cmlResponse
                ?.success?.data?.order ??
            cmlResponse
                ?.data?.order ??
            cmlResponse?.order;


        if (!order) {
            throw new Error(
                `CML order ${orderCode} not found`
            );
        }


        /* =========================
           6. ALREADY PAID
        ========================= */

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
           7. VERIFY CML STATUS
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
           8. VERIFY AMOUNT
        ========================= */

        const orderAmount =
            normalizeAmount(
                order.final_amount
            );


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
           9. RECORD CML PAYMENT
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
           SUCCESS
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