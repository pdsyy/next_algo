import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "application/pdf",
]);

type SignedOrder = {
    orderNumber: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
    };
    items: Array<{ name: string; quantity: number }>;
    total: number;
    currency: string;
    createdAt: string;
};

function verifyOrderToken(token: string, secret: string): SignedOrder {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) throw new Error("Invalid order token");

    const expected = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("base64url");

    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
        receivedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
        throw new Error("Invalid order signature");
    }

    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

export async function POST(request: NextRequest) {
    try {
        const secret = process.env.ORDER_SIGNING_SECRET;
        const resendKey = process.env.RESEND_API_KEY;
        const recipient = process.env.ORDER_CONFIRMATION_EMAIL;
        const sender = process.env.EMAIL_FROM;

        if (!secret || !resendKey || !recipient || !sender) {
            throw new Error("Order confirmation environment variables are missing");
        }

        const formData = await request.formData();
        const orderToken = formData.get("orderToken");
        const mql5Reference = formData.get("mql5Reference");
        const file = formData.get("confirmation");

        if (typeof orderToken !== "string") {
            return NextResponse.json(
                { success: false, error: "Order token is required" },
                { status: 400 },
            );
        }

        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json(
                { success: false, error: "Payment confirmation is required" },
                { status: 400 },
            );
        }

        if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: "Use JPG, PNG or PDF up to 10 MB" },
                { status: 400 },
            );
        }

        const order = verifyOrderToken(orderToken, secret);
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const resend = new Resend(resendKey);

        const result = await resend.emails.send({
            from: sender,
            to: recipient,
            replyTo: order.customer.email,
            subject: `MQL5 payment verification — ${order.orderNumber}`,
            text: [
                `Order: ${order.orderNumber}`,
                `Customer: ${order.customer.firstName} ${order.customer.lastName}`,
                `Email: ${order.customer.email}`,
                `MQL5 purchase number: ${
                    typeof mql5Reference === "string" && mql5Reference.trim()
                        ? mql5Reference.trim()
                        : "Not provided"
                }`,
                `Total: ${order.total} ${order.currency}`,
                `Items: ${order.items.map(item => `${item.name} × ${item.quantity}`).join(", ")}`,
                `Created: ${order.createdAt}`,
            ].join("\n"),
            attachments: [
                {
                    filename: file.name || "payment-confirmation",
                    content: fileBuffer,
                },
            ],
        });

        if (result.error) throw new Error(result.error.message);

        return NextResponse.json({
            success: true,
            status: "verification",
            orderNumber: order.orderNumber,
        });
    } catch (error) {
        console.error("CONFIRM MQL5 ORDER ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Could not send confirmation",
            },
            { status: 500 },
        );
    }
}
