"use client";

import React, {useEffect, useRef, useState} from "react";
import {clearReferralCode} from "@/lib/referral";
import {useCart} from "@/components/cartPopup/CartProvider";
import {useLanguage} from "@/context/LanguageProvider";
import "./paymentFlow.css"

type Customer = {
    firstName: string; lastName: string; email: string; referralCode: string;
    deliveryLanguage: "en" | "ru"; existingCustomer: boolean;
    verificationRef?: string; checkoutReference: string;
};
type SuccessProduct = { id: string; name: string; imageSrc?: string };
type Session = { products?: SuccessProduct[]; token: string; paymentUrl: string | null; state?: string; orderCode: string; testMode: boolean };
function validPaymentUrl(value: unknown): value is string {
    if (typeof value !== "string") return false;
    try {
        const u = new URL(value);
        return u.protocol === "https:" && !u.username && !u.password && !u.port &&
            (u.hostname === "tribute.tg" || u.hostname.endsWith(".tribute.tg"));
    } catch { return false; }
}
const copy = {
    EN: {
        legacy: "This order was created through the previous Telegram flow. Use its original bot link or contact support. Do not create a second payment.",
        creating: "Preparing your payment. Please wait.",
        pending: "Your order is ready. Proceed to payment through Tribute.",
        title: "Pay with Tribute",
        start: "Prepare order",
        bot: "Proceed to payment",
        close: "Close",
        busy: "Preparing…",
        created: "Prepare your order to pay securely through Tribute.",
        bound: "Complete payment on the Tribute page and return here.",
        processing: "Payment is being verified.",
        paid: "Payment confirmed. Your license will be delivered through the usual order process.",
        test_paid: "Test event processed. No payment was recorded in CML and no license was activated.",
        manual_review: "This payment needs support review. Do not pay again.",
        test: "Checkout is disabled in test mode. No payment will be created.",
        unsupported: "Tribute currently supports a single Aero license. Use crypto for other products or a mixed cart.",
        error: "Unable to prepare the payment. Please try again.",
        statusError: "Unable to check status. Retrying…",
        restoreError: "Unable to restore this order. Contact support with your order number.",
        order: "Order"
    },
    RU: {
        legacy: "Заказ создан через прежнюю схему с Telegram. Используйте исходную ссылку в боте или обратитесь в поддержку. Не создавайте вторую оплату.",
        creating: "Подготавливаем оплату. Подождите.",
        pending: "Заказ готов. Перейдите к оплате через Tribute.",
        title: "Оплата через Tribute",
        start: "Подготовить заказ",
        bot: "Перейти к оплате",
        close: "Закрыть",
        busy: "Подготовка…",
        created: "Подготовьте заказ для оплаты через Tribute.",
        bound: "Завершите оплату на странице Tribute и вернитесь сюда.",
        processing: "Проверяем платёж.",
        paid: "Оплата подтверждена. Лицензия будет выдана обычным способом обработки заказов.",
        test_paid: "Тестовое событие обработано. Оплата в CML не записана, лицензия не активирована.",
        manual_review: "Нужна проверка платежа поддержкой. Не оплачивайте повторно.",
        test: "В тестовом режиме создание оплаты отключено.",
        unsupported: "Через Tribute пока доступна одна лицензия Aero. Для других товаров и смешанной корзины используйте криптооплату.",
        error: "Не удалось подготовить оплату. Попробуйте ещё раз.",
        statusError: "Не удалось проверить статус. Повторяем…",
        restoreError: "Не удалось восстановить заказ. Обратитесь в поддержку с номером заказа.",
        order: "Заказ"
    },
    UA: {
        legacy: "Замовлення створене через попередню схему з Telegram. Скористайтеся початковим посиланням у боті або зверніться до підтримки. Не створюйте другу оплату.",
        creating: "Готуємо оплату. Зачекайте.",
        pending: "Замовлення готове. Перейдіть до оплати через Tribute.",
        title: "Оплата через Tribute",
        start: "Підготувати замовлення",
        bot: "Перейти до оплати",
        close: "Закрити",
        busy: "Підготовка…",
        created: "Підготуйте замовлення для оплати через Tribute.",
        bound: "Завершіть оплату на сторінці Tribute та поверніться сюди.",
        processing: "Перевіряємо платіж.",
        paid: "Оплату підтверджено. Ліцензію буде надано звичайним способом обробки замовлень.",
        test_paid: "Тестову подію оброблено. Оплату в CML не записано, ліцензію не активовано.",
        manual_review: "Платіж потребує перевірки підтримкою. Не оплачуйте повторно.",
        test: "У тестовому режимі створення оплати вимкнено.",
        unsupported: "Через Tribute поки доступна одна ліцензія Aero. Для інших товарів і змішаного кошика використовуйте криптооплату.",
        error: "Не вдалося підготувати оплату. Спробуйте ще раз.",
        statusError: "Не вдалося перевірити статус. Повторюємо…",
        restoreError: "Не вдалося відновити замовлення. Зверніться до підтримки з номером замовлення.",
        order: "Замовлення"
    },
};
export default function TributePaymentFlow({isOpen, onClose, customer, items, recoveryToken}: {
    isOpen: boolean; onClose: () => void; customer: Customer;
    items: { id: string; quantity: number }[];
    recoveryToken?: string;
}) {
    const {language} = useLanguage();
    const {items: cartItems} = useCart();
    const redirected = useRef(false);
    const successProducts = useRef<SuccessProduct[]>([]);
    const t = copy[language];
    const [session, setSession] = useState<Session | null>(null);
    const [state, setState] = useState("created");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const inFlight = useRef(false);
    const supported = items.length === 1 && items[0].id === "aero-ea" && items[0].quantity === 1;
    const key = recoveryToken ? `aw_tribute_shop_recovery_v1:${recoveryToken.slice(0, 32)}` :
        `aw_tribute_shop_session_v1:${customer.checkoutReference}:${customer.deliveryLanguage}`;
    useEffect(() => {
        setSession(null);
        setState("created");
        setError("");
        redirected.current = false;
        // Keep a snapshot for the thank-you popup, including restored checkouts.
        let savedItems: any[] = [];
        try {
            const checkout = JSON.parse(localStorage.getItem("algo_world_checkout_v1") ?? "null");
            if (Array.isArray(checkout?.items)) savedItems = checkout.items;
        } catch { /* Product metadata is only for display. */
        }
        successProducts.current = items.map(item => {
            const details = savedItems.find(p => p.id === item.id) ?? cartItems.find(p => p.id === item.id);
            return {id: item.id, name: details?.name ?? "Aero", imageSrc: details?.imageSrc};
        });
        if (recoveryToken) return;
        try {
            const value = JSON.parse(sessionStorage.getItem(key) ?? "null");
            if (value && typeof value.token === "string" && (value.paymentUrl === null || validPaymentUrl(value.paymentUrl)) && typeof value.orderCode === "string" &&
                value.testMode === false) {
                setSession(value);
                setState(value.state ?? "pending");
                if (Array.isArray(value.products) && value.products.length === items.length &&
                    value.products.every((p: any, i: number) => p?.id === items[i].id && typeof p.name === "string")) {
                    successProducts.current = value.products;
                }
            }
        } catch { /* Storage is optional; the server still controls payment state. */
        }
    }, [key, recoveryToken]);
    useEffect(() => {
        if (!recoveryToken || !isOpen) return;
        let cancelled = false;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;
        const controller = new AbortController();
        setBusy(true);
        setError("");
        async function restore() {
            try {
                const response = await fetch("/api/payments/tribute-shop/restore", {
                    headers: { Authorization: `Bearer ${recoveryToken}` }, cache: "no-store", signal: controller.signal,
                });
                if (response.status === 404) {
                    if (!cancelled) setError(t.restoreError);
                    return;
                }
                const result = await response.json();
                if (!response.ok || result.success !== true || result.session?.token !== recoveryToken ||
                    typeof result.session.orderCode !== "string" || (result.session.paymentUrl !== null && !validPaymentUrl(result.session.paymentUrl)) ||
                    typeof result.session.testMode !== "boolean") throw new Error("Restore failed");
                if (cancelled) return;
                setSession({ ...result.session, products: [{ id: "aero-ea", name: "Aero", imageSrc: cartItems.find(p => p.id === "aero-ea")?.imageSrc }] });
                successProducts.current = [{ id: "aero-ea", name: "Aero", imageSrc: cartItems.find(p => p.id === "aero-ea")?.imageSrc }];
                setState(result.state);
            } catch {
                if (!cancelled) {
                    setError(t.statusError);
                    retryTimer = setTimeout(() => { void restore(); }, 5000);
                }
            } finally {
                if (!cancelled) setBusy(false);
            }
        }
        void restore();
        return () => { cancelled = true; clearTimeout(retryTimer); controller.abort(); };
    }, [recoveryToken, isOpen, t.statusError, t.restoreError]);
    useEffect(() => {
        if (!isOpen || !session) return;
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout>;
        const controller = new AbortController();
        const poll = async () => {
            try {
                const response = await fetch("/api/payments/tribute-shop/status", {
                    headers: {Authorization: `Bearer ${session.token}`}, cache: "no-store", signal: controller.signal,
                });
                if (response.status === 404) {
                    if (!cancelled) {
                        setSession(null);
                        sessionStorage.removeItem(key);
                    }
                    return;
                }
                if (!response.ok) throw new Error("Status unavailable");
                const result = await response.json();
                if (cancelled) return;
                if (result.success !== true || result.orderCode !== session.orderCode ||
                    result.testMode !== session.testMode) throw new Error("Unexpected payment status");
                setState(result.state);
                setError("");
                if (result.state === "paid" && result.testMode === false && !redirected.current) {
                    redirected.current = true;
                    // Match the existing crypto success contract consumed on the home page.
                    try {
                        sessionStorage.setItem("algo_world_payment_success_v1", JSON.stringify({
                            orderCode: result.orderCode,
                            products: successProducts.current,
                            completedAt: Date.now(),
                        }));
                    } catch {
                        console.error("TRIBUTE SUCCESS DISPLAY DATA NOT SAVED");
                    }
                    try {
                        clearReferralCode();
                    } catch { /* Do not block a confirmed payment. */
                    }
                    for (const storageKey of ["checkoutCustomer", "checkoutReview", "algo_world_pending_crypto_order_v1", "currentPayment", "aw_tribute_return_token_v1", key]) {
                        try {
                            sessionStorage.removeItem(storageKey);
                        } catch { /* best effort */
                        }
                    }
                    try {
                        localStorage.removeItem("algo_world_checkout_v1");
                    } catch { /* best effort */
                    }
                    window.location.replace("/?payment=success");
                    return;
                }
                if (["paid", "test_paid", "manual_review"].includes(result.state)) return;
            } catch {
                if (!cancelled) setError(t.statusError);
            }
            if (!cancelled) timer = setTimeout(poll, 5000);
        };
        void poll();
        return () => {
            cancelled = true;
            clearTimeout(timer);
            controller.abort();
        };
    }, [isOpen, session, key, t.statusError]);

    async function start() {
        if (recoveryToken || !supported || inFlight.current) return;
        inFlight.current = true;
        setBusy(true);
        setError("");
        try {
            const response = await fetch("/api/checkout", {
                method: "POST", headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    action: "create-order", paymentProvider: "tribute", ...customer,
                    items: [{productCode: "aero-ea", quantity: 1}]
                }),
            });
            const result = await response.json();
            if (!response.ok || !result.success || !result.tribute?.token || (result.tribute.paymentUrl !== null && !validPaymentUrl(result.tribute.paymentUrl))) throw new Error(result.error || t.error);
            const prepared: Session = {...result.tribute, products: successProducts.current};
            setSession(prepared);
            setState(prepared.state ?? "pending");
            try {
                sessionStorage.setItem(key, JSON.stringify(prepared));
            } catch { /* optional */
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : t.error);
        } finally {
            inFlight.current = false;
            setBusy(false);
        }
    }

    if (!isOpen) return null;
    const message = t[state as keyof typeof t] ?? t.created;
    return (
        <div className="tribute-payment-popup" onClick={onClose}>
            <section
                className="tribute-payment-popup-window"
                role="dialog"
                aria-modal="true"
                aria-labelledby="tribute-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id="tribute-title">{t.title}</h3>

                {recoveryToken && !session ? (
                    <div className="tribute-payment-prepare">
                        <p aria-live="polite">{busy ? t.busy : t.restoreError}</p>
                        <button type="button" className="tribute-payment-close" onClick={onClose}>{t.close}</button>
                    </div>
                ) : !supported && !recoveryToken ? (
                    <div className="tribute-payment-unsupported">
                        <p>{t.unsupported}</p>
                    </div>
                ) : session ? (
                    <div className="tribute-payment-created">
                        {session.testMode && (
                            <p className="tribute-payment-test">{t.test}</p>
                        )}

                        <p className="tribute-payment-order">
                            {t.order}: {session.orderCode}
                        </p>

                        <p
                            className={`tribute-payment-status tribute-payment-status--${state}`}
                            aria-live="polite"
                        >
                            {message}
                        </p>

                        {["pending"].includes(state) && session.paymentUrl !== null && (
                            <div className="tribute-payment-prepare">
                                <a href={session.paymentUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="open_telegram_link">
                                    {t.bot}
                                </a>

                                <button type="button" className="tribute-payment-close" onClick={onClose}>
                                    {t.close}
                                </button>
                            </div>

                        )}
                        {!(state === "pending" && session.paymentUrl !== null) && (
                            <div className="tribute-payment-prepare">
                                <button type="button" className="tribute-payment-close" onClick={onClose}>{t.close}</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="tribute-payment-prepare">
                        <button
                            type="button"
                            className="tribute-payment-start"
                            disabled={busy}
                            onClick={start}
                        >
                            {busy ? t.busy : t.start}
                        </button>
                        <button
                            type="button"
                            className="tribute-payment-close"
                            onClick={onClose}
                        >
                            {t.close}
                        </button>

                    </div>
                )}


                {error && (
                    <p className="tribute-payment-error" role="alert">
                        {error}
                    </p>
                )}


            </section>
        </div>
    );
}
