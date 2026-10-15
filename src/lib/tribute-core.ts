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

export function parsePurchase(body: any) {
    const p = body?.payload;
    if (body?.name !== "new_digital_product" || !p) throw new Error("Unsupported event");
    if (!Number.isSafeInteger(p.amount) || p.amount <= 0) throw new Error("Invalid amount");
    const createdAt = new Date(p.purchase_created_at);
    if (!Number.isFinite(createdAt.getTime())) throw new Error("Invalid purchase date");
    return {
        purchaseId: positiveId(p.purchase_id),
        transactionId: positiveId(p.transaction_id),
        productId: positiveId(p.product_id),
        telegramId: positiveId(p.telegram_user_id),
        amount: p.amount as number,
        currency: String(p.currency).toUpperCase(),
        createdAt,
    };
}
