import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

type CreateOrderBody = {
    customer?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        referralCode?: string;
    };
    items?: Array<{
        id?: string;
        quantity?: number;
    }>;
};

const TERRA_PRODUCT = {
    id: "terra-ea",
    name: "TERRA EA",
    unitPrice: 1000,
    currency: "USD",
} as const;

function createOrderNumber() {
    const date = new Date();
    const datePart = [
        date.getUTCFullYear().toString().slice(-2),
        String(date.getUTCMonth() + 1).padStart(2, "0"),
        String(date.getUTCDate()).padStart(2, "0"),
    ].join("");
    const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

    return `AW-${datePart}-${randomPart}`;
}

function signPayload(payload: string, secret: string) {
    return crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("base64url");
}

export async function POST(request: NextRequest) {
    try {
        const secret = process.env.ORDER_SIGNING_SECRET;
        const paymentUrl = process.env.MQL5_TERRA_URL;

        if (!secret || secret.length < 32) {
            throw new Error("ORDER_SIGNING_SECRET is missing or too short");
        }

        if (!paymentUrl) {
            throw new Error("MQL5_TERRA_URL is missing");
        }

        const body = (await request.json()) as CreateOrderBody;
        const customer = body.customer;
        const items = Array.isArray(body.items) ? body.items : [];

        if (
            !customer?.firstName?.trim() ||
            !customer.lastName?.trim() ||
            !customer.email?.trim()
        ) {
            return NextResponse.json(
                { success: false, error: "Customer details are required" },
                { status: 400 },
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
            return NextResponse.json(
                { success: false, error: "Invalid customer email" },
                { status: 400 },
            );
        }

        // На первом этапе разрешаем только одну лицензию TERRA EA.
        if (
            items.length !== 1 ||
            items[0]?.id !== TERRA_PRODUCT.id ||
            Number(items[0]?.quantity) !== 1
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "MQL5 checkout currently supports one TERRA EA license only",
                },
                { status: 400 },
            );
        }

        const order = {
            orderNumber: createOrderNumber(),
            status: "awaiting_payment" as const,
            paymentMethod: "mql5" as const,
            customer: {
                firstName: customer.firstName.trim(),
                lastName: customer.lastName.trim(),
                email: customer.email.trim().toLowerCase(),
                referralCode: customer.referralCode?.trim() ?? "",
            },
            items: [{ ...TERRA_PRODUCT, quantity: 1 }],
            total: TERRA_PRODUCT.unitPrice,
            currency: TERRA_PRODUCT.currency,
            createdAt: new Date().toISOString(),
        };

        const encodedPayload = Buffer.from(JSON.stringify(order)).toString("base64url");
        const signature = signPayload(encodedPayload, secret);

        return NextResponse.json({
            success: true,
            order,
            orderToken: `${encodedPayload}.${signature}`,
            paymentUrl,
        });
    } catch (error) {
        console.error("CREATE MQL5 ORDER ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Could not create order",
            },
            { status: 500 },
        );
    }
}