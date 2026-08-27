import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getNowPaymentStatus,
} from "@/lib/nowpayments";


export async function GET(
    req: NextRequest
) {

    try {

        const paymentId =
            req.nextUrl
                .searchParams
                .get(
                    "paymentId"
                );


        if (!paymentId) {

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "paymentId is required",
                },
                {
                    status: 400,
                }
            );
        }


        const payment =
            await getNowPaymentStatus(
                paymentId
            );


        return NextResponse.json(
            payment
        );


    } catch (error) {

        console.error(
            "NOWPAYMENTS STATUS ROUTE ERROR:",
            error
        );


        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to get payment status",
            },
            {
                status: 500,
            }
        );
    }
}