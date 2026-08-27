import {
    NextRequest,
    NextResponse,
} from "next/server";

import crypto from "crypto";

import {
    getCmlOrder,
    recordCmlPayment,
} from "@/lib/cml";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


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


    console.log(
        "NOWPAYMENTS SIGNATURE CHECK:",
        {
            received:
            receivedSignature,

            calculated:
            calculatedSignature,

            body:
            stringifiedBody,
        }
    );


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
   POST WEBHOOK
========================= */

export async function POST(
    req: NextRequest
) {

    console.log(
        "=================================="
    );

    console.log(
        "NOWPAYMENTS WEBHOOK POST RECEIVED"
    );

    console.log(
        "TIME:",
        new Date().toISOString()
    );

    console.log(
        "MODE:",
        process.env
            .NOWPAYMENTS_MODE ??
        "production"
    );


    try {

        /* =========================
           1. HEADERS
        ========================= */

        const signature =
            req.headers.get(
                "x-nowpayments-sig"
            );


        console.log(
            "NOWPAYMENTS WEBHOOK HEADERS:",
            {
                signaturePresent:
                    Boolean(
                        signature
                    ),

                contentType:
                    req.headers.get(
                        "content-type"
                    ),

                userAgent:
                    req.headers.get(
                        "user-agent"
                    ),
            }
        );


        /* =========================
           2. BODY
        ========================= */

        const body =
            await req.json();


        console.log(
            "NOWPAYMENTS IPN BODY:",
            JSON.stringify(
                body,
                null,
                2
            )
        );


        /* =========================
           3. SIGNATURE EXISTS
        ========================= */

        if (!signature) {

            console.error(
                "NOWPAYMENTS IPN: SIGNATURE MISSING"
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
           4. VERIFY SIGNATURE
        ========================= */

        const signatureValid =
            verifyNowPaymentsSignature(
                body,
                signature
            );


        if (!signatureValid) {

            console.error(
                "NOWPAYMENTS IPN: INVALID SIGNATURE"
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
           5. VALUES
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


        console.log(
            "NOWPAYMENTS IPN DATA:",
            {
                paymentId,
                orderCode,
                paymentStatus,

                priceAmount:
                body.price_amount,

                priceCurrency:
                body.price_currency,

                payAmount:
                body.pay_amount,

                payCurrency:
                body.pay_currency,
            }
        );


        if (
            !paymentId ||
            !orderCode ||
            !paymentStatus
        ) {

            console.error(
                "NOWPAYMENTS IPN: INVALID PAYLOAD"
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


        /* =========================
           6. IGNORE NON FINAL
        ========================= */

        if (
            paymentStatus !==
            "finished"
        ) {

            console.log(
                "NOWPAYMENTS IPN IGNORED:",
                paymentStatus
            );


            return NextResponse.json({
                success: true,

                ignored: true,

                status:
                paymentStatus,
            });
        }


        console.log(
            "NOWPAYMENTS PAYMENT FINISHED"
        );


        /* =========================
           7. GET CML ORDER
        ========================= */

        const cmlResponse =
            await getCmlOrder(
                orderCode
            );


        console.log(
            "CML ORDER RESPONSE:",
            JSON.stringify(
                cmlResponse,
                null,
                2
            )
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


        console.log(
            "CML ORDER FOUND:",
            {
                id:
                order.id,

                code:
                order.code,

                status:
                order.status,

                amount:
                order.final_amount,

                currency:
                order.currency,
            }
        );


        /* =========================
           8. ALREADY PAID
        ========================= */

        if (
            Number(
                order.status
            ) === 3
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
           9. ORDER STATUS CHECK
        ========================= */

        if (
            Number(
                order.status
            ) !== 1 &&
            Number(
                order.status
            ) !== 2
        ) {

            throw new Error(
                `CML order cannot receive payment. Status: ${order.status}`
            );
        }


        /* =========================
           10. VERIFY AMOUNT
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


        console.log(
            "PAYMENT VALIDATION: OK"
        );


        /* =========================
           11. RECORD PAYMENT
        ========================= */

        const paymentMethod =
            body.pay_currency
                ? String(
                    body.pay_currency
                )
                : "crypto";


        console.log(
            "RECORDING PAYMENT IN CML:",
            {
                orderCode,

                paymentId,

                amount:
                orderAmount,

                paymentMethod,
            }
        );


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

        console.log(
            "NOWPAYMENTS WEBHOOK COMPLETED SUCCESSFULLY"
        );


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