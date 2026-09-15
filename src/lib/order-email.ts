import nodemailer from "nodemailer";

type PurchaseEmailNotification = {
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

function requireEnvironmentVariable(name: string) {
    const value =
        process.env[name]?.trim();

    if (!value) {
        throw new Error(
            `${name} environment variable is missing`,
        );
    }

    return value;
}

export async function sendPurchaseEmailNotification({
                                                        orderCode,
                                                        paymentId,
                                                        amount,
                                                        currency,
                                                        payCurrency,
                                                        products,
                                                        customerName,
                                                        email,
                                                    }: PurchaseEmailNotification) {
    const smtpHost =
        requireEnvironmentVariable("SMTP_HOST");

    const smtpUser =
        requireEnvironmentVariable("SMTP_USER");

    const smtpPassword =
        requireEnvironmentVariable("SMTP_PASSWORD");

    const recipient =
        requireEnvironmentVariable(
            "PURCHASE_NOTIFICATION_EMAIL",
        );

    const smtpPort =
        Number(process.env.SMTP_PORT ?? 465);

    if (
        !Number.isInteger(smtpPort) ||
        smtpPort <= 0
    ) {
        throw new Error(
            "SMTP_PORT must be a valid number",
        );
    }

    const smtpSecure =
        process.env.SMTP_SECURE
            ? process.env.SMTP_SECURE === "true"
            : smtpPort === 465;

    const sender =
        process.env.EMAIL_FROM?.trim() ||
        `Algo World <${smtpUser}>`;

    const productText =
        products.length > 0
            ? products.join(", ")
            : "Algo World Bot";

    const subjectProduct =
        productText
            .replace(/[\r\n]+/g, " ")
            .slice(0, 100);

    const formattedAmount =
        `${amount.toFixed(2)} ${currency.toUpperCase()}`;

    const transporter =
        nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,

            auth: {
                user: smtpUser,
                pass: smtpPassword,
            },
        });

    const result =
        await transporter.sendMail({
            from: sender,
            to: recipient,

            ...(email
                ? {
                    replyTo: email,
                }
                : {}),

            subject:
                `Новая покупка: ${subjectProduct} — ${orderCode}`,

            text: [
                "Новая покупка на сайте Algo World",
                "",
                `Бот: ${productText}`,
                `Сумма: ${formattedAmount}`,
                `Способ оплаты: ${payCurrency.toUpperCase()}`,
                `Покупатель: ${customerName || "Не указан"}`,
                `Email: ${email || "Не указан"}`,
                `Номер заказа: ${orderCode}`,
                `Payment ID: ${paymentId}`,
            ].join("\n"),

            html: `
                <div style="
                    max-width: 620px;
                    margin: 0 auto;
                    padding: 32px;
                    background: #f3f3f3;
                    font-family: Arial, sans-serif;
                    color: #222222;
                ">
                    <div style="
                        padding: 32px;
                        background: #ffffff;
                        border-radius: 16px;
                    ">
                        <h1 style="
                            margin: 0 0 24px;
                            font-size: 24px;
                            line-height: 32px;
                        ">
                            ✅ Новая покупка Algo World
                        </h1>

                        <p>
                            <strong>Бот:</strong>
                            ${escapeHtml(productText)}
                        </p>

                        <p>
                            <strong>Сумма:</strong>
                            ${escapeHtml(formattedAmount)}
                        </p>

                        <p>
                            <strong>Способ оплаты:</strong>
                            ${escapeHtml(payCurrency.toUpperCase())}
                        </p>

                        <p>
                            <strong>Покупатель:</strong>
                            ${escapeHtml(customerName || "Не указан")}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            <a href="mailto:${escapeHtml(email)}">
                                ${escapeHtml(email || "Не указан")}
                            </a>
                        </p>

                        <hr style="
                            margin: 24px 0;
                            border: 0;
                            border-top: 1px solid #e5e5e5;
                        ">

                        <p>
                            <strong>Номер заказа:</strong>
                            <code>${escapeHtml(orderCode)}</code>
                        </p>

                        <p>
                            <strong>Payment ID:</strong>
                            <code>${escapeHtml(paymentId)}</code>
                        </p>
                    </div>
                </div>
            `,
        });

    if (!result.messageId) {
        throw new Error(
            "Zoho SMTP did not return a message ID",
        );
    }

    return {
        messageId: result.messageId,
    };
}