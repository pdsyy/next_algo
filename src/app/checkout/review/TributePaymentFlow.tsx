"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";

type Customer = {
    firstName: string; lastName: string; email: string; referralCode: string;
    deliveryLanguage: "en" | "ru"; existingCustomer: boolean;
    verificationRef?: string; checkoutReference: string;
};
type Session = { token: string; botUrl: string; orderCode: string; testMode: boolean };
const copy = {
    EN: { title: "Pay with Tribute", start: "Prepare order", bot: "Open Telegram", close: "Close", busy: "Preparing…",
        created: "Open Telegram and press Start to link this order.", bound: "Telegram linked. Complete payment using the button in the bot, then return here.",
        processing: "Payment is being verified.", paid: "Payment confirmed. Your license will be delivered through the usual order process.",
        test_paid: "Test event processed. No payment was recorded in CML and no license was activated.",
        manual_review: "This payment needs support review. Do not pay again.", test: "TEST MODE: payment and license activation are disabled.",
        unsupported: "Tribute currently supports a single Aero license. Use crypto for other products or a mixed cart.", error: "Unable to prepare the payment. Please try again.",
        statusError: "Unable to check status. Retrying…", order: "Order" },
    RU: { title: "Оплата через Tribute", start: "Подготовить заказ", bot: "Открыть Telegram", close: "Закрыть", busy: "Подготовка…",
        created: "Откройте Telegram и нажмите «Начать», чтобы привязать заказ.", bound: "Telegram привязан. Оплатите кнопкой в боте с этого же аккаунта и вернитесь сюда.",
        processing: "Проверяем платёж.", paid: "Оплата подтверждена. Лицензия будет выдана обычным способом обработки заказов.",
        test_paid: "Тестовое событие обработано. Оплата в CML не записана, лицензия не активирована.",
        manual_review: "Нужна проверка платежа поддержкой. Не оплачивайте повторно.", test: "ТЕСТОВЫЙ РЕЖИМ: оплата и активация лицензии отключены.",
        unsupported: "Через Tribute пока доступна одна лицензия Aero. Для других товаров и смешанной корзины используйте криптооплату.", error: "Не удалось подготовить оплату. Попробуйте ещё раз.",
        statusError: "Не удалось проверить статус. Повторяем…", order: "Заказ" },
    UA: { title: "Оплата через Tribute", start: "Підготувати замовлення", bot: "Відкрити Telegram", close: "Закрити", busy: "Підготовка…",
        created: "Відкрийте Telegram і натисніть «Почати», щоб прив’язати замовлення.", bound: "Telegram прив’язано. Оплатіть кнопкою в боті з цього ж акаунта та поверніться сюди.",
        processing: "Перевіряємо платіж.", paid: "Оплату підтверджено. Ліцензію буде надано звичайним способом обробки замовлень.",
        test_paid: "Тестову подію оброблено. Оплату в CML не записано, ліцензію не активовано.",
        manual_review: "Платіж потребує перевірки підтримкою. Не оплачуйте повторно.", test: "ТЕСТОВИЙ РЕЖИМ: оплату й активацію ліцензії вимкнено.",
        unsupported: "Через Tribute поки доступна одна ліцензія Aero. Для інших товарів і змішаного кошика використовуйте криптооплату.", error: "Не вдалося підготувати оплату. Спробуйте ще раз.",
        statusError: "Не вдалося перевірити статус. Повторюємо…", order: "Замовлення" },
};
export default function TributePaymentFlow({ isOpen, onClose, customer, items }: {
    isOpen: boolean; onClose: () => void; customer: Customer;
    items: { id: string; quantity: number }[];
}) {
    const { language } = useLanguage();
    const t = copy[language];
    const [session, setSession] = useState<Session | null>(null);
    const [state, setState] = useState("created");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const inFlight = useRef(false);
    const supported = items.length === 1 && items[0].id === "aero-ea" && items[0].quantity === 1;
    const key = `aw_tribute_session_v1:${customer.checkoutReference}:${customer.deliveryLanguage}`;
    useEffect(() => {
        setSession(null); setState("created"); setError("");
        try {
            const value = JSON.parse(sessionStorage.getItem(key) ?? "null");
            if (value && typeof value.token === "string" && typeof value.botUrl === "string" && typeof value.orderCode === "string" &&
                /^https:\/\/t\.me\/algoworldordersbot\?start=/.test(value.botUrl)) setSession(value);
        } catch { /* Storage is optional; the server still controls payment state. */ }
    }, [key]);
    useEffect(() => {
        if (!isOpen || !session) return;
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout>;
        const controller = new AbortController();
        const poll = async () => {
            try {
                const response = await fetch("/api/payments/tribute/status", {
                    headers: { Authorization: `Bearer ${session.token}` }, cache: "no-store", signal: controller.signal,
                });
                if (response.status === 404) {
                    if (!cancelled) { setSession(null); sessionStorage.removeItem(key); }
                    return;
                }
                if (!response.ok) throw new Error("Status unavailable");
                const result = await response.json();
                if (cancelled) return;
                setState(result.state); setError("");
                if (["paid", "test_paid", "manual_review"].includes(result.state)) return;
            } catch {
                if (!cancelled) setError(t.statusError);
            }
            if (!cancelled) timer = setTimeout(poll, 5000);
        };
        void poll();
        return () => { cancelled = true; clearTimeout(timer); controller.abort(); };
    }, [isOpen, session, key, t.statusError]);
    async function start() {
        if (!supported || inFlight.current) return;
        inFlight.current = true; setBusy(true); setError("");
        try {
            const response = await fetch("/api/checkout", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "create-order", paymentProvider: "tribute", ...customer,
                    items: [{ productCode: "aero-ea", quantity: 1 }] }),
            });
            const result = await response.json();
            if (!response.ok || !result.success || !result.tribute?.token) throw new Error(result.error || t.error);
            setSession(result.tribute); setState("created");
            try { sessionStorage.setItem(key, JSON.stringify(result.tribute)); } catch { /* optional */ }
        } catch (e) { setError(e instanceof Error ? e.message : t.error); }
        finally { inFlight.current = false; setBusy(false); }
    }
    if (!isOpen) return null;
    const message = t[state as keyof typeof t] ?? t.created;
    return (
        <div style={{ position: "fixed", inset: 0, background: "#0008", zIndex: 10000, display: "grid", placeItems: "center", padding: 16 }}>
            <section role="dialog" aria-modal="true" aria-labelledby="tribute-title" style={{ background: "white", color: "#232323", borderRadius: 24, padding: 28, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
                <h2 id="tribute-title">{t.title}</h2>
                {!supported ? <p>{t.unsupported}</p> : <>
                    {session?.testMode && <p style={{ color: "#996000" }}>{t.test}</p>}
                    {session ? <>
                        <p>{t.order}: {session.orderCode}</p>
                        <p aria-live="polite">{message}</p>
                        {["created", "bound"].includes(state) && <a href={session.botUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "12px 18px", background: "#232323", color: "white", borderRadius: 12 }}>{t.bot}</a>}
                    </> : <button type="button" disabled={busy} onClick={start}>{busy ? t.busy : t.start}</button>}
                </>}
                {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}
                <div style={{ marginTop: 20 }}><button type="button" onClick={onClose}>{t.close}</button></div>
            </section>
        </div>
    );
}
