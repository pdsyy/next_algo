import { NextRequest, NextResponse } from "next/server";
import { sessionByToken } from "@/lib/tribute";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    const token = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
    try {
        const s = await sessionByToken(token);
        if (!s) return NextResponse.json({ success: false }, { status: 404 });
        return NextResponse.json({ success: true, state: s.state, orderCode: s.order_code, testMode: s.test_mode }, {
            headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
        });
    } catch { return NextResponse.json({ success: false }, { status: 503 }); }
}
