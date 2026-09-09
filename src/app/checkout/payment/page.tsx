"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cartPopup/CartProvider";
import { useLanguage } from "@/context/LanguageProvider";
import styles from "./payment.module.css";
import bottom_lines from "@/app/images/bottom_lines_video_block.svg";
import top_lines from "@/app/images/video_block_top_lines.svg";
import tron_icon from "../images/tron_icon.svg";
import usdc_icon from "../images/usdc_icon.svg";
import tether_eth_icon from "../images/tether_eth_icon.svg";
import tether_bnb_icon from "../images/tether_bnb_icon.svg";
import "../checkout.css";
import Image, {StaticImageData} from "next/image";

const CUSTOMER_STORAGE_KEY = "checkoutCustomer";
const PENDING_ORDER_KEY = "algo_world_pending_crypto_order_v1";
const PAYMENT_STORAGE_KEY = "currentPayment";
const CHECKOUT_STORAGE_KEY = "algo_world_checkout_v1";
const PRODUCT_CODES: Record<string, string> = {
    "terra-ea": "terra-ea",
    "aero-ea": "aero-ea",
    "hydro-ea": "hydro-ea",
};

type PayCurrency = "usdttrc20" | "usdc" | "usdtbsc" | "usdterc20";
type Customer = { firstName: string; lastName: string; email: string };
type PendingOrder = {
    orderCode: string;
    fingerprint: string;
    amount: number;
    currency: string;
};

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
    const { t } = useLanguage();
    const text = t.checkoutPayment;
    const { items, isHydrated } = useCart();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [payCurrency, setPayCurrency] = useState<PayCurrency>("usdttrc20");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const currencies: Array<{ value: PayCurrency; title: string; text: string, image: string | StaticImageData }> = [
        {
            value: "usdttrc20",
            title: "USDT",
            text: text.currencies.usdtTrc20,
            image: tron_icon
        },
        {
            value: "usdc",
            title: "USDC",
            text: text.currencies.usdc,
            image: usdc_icon
        },
        {
            value: "usdtbsc",
            title: "USDT",
            text: text.currencies.usdtBep20,
            image: tether_bnb_icon
        },
        {
            value: "usdterc20",
            title: "USDT",
            text: text.currencies.usdtErc20,
            image: tether_eth_icon
        },
    ];

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
                    throw new Error(checkoutData.error || text.errors.createOrder);
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
                throw new Error(data.error || text.errors.createPayment);
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
            setError(reason instanceof Error ? reason.message : text.errors.paymentFailed);
        } finally {
            setBusy(false);
        }
    };

    if (!isHydrated || !loaded) {
        return <main className={styles.page}><div className={styles.state}>{text.loading}</div></main>;
    }

    if (
        !customer ||
        checkoutItems.length === 0 ||
        checkoutItems.length !== items.length
    ) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>
                    <h1>{text.invalidOrder.title}</h1>
                    <p>{text.invalidOrder.description}</p>
                    <button type="button" onClick={() => router.push("/checkout")}>{text.invalidOrder.button}</button>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className="top_lines_wrapper" aria-hidden="true">
                <img
                    src={top_lines.src}
                    alt=""
                    className="top_lines_video_block"
                />
            </div>
            <div className={styles.shell}>
                <a href="/" className={styles.home}>{text.mainPage}</a>
                <section className={styles.card}>
                    <header className={styles.header}>
                        <h1>{text.title}</h1>
                        <p>{text.description}</p>
                    </header>
                    <div className={styles.sectionTitle}>{text.paymentCurrency}</div>
                    <div className={styles.options}>
                        {currencies.map(currency => (
                            <label key={currency.value} className={`${styles.option} ${payCurrency === currency.value ? styles.active : ""}`}>
                                <input type="radio" name="currency" value={currency.value}
                                       checked={payCurrency === currency.value}
                                       onChange={() => setPayCurrency(currency.value)} />
                                <span className={styles.coin}><Image src={currency.image} alt=""/></span>
                                <span><strong>{currency.title}</strong><small>{currency.text}</small></span>
                                <i aria-hidden="true" />
                            </label>
                        ))}
                        {error && <p className={styles.error} role="alert">{error}</p>}
                    </div>
                    <footer className={styles.actions}>
                        <button type="button" className={styles.back} onClick={() => router.push("/checkout/review")} disabled={busy}>{text.back}</button>
                        <button type="button" className={styles.pay} onClick={startPayment} disabled={busy} aria-busy={busy}>
                            {busy ? text.creatingPayment : text.continueToPayment}
                        </button>
                    </footer>
                </section>
                <aside className={styles.summary}>
                    <header><h2>{text.order}</h2><p>{checkoutItems.length} {checkoutItems.length === 1 ? text.item : text.items} · ${previewTotal.toFixed(2)}</p></header>
                    <div className={styles.sectionTitle}>{text.orderSummary}</div>
                    {checkoutItems.map(item => (
                        <div className={styles.product} key={item.id}>
                            {item.imageSrc ? <img src={item.imageSrc} alt="" /> : <span>◇</span>}
                            <div><strong>{item.name}</strong><small>{text.oneLicense}</small></div>
                        </div>
                    ))}
                    <dl><div><dt>{text.total}</dt><dd>${previewTotal.toFixed(2)}</dd></div></dl>
                </aside>
            </div>
            <div className="bottom_lines_wrapper" aria-hidden="true">
                <img
                    src={bottom_lines.src}
                    alt=""
                    className="bottom_lines_video_block"
                />
            </div>
        </main>
    );
}