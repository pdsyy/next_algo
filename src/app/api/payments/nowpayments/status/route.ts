import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getNowPaymentStatus
} from "@/lib/nowpayments";

export async function GET(req: NextRequest) {
    try {
        const paymentId =
            req.nextUrl.searchParams.get(
                "paymentId"
            );

        if (!paymentId) {
            return NextResponse.json(
                {
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
        console.error(error);

        return NextResponse.json(
            {
                error:
                    "Unable to get payment status",
            },
            {
                status: 500,
            }
        );
    }
}