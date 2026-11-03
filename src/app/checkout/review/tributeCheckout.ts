export type TributeCustomer = {
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
    deliveryLanguage: "en" | "ru";
    existingCustomer: boolean;
    verificationRef?: string;
    checkoutReference: string;
};

type Product = { id: string; name: string; imageSrc?: string };
export type TributeSession = {
    token: string;
    orderCode: string;
    paymentUrl: string | null;
    testMode: boolean;
    state: string;
    products?: Product[];
};

export function validTributeUrl(value: unknown): value is string {
    if (typeof value !== "string") return false;
    try {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password && !url.port &&
            (url.hostname === "tribute.tg" || url.hostname.endsWith(".tribute.tg"));
    } catch { return false; }
}

function isSession(value: unknown): value is TributeSession {
    if (!value || typeof value !== "object") return false;
    const s = value as Partial<TributeSession>;
    return typeof s.token === "string" && s.token.length > 0 &&
        typeof s.orderCode === "string" && s.orderCode.length > 0 &&
        typeof s.testMode === "boolean" && typeof s.state === "string" &&
        (s.paymentUrl === null || validTributeUrl(s.paymentUrl));
}

/** Called only by the user's click, never by a mount effect. */
export async function prepareTributeCheckout(
    customer: TributeCustomer,
    products: (Product & { quantity: number })[],
    messages: { error: string; unsupported: string; restoreError: string },
    previousSession?: TributeSession | null,
): Promise<TributeSession> {
    if (products.length !== 1 || products[0].id !== "aero-ea" || products[0].quantity !== 1) {
        throw new Error(messages.unsupported);
    }
    const key = `aw_tribute_shop_session_v1:${customer.checkoutReference}:${customer.deliveryLanguage}`;
    let cached: unknown = previousSession;
    if (!cached) {
        try { cached = JSON.parse(sessionStorage.getItem(key) ?? "null"); }
        catch { /* Storage may be unavailable. The checkout reference stays unchanged. */ }
    }

    let prepared: TributeSession;
    if (cached) {
        // An existing order must be checked on the server before reusing its link.
        // In particular, never redirect a paid/manual-review order to checkout.
        if (!isSession(cached)) throw new Error(messages.restoreError);
        const response = await fetch("/api/payments/tribute-shop/restore", {
            headers: { Authorization: `Bearer ${cached.token}` }, cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || !isSession(result.session) ||
            result.session.token !== cached.token || result.session.orderCode !== cached.orderCode ||
            result.session.testMode !== cached.testMode || result.state !== result.session.state) {
            throw new Error(messages.restoreError);
        }
        prepared = result.session;
    } else {
        const response = await fetch("/api/checkout", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "create-order", paymentProvider: "tribute", ...customer,
                items: [{ productCode: "aero-ea", quantity: 1 }],
            }),
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || !isSession(result.tribute)) {
            const detail = result.error ?? result.message;
            throw new Error(typeof detail === "string" ? detail : messages.error);
        }
        prepared = result.tribute;
    }

    prepared = { ...prepared, products: products.map(({ id, name, imageSrc }) => ({ id, name, imageSrc })) };
    try { sessionStorage.setItem(key, JSON.stringify(prepared)); }
    catch { /* Same-tab return also carries the server-issued recovery token. */ }
    return prepared;
}
