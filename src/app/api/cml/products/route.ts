import { NextResponse } from "next/server";
import { getCmlProducts } from "@/lib/cml";

export async function GET() {
    try {
        const products = await getCmlProducts(
            "algo-bots"
        );

        return NextResponse.json({
            success: true,
            products,
        });

    } catch (error) {
        console.error(
            "CML PRODUCTS ROUTE:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            {
                status: 500,
            }
        );
    }
}