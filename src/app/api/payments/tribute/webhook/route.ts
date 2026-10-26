import { NextRequest, NextResponse } from "next/server";
import { db, config, handlePurchase, required } from "@/lib/tribute";
import { positiveId, signatureValid, subscriptionKey } from "@/lib/tribute-core";
import { handleShopEvent } from "@/lib/tribute-shop";
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
        if (typeof body?.name === 'string' && body.name.startsWith('shop_')) {
            return NextResponse.json({success:true,...await handleShopEvent(body,raw)});
        }
        // Preserve handling for payments already started through the old subscription flow.
        if (!["new_subscription", "cancelled_subscription"].includes(body?.name)) {
            return NextResponse.json({ success: true, ignored: true });
        }
        const p = body.payload;
        const c = config();
        if (positiveId(p?.subscription_id) !== c.productId || positiveId(p?.period_id) !== c.periodId) {
            return NextResponse.json({ success: true, ignored: true });
        }
        if (body.name === "cancelled_subscription") {
            const key = subscriptionKey(p);
            const sql = db();
            await sql.transaction([
                sql`INSERT INTO aw_tribute_subscription_cancellations(account,purchase_id)
                    VALUES(${c.account},${key}) ON CONFLICT DO NOTHING`,
                sql`UPDATE aw_tribute_sessions SET state='manual_review', updated_at=now()
                    WHERE account=${c.account} AND product_id=${c.productId} AND period_id=${c.periodId}
                    AND telegram_id=${positiveId(p.telegram_user_id)} AND state IN ('bound','processing','paid','test_paid')`,
                sql`UPDATE aw_tribute_subscription_payments SET state='manual_review',note='Subscription cancelled: reconcile payment and CML license manually'
                    WHERE account=${c.account} AND purchase_id=${key}`,
            ]);
            console.error("TRIBUTE SUBSCRIPTION CANCELLED: REVIEW REQUIRED", { subscriptionId: c.productId });
            return NextResponse.json({ success: true, state: "manual_review" });
        }
        if (p.period !== "onetime" || p.type !== "regular") {
            const sql = db();
            await sql`UPDATE aw_tribute_sessions SET state='manual_review', updated_at=now()
                WHERE account=${c.account} AND product_id=${c.productId} AND period_id=${c.periodId}
                AND telegram_id=${positiveId(p.telegram_user_id)} AND state='bound'`;
            console.error("TRIBUTE SUBSCRIPTION NOT FULFILLED: UNSUPPORTED PERIOD OR TYPE");
            return NextResponse.json({ success: true, state: "manual_review" });
        }
        return NextResponse.json({ success: true, ...await handlePurchase(body) });
    } catch {
        console.error("TRIBUTE WEBHOOK FAILED");
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
