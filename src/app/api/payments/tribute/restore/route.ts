import { NextRequest, NextResponse } from "next/server";
import { config, sessionByToken } from "@/lib/tribute";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
    try {
        const token = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
        const s = await sessionByToken(token);
        if (!s || !s.telegram_id) return NextResponse.json({ success: false }, { status: 404, headers });
        return NextResponse.json({ success: true, state: s.state, session: {
            token, orderCode: s.order_code, testMode: s.test_mode,
            botUrl: `https://t.me/${config().bot}?start=${token}`,
        } }, { headers });
    } catch {
        return NextResponse.json({ success: false }, { status: 503, headers });
    }
}
