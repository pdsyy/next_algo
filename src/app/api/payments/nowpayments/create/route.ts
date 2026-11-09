import { moneyCents } from "@/lib/checkout-pricing";
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


/* =========================
   HELPERS
========================= */

// Same tolerant parsing as in /api/checkout (create-order):
// strips everything except digits, dot and minus ("765.00 USD" -> 765).
const amountOf = (
    value: unknown
) =>
    Number.parseFloat(
        String(value ?? "")
            .replace(/[^\d.-]/g, "")
    );


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
           1. GET CML ORDER
        ========================= */

        const orderResponse =
            await getCmlOrder(
                orderCode
            );


        const order =
            orderResponse
                ?.success?.order ??
            orderResponse
                ?.success?.data?.order ??
            orderResponse
                ?.data?.order ??
            orderResponse?.order;


        if (!order) {
            throw new Error(
                "CML order not found"
            );
        }


        /* =========================
           2. CHECK STATUS
        ========================= */

        if (
            Number(order.status) !== 1
        ) {

            throw new Error(
                `CML order is not awaiting payment. Status: ${order.status}`
            );
        }


        /* =========================
           3. GET AUTHORITATIVE PRICE
        ========================= */

        const rawAmount =
            order.final_amount ??
            order.total ??
            order.amount;

        const parsedAmount =
            amountOf(rawAmount);

        if (
            !Number.isFinite(parsedAmount) ||
            parsedAmount <= 0
        ) {
            console.error(
                "CML ORDER AMOUNT FIELDS:",
                {
                    final_amount:
                    order.final_amount,
                    total:
                    order.total,
                    amount:
                    order.amount,
                }
            );

            throw new Error(
                `Invalid CML order amount: ${String(rawAmount)}`
            );
        }

        // Round to cents to avoid float artifacts (e.g. 764.9999999999999)
        const amount =
            Math.round(parsedAmount * 100) / 100;


        const currency =
            String(
                order.currency ?? ""
            ).toUpperCase();


        if (!currency) {
            throw new Error(
                "CML order currency not returned"
            );
        }


        console.log(
            "CREATING NOWPAYMENTS:",
            {
                mode:
                process.env
                    .NOWPAYMENTS_MODE,

                orderCode,
                amount,
                currency,
                payCurrency,
            }
        );


        /* =========================
           4. CONSENT CHECK
        ========================= */

        if (
            body.expectedTotal !== undefined &&
            moneyCents(body.expectedTotal) !== moneyCents(amount)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Price changed. Return to checkout to review the current total.",
                },
                {
                    status: 409,
                }
            );
        }


        /* =========================
           5. CREATE NOWPAYMENTS
        ========================= */

        const payment =
            await createNowPayment({

                priceAmount:
                amount,

                priceCurrency:
                currency,

                payCurrency:
                    String(
                        payCurrency
                    ),

                orderId:
                orderCode,

                description:
                    `Algo Bots order ${orderCode}`,
            });


        /* =========================
           RESPONSE
        ========================= */

        return NextResponse.json({

            success: true,

            mode:
                process.env
                    .NOWPAYMENTS_MODE ??
                "production",

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