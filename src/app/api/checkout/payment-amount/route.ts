import { NextRequest, NextResponse } from "next/server";
import { shopSessionByToken } from "@/lib/tribute-shop";
import { moneyCents } from "@/lib/checkout-pricing";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (typeof body.token !== "string") throw new Error();
        const session = await shopSessionByToken(body.token);
        if (!session || Number(session.amount_cents) !== moneyCents(body.expectedTotal)) {
            return NextResponse.json({ success: false }, { status: 409 });
        }
        return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ success: false }, { status: 400 });
    }
}
