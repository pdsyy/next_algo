export type CheckoutQuote = {
    subtotal: number;
    discount: number;
    total: number;
    currency: "USD";
    referralApplied: boolean;
    warnings: string[];
};

/**
 * Converts a money value to integer cents.
 *
 * Accepts:
 *  - numbers (765, 765.5, 764.9999999999999 -> float noise is tolerated)
 *  - numeric strings ("765", "765.5", "765.00", "765.0000")
 *
 * Rejects (throws):
 *  - null / undefined / empty / non-numeric values
 *  - negative values
 *  - values with real sub-cent precision ("764.9999", "10.005")
 */
export function moneyCents(value: unknown): number {
    const fail = (): never => {
        throw new Error(`Invalid CML amount: ${JSON.stringify(value) ?? String(value)}`);
    };

    if (typeof value === "number") {
        if (!Number.isFinite(value) || value < 0) return fail();
        const cents = Math.round(value * 100);
        // tolerate float noise only, not real sub-cent precision
        if (Math.abs(value * 100 - cents) > 1e-6) return fail();
        if (!Number.isSafeInteger(cents)) return fail();
        return cents;
    }

    const text = String(value ?? "").trim();
    const match = /^(\d+)(?:\.(\d+))?$/.exec(text);
    if (!match) return fail();

    const whole = match[1];
    const fraction = match[2] ?? "";

    // "765.0000" is fine, "764.9999" is not
    if (fraction.length > 2 && /[1-9]/.test(fraction.slice(2))) return fail();

    const result = Number(whole) * 100 + Number(fraction.slice(0, 2).padEnd(2, "0"));
    if (!Number.isSafeInteger(result)) return fail();
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