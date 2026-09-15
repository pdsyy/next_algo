type PurchaseNotification = {
    orderCode: string;
    paymentId: string;
    amount: number;
    currency: string;
    payCurrency: string;
    products: string[];
    customerName?: string;
    email?: string;
};

function escapeHtml(value: unknown) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

export async function sendTelegramPurchaseNotification({
                                                           orderCode,
                                                           paymentId,
                                                           amount,
                                                           currency,
                                                           payCurrency,
                                                           products,
                                                           customerName,
                                                           email,
                                                       }: PurchaseNotification) {
    const botToken =
        process.env.TELEGRAM_BOT_TOKEN?.trim();

    const chatId =
        process.env.TELEGRAM_CHAT_ID?.trim();

    if (!botToken || !chatId) {
        throw new Error(
            "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing",
        );
    }

    const productText =
        products.length > 0
            ? products.map(escapeHtml).join(", ")
            : "Не удалось определить";

    const lines = [
        "<b>✅ Новая покупка Algo World</b>",
        "",
        `<b>🤖 Бот:</b> ${productText}`,
        `<b>💰 Сумма:</b> ${escapeHtml(amount.toFixed(2))} ${escapeHtml(currency)}`,
        `<b>💳 Оплата:</b> ${escapeHtml(payCurrency.toUpperCase())}`,
    ];

    if (customerName) {
        lines.push(
            `<b>👤 Покупатель:</b> ${escapeHtml(customerName)}`,
        );
    }

    if (email) {
        lines.push(
            `<b>📧 Email:</b> <code>${escapeHtml(email)}</code>`,
        );
    }

    lines.push(
        `<b>🧾 Заказ:</b> <code>${escapeHtml(orderCode)}</code>`,
        `<b>🔐 Payment ID:</b> <code>${escapeHtml(paymentId)}</code>`,
    );

    const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: lines.join("\n"),
                parse_mode: "HTML",
            }),
            cache: "no-store",
        },
    );

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.ok !== true) {
        throw new Error(
            result?.description ||
            `Telegram request failed: ${response.status}`,
        );
    }
}