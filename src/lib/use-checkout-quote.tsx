"use client";
import { useEffect, useState } from "react";
import type { CheckoutQuote } from "./checkout-pricing";

type Item = { id: string; quantity?: number };
const messages = {
    EN: { loading: "Calculating price…", error: "Unable to calculate the price. Please try again.", retry: "Retry", unused: "This code does not give a discount for the selected products.", applied: "Promo code applied" },
    RU: { loading: "Рассчитываем стоимость…", error: "Не удалось рассчитать стоимость. Попробуйте ещё раз.", retry: "Повторить", unused: "Этот код не даёт скидку на выбранные товары.", applied: "Промокод применён" },
    UA: { loading: "Розраховуємо вартість…", error: "Не вдалося розрахувати вартість. Спробуйте ще раз.", retry: "Повторити", unused: "Цей код не дає знижку на вибрані товари.", applied: "Промокод застосовано" },
};
export function useCheckoutQuote(items: Item[], referralCode: string, deliveryLanguage: string) {
    const key = JSON.stringify({ items: items.map(item => ({ productCode: item.id, quantity: item.quantity ?? 1 })), referralCode: referralCode.trim(), deliveryLanguage });
    const [state, setState] = useState<{ key: string; quote?: CheckoutQuote; error?: boolean }>({ key: "" });
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        if (!JSON.parse(key).items.length) return;
        const controller = new AbortController();
        setState({ key });
        const timer = setTimeout(async () => {
            try {
                const response = await fetch("/api/checkout/preview", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: key, signal: controller.signal, cache: "no-store",
                });
                const data = await response.json();
                if (!response.ok || data.success !== true || !data.quote ||
                    ![data.quote.subtotal, data.quote.discount, data.quote.total].every(Number.isFinite)) throw new Error();
                if (!controller.signal.aborted) setState({ key, quote: data.quote });
            } catch {
                if (!controller.signal.aborted) setState({ key, error: true });
            }
        }, 350);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [key, attempt]);
    const quote = state.key === key ? state.quote : undefined;
    const error = state.key === key && state.error === true;
    return { quote, error, ready: Boolean(quote), retry: () => { setState({ key }); setAttempt(value => value + 1); } };
}
export function QuoteNotice({ pricing, language, code }: {
    pricing: ReturnType<typeof useCheckoutQuote>; language: string; code: string;
}) {
    const text = messages[language as keyof typeof messages] ?? messages.EN;
    return <div role="status" aria-live="polite" style={{ padding: "12px 0", fontSize: 14 }}>
        {pricing.error ? <>{text.error} <button type="button" onClick={pricing.retry}>{text.retry}</button></> :
            !pricing.ready ? text.loading : code.trim() ? pricing.quote!.discount > 0 ?
                `${text.applied}: ${code.trim()}` : text.unused : null}
    </div>;
}
