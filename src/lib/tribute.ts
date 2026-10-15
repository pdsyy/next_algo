import crypto from "crypto";
import { neon } from "@neondatabase/serverless";
import { cents, extractOrder, positiveId, parsePurchase } from "./tribute-core";
import { getCmlOrder, recordCmlPayment } from "./cml";
import { sendPurchaseEmailNotification } from "./order-email";

export function required(name: string): string {
    const value = process.env[name]?.trim();
    if (!value || /^(YOUR_|GENERATE_)/.test(value)) throw new Error(`${name} is missing`);
    return value;
}
export function config() {
    const testMode = process.env.TRIBUTE_TEST_MODE !== "false";
    return {
        testMode,
        account: required("TRIBUTE_ACCOUNT_ID"),
        productId: positiveId(required("TRIBUTE_AERO_SUBSCRIPTION_ID")),
        periodId: positiveId(required("TRIBUTE_AERO_PERIOD_ID")),
        url: required("TRIBUTE_AERO_URL"),
        bot: required("TELEGRAM_BOT_USERNAME").replace(/^@/, ""),
    };
}
export function db() { return neon(required("DATABASE_URL")); }
export function tokenFor(id: string) {
    const secret = required("TRIBUTE_SESSION_SECRET");
    if (secret.length < 32) throw new Error("TRIBUTE_SESSION_SECRET must contain at least 32 characters");
    return `${id.replaceAll("-", "")}_${crypto.createHmac("sha256", secret).update(id).digest("base64url").slice(0, 24)}`;
}
export async function sessionByToken(token: string) {
    if (!/^[a-f0-9]{32}_[A-Za-z0-9_-]{24}$/.test(token)) return null;
    const short = token.slice(0, 32);
    const id = `${short.slice(0,8)}-${short.slice(8,12)}-${short.slice(12,16)}-${short.slice(16,20)}-${short.slice(20)}`;
    const expected = tokenFor(id);
    if (!crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) return null;
    const sql = db();
    const rows = await sql`SELECT * FROM aw_tribute_sessions WHERE id = ${id} AND account = ${config().account}`;
    return rows[0] ?? null;
}

