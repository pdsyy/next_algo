import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
    confirmCmlOrder,
    createCmlCustomer,
    createCmlOrder,
    getCmlOrder,
    getCmlProductByCode,
} from "@/lib/cml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CUSTOMER_COOKIE = "algo_cml_customer";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const ALLOWED_PRODUCT_CODES = new Set(["terra-ea", "aero-ea", "hydro-ea"]);

type CustomerSession = { email: string; customerId: number; expiresAt: number };
type RequestedItem = { productCode?: unknown; quantity?: unknown };

function secret() {
    const value = process.env.CML_API_SECRET;
    if (!value) throw new Error("CML_API_SECRET is missing");
    return value;
}

function signSession(value: CustomerSession) {
    const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
    const signature = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
    return `${payload}.${signature}`;
}

function readSession(request: NextRequest): CustomerSession | null {
    try {
        const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
        if (!token) return null;
        const [payload, received] = token.split(".");
        if (!payload || !received) return null;
        const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
        const a = Buffer.from(received);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
        const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as CustomerSession;
        if (!value.email || !Number.isInteger(value.customerId) || value.customerId < 1 || value.expiresAt < Date.now()) return null;
        return value;
    } catch {
        return null;
    }
}

function normalizeItems(value: unknown) {
    if (!Array.isArray(value)) return [];
    const uniqueCodes = new Set<string>();
    for (const candidate of value as RequestedItem[]) {
        const productCode = typeof candidate?.productCode === "string"
            ? candidate.productCode.trim().toLowerCase()
            : "";
        if (!ALLOWED_PRODUCT_CODES.has(productCode)) {
            throw new Error(`Unsupported product code: ${productCode || "empty"}`);
        }
        if (candidate.quantity !== undefined && Number(candidate.quantity) !== 1) {
            throw new Error(`Only one copy of ${productCode} can be purchased`);
        }
        uniqueCodes.add(productCode);
    }
    return [...uniqueCodes];
}

const extractCustomerId = (response: any) =>
    response?.success?.data?.customer?.id ?? response?.success?.customer?.id ??
    response?.data?.customer?.id ?? response?.customer?.id;

const extractOrder = (response: any) =>
    response?.success?.data?.order ?? response?.success?.order ??
    response?.data?.order ?? response?.order;

const amountOf = (value: unknown) =>
    Number.parseFloat(String(value ?? "").replace(/[^\d.-]/g, ""));

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const referralCode =
            typeof body.referralCode === "string"
                ? body.referralCode.trim()
                : "";
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
        const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
        const requestedItems = Array.isArray(body.items)
            ? body.items
            : body.productCode
                ? [{ productCode: body.productCode, quantity: body.quantity ?? 1 }]
                : [];
        const productCodes = normalizeItems(requestedItems);

        if (!email || !firstName || !lastName || productCodes.length === 0) {
            return NextResponse.json({ success: false, error: "email, firstName, lastName and at least one item are required" }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ success: false, error: "A valid email address is required" }, { status: 400 });
        }

        const products = await Promise.all(productCodes.map(async productCode => {
            try {
                const product = await getCmlProductByCode(productCode);
                const productId = Number(product?.id);
                if (!Number.isInteger(productId) || productId < 1) throw new Error("product ID not returned");
                if (String(product.currency ?? "").toUpperCase() !== "USD") throw new Error(`unexpected currency ${product.currency}`);
                return { productCode, productId, product };
            } catch (error) {
                const message = error instanceof Error ? error.message : "not found";
                throw new Error(`CML product ${productCode} is unavailable: ${message}`);
            }
        }));

        const existing = readSession(request);
        let customerId: number;
        let newCustomer = false;
        if (existing && existing.email === email) {
            customerId = existing.customerId;
        } else {
            const customerResponse = await createCmlCustomer({ email, firstName, lastName });
            customerId = Number(extractCustomerId(customerResponse));
            if (!Number.isInteger(customerId) || customerId < 1) throw new Error("CML customer ID not returned");
            newCustomer = true;
        }

        const orderResponse = await createCmlOrder({
            customerId,
            referralCode: referralCode || undefined,
            items: products.map(({ productId }) => ({
                productId,
                quantity: 1,
            })),
        });
        const created = extractOrder(orderResponse);
        const orderId = Number(created?.id);
        const orderCode = String(created?.code ?? "").trim();
        if (!Number.isInteger(orderId) || orderId < 1 || !orderCode) throw new Error("CML order was not created correctly");

        await confirmCmlOrder(orderId);
        const confirmed = extractOrder(await getCmlOrder(orderCode));
        if (!confirmed) throw new Error("Confirmed CML order not returned");

        const amount = amountOf(confirmed.final_amount ?? confirmed.total ?? confirmed.amount);
        const currency = String(confirmed.currency ?? products[0]?.product?.currency ?? "").toUpperCase();
        const status = Number(confirmed.status);
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid CML order amount");
        if (currency !== "USD") throw new Error(`Unexpected CML currency: ${currency}`);
        if (status !== 1) throw new Error(`CML order is not awaiting payment. Status: ${status}`);

        const response = NextResponse.json({
            success: true,
            order: {
                id: orderId,
                code: orderCode,
                status,
                amount,
                currency,
                items: products.map(({ productCode, productId, product }) => ({
                    id: productId,
                    code: product.product?.code ?? product.code ?? productCode,
                    title: product.product?.title ?? product.title,
                    quantity: 1,
                })),
            },
        });

        if (newCustomer || existing?.email === email) {
            response.cookies.set({
                name: CUSTOMER_COOKIE,
                value: signSession({ email, customerId, expiresAt: Date.now() + COOKIE_MAX_AGE * 1000 }),
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: COOKIE_MAX_AGE,
            });
        }
        return response;
    } catch (error) {
        console.error("CHECKOUT ERROR:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown checkout error" }, { status: 500 });
    }
}