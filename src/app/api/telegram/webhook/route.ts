import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { bindTelegram, config, getTributeProduct, required, telegramMessage } from "@/lib/tribute";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export async function POST(req: NextRequest) {
    const expected = required("TELEGRAM_WEBHOOK_SECRET");
    const got = req.headers.get("x-telegram-bot-api-secret-token") ?? "";
    if (Buffer.byteLength(got) !== Buffer.byteLength(expected) || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected))) {
        return NextResponse.json({ success: false }, { status: 401 });
    }
    try {
        const body = await req.json();
        const m = body?.message;
        if (m?.chat?.type !== "private" || !m.from || m.from.is_bot || m.chat.id !== m.from.id) {
            return NextResponse.json({ success: true });
        }
        const match = typeof m.text === "string" ? m.text.match(/^\/start(?:@\w+)?\s+([A-Za-z0-9_-]+)$/) : null;
        if (!match) {
            await telegramMessage(m.chat.id, "Open this bot using the link from your Algo World checkout. / Откройте бота по ссылке со страницы заказа Algo World.");
            return NextResponse.json({ success: true });
        }
        const result = await bindTelegram(match[1], String(m.from.id));
        if (result.error || !result.session) {
            await telegramMessage(m.chat.id, result.error ?? "Order not found");
            return NextResponse.json({ success: true });
        }
        const s = result.session;
        if (s.test_mode) {
            await telegramMessage(m.chat.id, `TEST MODE. Telegram linked to order ${s.order_code}. No payment link and no license activation. / Тест: Telegram привязан, оплата и активация отключены.`);
        } else {
            const product = await getTributeProduct();
            if (product.amount !== Number(s.amount_cents) || String(product.id) !== String(s.product_id) || config().testMode) {
                throw new Error("Product settings changed");
            }
            await telegramMessage(m.chat.id,
                `Aero · $${(Number(s.amount_cents)/100).toFixed(2)}\nOrder: ${s.order_code}\nPay using THIS Telegram account. Return to checkout after payment. / Оплачивайте с этого же Telegram-аккаунта. После оплаты вернитесь на сайт.`, product.link);
        }
        return NextResponse.json({ success: true });
    } catch {
        console.error("TELEGRAM CHECKOUT WEBHOOK FAILED");
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