// Keep the existing function contract for checkout and Telegram routes.
export async function getTributeProduct() {
    const c = config();
    const response = await fetch("https://tribute.tg/api/v1/subscriptions", {
        headers: { "Api-Key": required("TRIBUTE_API_KEY") },
        cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Tribute subscription request failed (${response.status})`);
    const data = await response.json();
    if (!Array.isArray(data.result)) throw new Error("Invalid Tribute catalog");
    const matches = data.result.filter((s: any) => String(s.subscriptionId) === c.productId);
    if (matches.length !== 1) throw new Error("Subscription not found in this Tribute account");
    const subscription = matches[0];
    const periods = (subscription.periods ?? []).filter((p: any) => String(p.periodId) === c.periodId);
    if (periods.length !== 1 || periods[0].period !== "onetime" || String(subscription.currency).toUpperCase() !== "USD") {
        throw new Error("Aero must use the selected onetime USD tariff");
    }
    // Catalog prices are dollars. Webhook prices are cents.
    const amount = cents(periods[0].price);
    const url = new URL(c.url);
    if (url.protocol !== "https:" || url.hostname !== "web.tribute.tg" ||
        !/^\/s\/[A-Za-z0-9]+$/.test(url.pathname) || url.search || url.hash || url.username || url.password) {
        throw new Error("Invalid Tribute subscription URL");
    }
    // Catalog has no URL field: operator must verify this link belongs to this subscription.
    return { id: c.productId, amount, currency: "usd", link: c.url, webLink: c.url };
}

export async function createTributeSession(order: any, reference: string, email: string, price: number) {
    const c = config();
    if (cents(order.amount) !== price || order.currency !== "USD") {
        throw new Error("CML total differs from the Tribute product price. Discounts require a matching Tribute price.");
    }
    const sql = db();
    const rows = await sql`INSERT INTO aw_tribute_sessions
        (account, checkout_reference, order_code, email, amount_cents, product_id, period_id, test_mode)
        VALUES (${c.account}, ${reference}, ${order.code}, ${email}, ${price}, ${c.productId}, ${c.periodId}, ${c.testMode})
        ON CONFLICT (account, checkout_reference) DO UPDATE SET updated_at = now()
        RETURNING *`;
    const s = rows[0];
    if (s.email !== email || Number(s.amount_cents) !== price || String(s.product_id) !== c.productId || s.test_mode !== c.testMode || String(s.period_id) !== c.periodId) {
        throw new Error("Checkout session settings changed. Start a new checkout.");
    }
    const token = tokenFor(s.id);
    return { token, orderCode: s.order_code, botUrl: `https://t.me/${c.bot}?start=${token}`, testMode: s.test_mode };
}

export async function telegramMessage(chatId: number | string, text: string, url?: string, returnUrl?: string) {
    const response = await fetch(`https://api.telegram.org/bot${required("TELEGRAM_BOT_TOKEN")}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text,
            ...((url || returnUrl) ? { reply_markup: { inline_keyboard: [
                ...(url ? [[{ text: "Pay for Aero / Оплатить Aero", url }]] : []),
                ...(returnUrl ? [[{ text: "Return to order / Вернуться к заказу", url: returnUrl }]] : []),
            ] } } : {}),
        }), signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error("Telegram sendMessage failed");
}

// Only called after the Telegram webhook authenticates a private-chat sender.
export async function openTelegramSession(telegramId: string) {
    const c = config();
    const sql = db();
    const rows = await sql`SELECT * FROM aw_tribute_sessions
        WHERE account=${c.account} AND telegram_id=${telegramId} AND product_id=${c.productId}
          AND state IN ('bound','processing','manual_review')`;
    if (rows.length !== 1) return null;
    const session = rows[0];
    if (String(session.period_id) !== c.periodId || session.test_mode !== c.testMode) return null;
    return session;
}
export function tributeReturnUrl(id: string) {
    const base = new URL(required("APP_URL"));
    if (base.protocol !== "https:" || base.username || base.password) throw new Error("APP_URL must be HTTPS");
    // Fragment is not sent to HTTP servers, request logs, or Referer headers.
    return new URL(`/checkout/tribute#token=${tokenFor(id)}`, base.origin).toString();
}

export async function bindTelegram(token: string, telegramId: string) {
    const session = await sessionByToken(token);
    if (!session) return { error: "Invalid order link. Open the link from checkout again." };
    if (session.state === "paid" || session.state === "test_paid") return { error: "This order is already processed." };
    if (!["created", "bound"].includes(session.state)) return { error: "This order requires support review." };
    if (session.telegram_id && String(session.telegram_id) !== telegramId) return { error: "This order is already linked to another Telegram account." };
    if (!session.telegram_id && new Date(session.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000) {
        return { error: "This link has expired. Start a new checkout." };
    }
    const current = await openTelegramSession(telegramId);
    if (current && current.id !== session.id) return { session: current, resumed: true };
    const sql = db();
    const key = `subscription:${String(session.product_id)}:${String(session.period_id)}:${telegramId}`;
    const fulfilled = await sql`SELECT 1 FROM aw_tribute_subscription_payments
        WHERE account=${config().account} AND purchase_id=${key}`;
    const cancelled = await sql`SELECT 1 FROM aw_tribute_subscription_cancellations
        WHERE account=${config().account} AND purchase_id=${key}`;
    if (fulfilled.length || cancelled.length) return { error: "This lifetime subscription already has a payment/event. Contact support instead of paying again." };
    if (String(session.period_id) !== config().periodId || String(session.product_id) !== config().productId || session.test_mode !== config().testMode) {
        return { error: "Checkout settings changed. Start a new checkout." };
    }
    try {
        const rows = await sql`UPDATE aw_tribute_sessions SET telegram_id = ${telegramId},
            bound_at = COALESCE(bound_at, now()), state = 'bound', updated_at = now()
            WHERE id = ${session.id} AND state IN ('created','bound')
              AND (telegram_id IS NULL OR telegram_id = ${telegramId}) RETURNING *`;
        return rows[0] ? { session: rows[0] } : { error: "The order state changed. Reopen checkout." };
    } catch (error: any) {
        if (error?.code === "23505") {
            const existing = await openTelegramSession(telegramId);
            if (existing) return { session: existing, resumed: true };
            return { error: "An unfinished Aero order requires support review. Do not pay again." };
        }
        throw error;
    }
}

export async function handlePurchase(body: any) {
    const p = parsePurchase(body);
    const c = config();
    if (p.productId !== c.productId || p.periodId !== c.periodId || p.currency !== "USD") return { state: "ignored" };
    const sql = db();
    const refunds = await sql`SELECT 1 FROM aw_tribute_subscription_cancellations WHERE account=${c.account} AND purchase_id=${p.purchaseId}`;
    if (refunds.length) return { state: "manual_review" };
    // Persist first. Replays and concurrent deliveries share one immutable purchase row.
    await sql`INSERT INTO aw_tribute_subscription_payments
        (account, purchase_id, transaction_id, product_id, telegram_id, amount_cents, currency, purchased_at)
        VALUES (${c.account}, ${p.purchaseId}, ${p.transactionId}, ${p.productId}, ${p.telegramId}, ${p.amount}, ${p.currency}, ${p.createdAt.toISOString()})
        ON CONFLICT (account, purchase_id) DO NOTHING`;
    const existing = (await sql`SELECT * FROM aw_tribute_subscription_payments WHERE account=${c.account} AND purchase_id=${p.purchaseId}`)[0];
    if (String(existing.transaction_id) !== p.transactionId || String(existing.product_id) !== p.productId ||
        String(existing.telegram_id) !== p.telegramId || Number(existing.amount_cents) !== p.amount || existing.currency !== p.currency) {
        throw new Error("Conflicting data for an existing purchase");
    }
    if (["paid", "test_paid", "manual_review", "refunded"].includes(existing.state)) return { state: existing.state };
    if (existing.state === "processing") return { state: "processing" };
    // Never match by amount alone, or select the most recent of several orders.
    const sessions = await sql`SELECT * FROM aw_tribute_sessions
        WHERE account=${c.account} AND telegram_id=${p.telegramId} AND product_id=${p.productId}
          AND period_id=${p.periodId} AND state='bound' AND amount_cents=${p.amount} AND currency=${p.currency}
          AND bound_at <= ${p.createdAt.toISOString()}::timestamptz`;
    if (sessions.length !== 1) {
        await sql`UPDATE aw_tribute_subscription_payments SET state='manual_review', note='No unique matching bound order'
            WHERE account=${c.account} AND purchase_id=${p.purchaseId} AND state='received'`;
        return { state: "manual_review" };
    }
    const session = sessions[0];
    if (session.test_mode !== c.testMode) {
        await sql`UPDATE aw_tribute_subscription_payments SET state='manual_review', note='Session mode differs from deployment'
            WHERE account=${c.account} AND purchase_id=${p.purchaseId} AND state='received'`;
        return { state: "manual_review" };
    }
    // One statement atomically claims both the session and the purchase.
    const claimed = await sql`WITH claimed_session AS (
        UPDATE aw_tribute_sessions SET state='processing', updated_at=now()
        WHERE id=${session.id} AND state='bound' RETURNING id
    ) UPDATE aw_tribute_subscription_payments SET state='processing', session_id=(SELECT id FROM claimed_session)
      WHERE account=${c.account} AND purchase_id=${p.purchaseId} AND state='received'
        AND EXISTS (SELECT 1 FROM claimed_session) RETURNING *`;
    if (!claimed.length) {
        await sql`UPDATE aw_tribute_subscription_payments SET state='manual_review', note='Another purchase claimed the order'
            WHERE account=${c.account} AND purchase_id=${p.purchaseId} AND state='received'`;
        return { state: "processing" };
    }
    async function complete(state: "paid" | "test_paid") {
        await sql.transaction([
            sql`UPDATE aw_tribute_sessions SET state=CASE WHEN EXISTS (
                    SELECT 1 FROM aw_tribute_subscription_cancellations WHERE account=${c.account} AND purchase_id=${p.purchaseId}
                ) THEN 'manual_review' ELSE ${state} END, updated_at=now() WHERE id=${session.id}`,
            sql`UPDATE aw_tribute_subscription_payments SET state=(SELECT state FROM aw_tribute_sessions WHERE id=${session.id})
                WHERE account=${c.account} AND purchase_id=${p.purchaseId}`,
        ]);
        return (await sql`SELECT state FROM aw_tribute_sessions WHERE id=${session.id}`)[0].state as string;
    }
    if (session.test_mode) return { state: await complete("test_paid") };
    // Mark intent before the external call. Do not blindly retry an ambiguous CML write.
    try {
        const order = extractOrder(await getCmlOrder(session.order_code));
        if (!order || ![1,2].includes(Number(order.status))) throw new Error("CML order is missing or no longer awaiting payment");
        if (String(order.currency).toUpperCase() !== p.currency || cents(order.final_amount) !== p.amount) throw new Error("CML payment total mismatch");
        const customerEmail = order.customer?.email ?? order.customer_email ?? order.email;
        if (customerEmail && String(customerEmail).toLowerCase() !== session.email) throw new Error("CML customer mismatch");
        if ((await sql`SELECT 1 FROM aw_tribute_subscription_cancellations WHERE account=${c.account} AND purchase_id=${p.purchaseId}`).length) {
            throw new Error("Subscription cancellation needs reconciliation");
        }
        await recordCmlPayment({ orderCode: session.order_code, provider: "tribute",
            providerTransactionId: p.transactionId, amount: p.amount / 100,
            paymentMethod: "tribute", externalReference: `tribute:${c.account}:${p.purchaseId}` });
        const paidOrder = extractOrder(await getCmlOrder(session.order_code));
        if (Number(paidOrder?.status) !== 3) throw new Error("CML did not confirm Paid status");
        const finalState = await complete("paid");
        if (finalState !== "paid") return { state: finalState };
        try {
            const customer = order.customer ?? order.customer_data ?? {};
            const lines = order.items ?? order.order_items ?? order.lines ?? [];
            await sendPurchaseEmailNotification({
                orderCode: session.order_code, paymentId: p.transactionId,
                amount: p.amount / 100, currency: p.currency, payCurrency: "tribute",
                customerName: [customer.first_name ?? customer.firstName, customer.last_name ?? customer.lastName].filter(Boolean).join(" "),
                email: session.email,
                products: lines.map((line: any) => line.product?.title ?? line.product?.name ?? line.title ?? line.name ?? "Aero"),
            });
        } catch { console.error("TRIBUTE PURCHASE EMAIL NOT SENT", { orderCode: session.order_code }); }
        return { state: "paid" };
    } catch (error) {
        await sql.transaction([
            sql`UPDATE aw_tribute_sessions SET state='manual_review', updated_at=now() WHERE id=${session.id}`,
            sql`UPDATE aw_tribute_subscription_payments SET state='manual_review', note='CML result requires reconciliation'
                WHERE account=${c.account} AND purchase_id=${p.purchaseId}`,
        ]);
        console.error("TRIBUTE CML RECONCILIATION REQUIRED", { orderCode: session.order_code, purchaseId: p.purchaseId });
        return { state: "manual_review" };
    }
}
