import crypto from "crypto";

export function signatureValid(raw: string, signature: string | null, key: string) {
    if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
    const expected = crypto.createHmac("sha256", key).update(raw).digest();
    return crypto.timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export function cents(value: unknown): number {
    const text = String(value ?? "").trim();
    if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error("Invalid USD amount");
    const [whole, fraction = ""] = text.split(".");
    const result = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    if (!Number.isSafeInteger(result) || result <= 0) throw new Error("Invalid USD amount");
    return result;
}

export function positiveId(value: unknown): string {
    const id = String(value ?? "");
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
        throw new Error("Invalid provider ID");
    }
    return id;
}

export function extractOrder(response: any) {
    return response?.success?.data?.order ?? response?.success?.order ??
        response?.data?.order ?? response?.order;
}

// A lifetime subscription can fulfill only one order per Telegram user and tariff.
// Subscription webhooks do not expose a digital-product purchase/transaction ID.
export function subscriptionKey(p: any) {
    return `subscription:${positiveId(p.subscription_id)}:${positiveId(p.period_id)}:${positiveId(p.telegram_user_id)}`;
}
export function parsePurchase(body: any) {
    const p = body?.payload;
    if (body?.name !== "new_subscription" || !p) throw new Error("Unsupported event");
    if (p.period !== "onetime" || p.type !== "regular") throw new Error("Only regular onetime subscriptions are supported");
    if (!Number.isSafeInteger(p.price) || p.price <= 0) throw new Error("Invalid gross price");
    const createdAt = new Date(body.created_at);
    if (!Number.isFinite(createdAt.getTime()) || createdAt.getTime() > Date.now() + 5 * 60 * 1000) throw new Error("Invalid event date");
    const key = subscriptionKey(p);
    return {
        purchaseId: key, transactionId: key,
        productId: positiveId(p.subscription_id), periodId: positiveId(p.period_id),
        telegramId: positiveId(p.telegram_user_id), amount: p.price as number,
        currency: String(p.currency).toUpperCase(), createdAt,
    };
}
