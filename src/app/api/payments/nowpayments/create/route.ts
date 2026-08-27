import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    createNowPayment,
} from "@/lib/nowpayments";

import {
    getCmlOrder,
} from "@/lib/cml";


export async function POST(
    req: NextRequest
) {
    try {
        const body =
            await req.json();

        const {
            orderCode,
            payCurrency,
        } = body;


        /* =========================
           VALIDATION
        ========================= */

        if (
            !orderCode ||
            !payCurrency
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "orderCode and payCurrency are required",
                },
                {
                    status: 400,
                }
            );
        }


        /* =========================
           1. GET ORDER FROM CML
        ========================= */

        const orderResponse =
            await getCmlOrder(
                orderCode
            );

        console.log(
            "NOWPAYMENTS CML ORDER:",
            JSON.stringify(
                orderResponse,
                null,
                2
            )
        );


        const order =
            orderResponse
                ?.success?.order ??
            orderResponse
                ?.success?.data?.order ??
            orderResponse
                ?.data?.order ??
            orderResponse
                ?.order;


        if (!order) {
            throw new Error(
                "CML order not found"
            );
        }


        /* =========================
           2. CHECK ORDER STATUS
        ========================= */

        if (Number(order.status) !== 1) {
            throw new Error(
                `CML order is not awaiting payment. Status: ${order.status}`
            );
        }


        /* =========================
           3. GET PRICE FROM CML
        ========================= */

        const rawAmount =
            order.final_amount ??
            order.total ??
            order.amount;


        const normalizedAmount =
            String(rawAmount)
                .replace(/[^\d.-]/g, "");


        const amount =
            parseFloat(
                normalizedAmount
            );


        const currency =
            order.currency;


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            throw new Error(
                `Invalid CML order amount: ${rawAmount}`
            );
        }


        if (!currency) {
            throw new Error(
                "CML order currency not returned"
            );
        }


        console.log(
            "CREATING NOWPAYMENTS:",
            {
                orderCode,
                amount,
                currency,
                payCurrency,
            }
        );


        /* =========================
           4. CREATE NOWPAYMENTS
        ========================= */

        const payment =
            await createNowPayment({
                priceAmount:
                amount,

                priceCurrency:
                    currency.toLowerCase(),

                payCurrency,

                // ВАЖНО:
                // CML order code
                orderId:
                orderCode,

                description:
                    `Algo Bots order ${orderCode}`,
            });


        console.log(
            "NOWPAYMENTS CREATED:",
            payment
        );


        /* =========================
           5. RESPONSE
        ========================= */

        return NextResponse.json({
            success: true,

            order: {
                code:
                orderCode,

                amount,

                currency,
            },

            payment: {
                id:
                    String(
                        payment.payment_id
                    ),

                status:
                payment.payment_status,

                payAddress:
                payment.pay_address,

                payAmount:
                payment.pay_amount,

                payCurrency:
                payment.pay_currency,

                priceAmount:
                payment.price_amount,

                priceCurrency:
                payment.price_currency,
            },
        });

    } catch (error) {
        console.error(
            "CREATE NOWPAYMENTS ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown payment error",
            },
            {
                status: 500,
            }
        );
    }
}