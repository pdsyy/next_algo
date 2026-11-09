import { NextRequest, NextResponse } from "next/server";
import { getCmlProductByCode, previewCmlOrder } from "@/lib/cml";
import { extractPricing } from "@/lib/checkout-pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const allowed = new Set(["aero-ea", "terra-ea", "hydro-ea"]);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const language = body.deliveryLanguage;
        const code = typeof body.referralCode === "string" ? body.referralCode.trim() : "";
        const items = body.items;
        if (!["en", "ru"].includes(language) ||
            (code && !/^[A-Za-z0-9_-]{1,64}$/.test(code)) ||
            !Array.isArray(items) || !items.length || items.length > 3 ||
            items.some(item => !item || !allowed.has(item.productCode) || item.quantity !== 1) ||
            new Set(items.map(item => item.productCode)).size !== items.length) {
            return NextResponse.json({ success: false, error: "INVALID_CART" }, { status: 400 });
        }
        // A dedicated ordinary CML Customer in the same organisation; never supplied by the browser.
        const customerId = Number(process.env.CML_PREVIEW_CUSTOMER_ID);
        if (!Number.isSafeInteger(customerId) || customerId < 1) {
            return NextResponse.json({ success: false, error: "PRICING_NOT_CONFIGURED" }, { status: 503 });
        }
        const products = await Promise.all(items.map(async item => {
            const product = await getCmlProductByCode(item.productCode + (language === "ru" ? "-ru" : ""));
            const id = Number(product?.product?.id ?? product?.id);
            if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid product");
            return { productId: id, quantity: 1 };
        }));
        const quote = extractPricing(await previewCmlOrder({ customerId, referralCode: code, items: products }));
        return NextResponse.json({ success: true, quote }, { headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ success: false, error: "PRICING_UNAVAILABLE" }, { status: 502 });
    }
}
