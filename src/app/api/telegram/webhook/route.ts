import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { bindTelegram, config, getTributeProduct, openTelegramSession, required, telegramMessage, tributeReturnUrl } from "@/lib/tribute";
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
        const start = typeof m.text === "string" ? m.text.match(/^\/start(?:@\w+)?(?:\s+([A-Za-z0-9_-]+))?\s*$/) : null;
        if (!start) return NextResponse.json({ success: true });
        let session: any = null;
        let resumed = false;
        if (start[1]) {
            const result = await bindTelegram(start[1], String(m.from.id));
            if (result.error || !result.session) {
                await telegramMessage(m.chat.id, result.error ?? "Order not found");
                return NextResponse.json({ success: true });
            }
            session = result.session;
            resumed = "resumed" in result && result.resumed === true;
        } else {
            session = await openTelegramSession(String(m.from.id));
            resumed = true;
            if (!session) {
                await telegramMessage(m.chat.id, "Open this bot using the link from your Algo World checkout. / Откройте бота по ссылке со страницы заказа Algo World.");
                return NextResponse.json({ success: true });
            }
        }
        const s = session;
        const returnUrl = tributeReturnUrl(s.id);
        if (s.state !== "bound") {
            await telegramMessage(m.chat.id, `Order / Заказ: ${s.order_code}\nPayment is processing or needs review. Do not pay again. / Платёж обрабатывается или требует проверки. Не оплачивайте повторно.`, undefined, returnUrl);
        } else if (s.test_mode) {
            await telegramMessage(m.chat.id, `TEST MODE. Telegram linked to order ${s.order_code}. No payment link and no license activation. / Тест: Telegram привязан, оплата и активация отключены.`, undefined, returnUrl);
        } else {
            const product = await getTributeProduct();
            const c = config();
            if (product.amount !== Number(s.amount_cents) || String(product.id) !== String(s.product_id) ||
                String(s.period_id) !== c.periodId || c.testMode) throw new Error("Product settings changed");
            await telegramMessage(m.chat.id,
                `${resumed ? "Continuing your existing order / Продолжаем ранее привязанный заказ\n" : ""}Aero · $${(Number(s.amount_cents)/100).toFixed(2)}\nOrder / Заказ: ${s.order_code}\nLicense will belong to the customer of THIS order. / Лицензия будет выдана покупателю ЭТОГО заказа.\nPay using THIS Telegram account. If already paid, do not pay again. / Оплачивайте с этого же Telegram-аккаунта. Если уже оплатили — не платите повторно.\nUse Return to order to check status. / Для проверки статуса нажмите «Вернуться к заказу».`, product.link, returnUrl);
        }
        return NextResponse.json({ success: true });
    } catch {
        console.error("TELEGRAM CHECKOUT WEBHOOK FAILED");
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
