export type CheckoutQuote = {
    subtotal: number;
    discount: number;
    total: number;
    currency: "USD";
    referralApplied: boolean;
    warnings: string[];
};

export function moneyCents(value: unknown): number {
    const text = String(value ?? "").trim();
    if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error("Invalid CML amount");
    const [whole, fraction = ""] = text.split(".");
    const result = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    if (!Number.isSafeInteger(result)) throw new Error("Invalid CML amount");
    return result;
}

export function extractPricing(response: any): CheckoutQuote {
    if (response?.success === false) throw new Error("CML pricing rejected");
    const payload = response?.success?.data ??
        (typeof response?.success === "object" ? response.success : null) ??
        response?.data ?? response;
    const order = payload?.order;
    if (!order || String(order.currency).toUpperCase() !== "USD") {
        throw new Error("CML pricing not returned in USD");
    }
    const subtotal = moneyCents(order.original_amount);
    const discount = moneyCents(order.discount_amount);
    const total = moneyCents(order.final_amount);
    if (discount > subtotal || subtotal - discount !== total || total <= 0) {
        throw new Error("Invalid CML price breakdown");
    }
    const warnings = response?.warnings ?? payload?.warnings ?? [];
    return {
        subtotal: subtotal / 100, discount: discount / 100, total: total / 100,
        currency: "USD", referralApplied: payload?.referral_applied === true,
        warnings: Array.isArray(warnings) ? warnings.filter((v): v is string => typeof v === "string") : [],
    };
}
