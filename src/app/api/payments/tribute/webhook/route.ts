import { NextRequest, NextResponse } from "next/server";
import { db, config, handlePurchase, required } from "@/lib/tribute";
import { positiveId, signatureValid } from "@/lib/tribute-core";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function POST(req: NextRequest) {
    try {
        const raw = await req.text();
        if (Buffer.byteLength(raw) > 128 * 1024) return new NextResponse(null, { status: 413 });
        if (!signatureValid(raw, req.headers.get("trbt-signature"), required("TRIBUTE_API_KEY"))) {
            return NextResponse.json({ success: false }, { status: 401 });
        }
        let body: any;
        try { body = JSON.parse(raw); } catch { return new NextResponse(null, { status: 400 }); }
        if (body.name === "digital_product_refunded") {
            const purchaseId = positiveId(body.payload?.purchase_id);
            const account = config().account;
            const sql = db();
            await sql.transaction([
                sql`INSERT INTO aw_tribute_refunds(account,purchase_id) VALUES(${account},${purchaseId}) ON CONFLICT DO NOTHING`,
                sql`UPDATE aw_tribute_sessions SET state='manual_review', updated_at=now()
                    WHERE id IN (SELECT session_id FROM aw_tribute_purchases WHERE account=${account} AND purchase_id=${purchaseId})`,
                sql`UPDATE aw_tribute_purchases SET state='refunded',note='Refund received: review/revoke CML license manually'
                    WHERE account=${account} AND purchase_id=${purchaseId}`,
            ]);
            console.error("TRIBUTE REFUND: LICENSE REVIEW REQUIRED", { purchaseId });
            return NextResponse.json({ success: true });
        }
        if (body.name !== "new_digital_product") return NextResponse.json({ success: true, ignored: true });
        const result = await handlePurchase(body);
        return NextResponse.json({ success: true, ...result });
    } catch {
        console.error("TRIBUTE WEBHOOK FAILED");
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
