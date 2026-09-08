"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cartPopup/CartProvider";
import styles from "./payment.module.css";
import bottom_lines from "@/app/images/bottom_lines_video_block.svg";
import top_lines from "@/app/images/video_block_top_lines.svg";
import "../checkout.css"

const CUSTOMER_STORAGE_KEY = "checkoutCustomer";
const PENDING_ORDER_KEY = "algo_world_pending_crypto_order_v1";
const PAYMENT_STORAGE_KEY = "currentPayment";
const CHECKOUT_STORAGE_KEY = "algo_world_checkout_v1";
const PRODUCT_CODES: Record<string, string> = {
    "terra-ea": "terra-ea",
    "aero-ea": "aero-ea",
    "hydro-ea": "hydro-ea",
};

type PayCurrency = "usdttrc20" | "btc" | "eth";
type Customer = { firstName: string; lastName: string; email: string };
type PendingOrder = {
    orderCode: string;
    fingerprint: string;
    amount: number;
    currency: string;
};

const currencies: Array<{ value: PayCurrency; title: string; text: string }> = [
    { value: "usdttrc20", title: "USDT", text: "TRON network (TRC20)" },
    { value: "btc", title: "Bitcoin", text: "Bitcoin network" },
    { value: "eth", title: "Ethereum", text: "Ethereum network" },
];

function readCustomer(): Customer | null {
    try {
        const raw = sessionStorage.getItem(CUSTOMER_STORAGE_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw) as Partial<Customer>;
        if (!value.firstName || !value.lastName || !value.email) return null;
        return { firstName: value.firstName, lastName: value.lastName, email: value.email };
    } catch {
        return null;
    }
}

export default function CheckoutPaymentPage() {
    const router = useRouter();
    const { items, isHydrated } = useCart();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [payCurrency, setPayCurrency] = useState<PayCurrency>("usdttrc20");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setCustomer(readCustomer());
        setLoaded(true);
    }, []);

    const checkoutItems = useMemo(
        () => items.filter(item => PRODUCT_CODES[item.id]),
        [items],
    );
    const previewTotal = checkoutItems.reduce((sum, item) => sum + item.unitPrice, 0);
    const productFingerprint = checkoutItems
        .map(item => PRODUCT_CODES[item.id])
        .sort()
        .join(",");
    const fingerprint = customer
        ? `${customer.email.toLowerCase()}|${productFingerprint}`
        : "";

    const startPayment = async () => {
        if (!customer || checkoutItems.length === 0 || busy) return;
        setBusy(true);
        setError("");

        try {
            let pending: PendingOrder | null = null;
            const saved = sessionStorage.getItem(PENDING_ORDER_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as PendingOrder;
                if (parsed.fingerprint === fingerprint && parsed.orderCode) pending = parsed;
            }

            if (!pending) {
                const checkoutResponse = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: customer.email,
                        firstName: customer.firstName,
                        lastName: customer.lastName,
                        items: checkoutItems.map(item => ({
                            productCode: PRODUCT_CODES[item.id],
                            quantity: 1,
                        })),
                    }),
                });
                const checkoutData = await checkoutResponse.json();
                if (!checkoutResponse.ok || !checkoutData.success || !checkoutData.order?.code) {
                    throw new Error(checkoutData.error || "Could not create the order.");
                }
                pending = {
                    orderCode: String(checkoutData.order.code),
                    fingerprint,
                    amount: Number(checkoutData.order.amount),
                    currency: String(checkoutData.order.currency).toUpperCase(),
                };
                sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pending));
            }

            const response = await fetch("/api/payments/nowpayments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderCode: pending.orderCode, payCurrency }),
            });
            const data = await response.json();
            if (!response.ok || !data.success || !data.payment?.id) {
                throw new Error(data.error || "Could not create the crypto payment.");
            }

            localStorage.setItem(
                CHECKOUT_STORAGE_KEY,
                JSON.stringify({
                    items: checkoutItems.map(item => ({ ...item, quantity: 1 })),
                    currency: pending.currency,
                    subtotal: previewTotal,
                    discount: 0,
                    total: pending.amount,
                    savedAt: Date.now(),
                }),
            );

            sessionStorage.setItem(
                PAYMENT_STORAGE_KEY,
                JSON.stringify({ ...data.payment, orderCode: pending.orderCode }),
            );
            router.push("/payment");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Payment creation failed.");
        } finally {
            setBusy(false);
        }
    };

    if (!isHydrated || !loaded) {
        return <main className={styles.page}><div className={styles.state}>Loading…</div></main>;
    }

    if (
        !customer ||
        checkoutItems.length === 0 ||
        checkoutItems.length !== items.length
    ) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>
                    <h1>Order cannot be continued</h1>
                    <p>Please return to checkout and check your customer details and cart.</p>
                    <button type="button" onClick={() => router.push("/checkout")}>Back to checkout</button>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className="top_lines_wrapper">
                <img
                    src={top_lines.src}
                    alt=""
                    className="top_lines_video_block"
                />
            </div>
            <div className={styles.shell}>
                <a href="/" className={styles.home}>Main page</a>
                <section className={styles.card}>
                    <header className={styles.header}>
                        <h1>Pay with crypto</h1>
                        <p>Select the cryptocurrency you want to send.</p>
                    </header>
                    <div className={styles.sectionTitle}>PAYMENT CURRENCY</div>
                    <div className={styles.options}>
                        {currencies.map(currency => (
                            <label key={currency.value} className={`${styles.option} ${payCurrency === currency.value ? styles.active : ""}`}>
                                <input type="radio" name="currency" value={currency.value}
                                       checked={payCurrency === currency.value}
                                       onChange={() => setPayCurrency(currency.value)} />
                                <span className={styles.coin}>{currency.title.slice(0, 1)}</span>
                                <span><strong>{currency.title}</strong><small>{currency.text}</small></span>
                                <i aria-hidden="true" />
                            </label>
                        ))}
                        {error && <p className={styles.error} role="alert">{error}</p>}
                    </div>
                    <footer className={styles.actions}>
                        <button type="button" className={styles.back} onClick={() => router.push("/checkout/review")} disabled={busy}>Back</button>
                        <button type="button" className={styles.pay} onClick={startPayment} disabled={busy} aria-busy={busy}>
                            {busy ? "Creating payment…" : "Continue to payment"}
                        </button>
                    </footer>
                </section>
                <aside className={styles.summary}>
                    <header><h2>Order</h2><p>{checkoutItems.length} {checkoutItems.length === 1 ? "item" : "items"} · ${previewTotal.toFixed(2)}</p></header>
                    <div className={styles.sectionTitle}>ORDER SUMMARY</div>
                    {checkoutItems.map(item => (
                        <div className={styles.product} key={item.id}>
                            {item.imageSrc ? <img src={item.imageSrc} alt="" /> : <span>◇</span>}
                            <div><strong>{item.name}</strong><small>One license</small></div>
                        </div>
                    ))}
                    <dl><div><dt>Total</dt><dd>${previewTotal.toFixed(2)}</dd></div></dl>
                </aside>
            </div>
            <div className="bottom_lines_wrapper">
                <img
                    src={bottom_lines.src}
                    alt=""
                    className="bottom_lines_video_block"
                />
            </div>
        </main>
    );
}