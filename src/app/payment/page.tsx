"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Payment {
    id: string;
    status: string;
    payAddress: string;
    payAmount: number;
    payCurrency: string;
    priceAmount: number;
    priceCurrency: string;
}

interface CheckoutItem {
    id: string;
    name: string;
    subtitle?: string;
    imageSrc?: string;
    unitPrice: number;
    quantity: number;
}

interface CheckoutOrder {
    items: CheckoutItem[];
    currency: string;
    subtotal: number;
    discount: number;
    total: number;
    savedAt: number;
}

const PAYMENT_STORAGE_KEY = "currentPayment";
const CHECKOUT_STORAGE_KEY = "algo_world_checkout_v1";
const FINAL_STATUSES = new Set(["finished", "failed", "expired", "refunded"]);

function isPayment(value: unknown): value is Payment {
    if (!value || typeof value !== "object") return false;
    const payment = value as Partial<Payment>;

    return (
        typeof payment.id === "string" &&
        typeof payment.status === "string" &&
        typeof payment.payAddress === "string" &&
        typeof payment.payAmount === "number" &&
        typeof payment.payCurrency === "string" &&
        typeof payment.priceAmount === "number" &&
        typeof payment.priceCurrency === "string"
    );
}

function isCheckoutOrder(value: unknown): value is CheckoutOrder {
    if (!value || typeof value !== "object") return false;
    const order = value as Partial<CheckoutOrder>;

    return (
        Array.isArray(order.items) &&
        order.items.length > 0 &&
        typeof order.currency === "string" &&
        typeof order.subtotal === "number" &&
        typeof order.discount === "number" &&
        typeof order.total === "number"
    );
}

export default function PaymentPage() {
    const [payment, setPayment] = useState<Payment | null>(null);
    const [checkout, setCheckout] = useState<CheckoutOrder | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [copied, setCopied] = useState(false);
    const copyTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        try {
            const storedPayment = sessionStorage.getItem(PAYMENT_STORAGE_KEY);
            const storedCheckout = localStorage.getItem(CHECKOUT_STORAGE_KEY);

            if (storedPayment) {
                const parsedPayment: unknown = JSON.parse(storedPayment);
                if (isPayment(parsedPayment)) setPayment(parsedPayment);
            }

            if (storedCheckout) {
                const parsedCheckout: unknown = JSON.parse(storedCheckout);
                if (isCheckoutOrder(parsedCheckout)) setCheckout(parsedCheckout);
            }
        } catch (error) {
            console.error("STORAGE ERROR:", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!payment?.id || FINAL_STATUSES.has(payment.status)) return;

        const checkStatus = async () => {
            try {
                const response = await fetch(
                    `/api/payments/nowpayments/status?paymentId=${encodeURIComponent(payment.id)}`,
                    { cache: "no-store" },
                );

                if (!response.ok) {
                    throw new Error(`Status request failed: ${response.status}`);
                }

                const data = await response.json();
                if (typeof data.payment_status !== "string") return;

                setPayment(previous => {
                    if (!previous) return previous;
                    const next = { ...previous, status: data.payment_status };
                    sessionStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(next));
                    return next;
                });
            } catch (error) {
                console.error("STATUS ERROR:", error);
            }
        };

        const interval = window.setInterval(checkStatus, 5000);
        return () => window.clearInterval(interval);
    }, [payment?.id, payment?.status]);

    useEffect(() => () => {
        if (copyTimeoutRef.current !== null) {
            window.clearTimeout(copyTimeoutRef.current);
        }
    }, []);

    const formatter = useMemo(() => new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: checkout?.currency || "USD",
        maximumFractionDigits: 2,
    }), [checkout?.currency]);

    const formatPrice = (value: number) => formatter.format(value);

    const copyAddress = async () => {
        if (!payment) return;

        try {
            await navigator.clipboard.writeText(payment.payAddress);
            setCopied(true);

            if (copyTimeoutRef.current !== null) {
                window.clearTimeout(copyTimeoutRef.current);
            }

            copyTimeoutRef.current = window.setTimeout(() => {
                setCopied(false);
                copyTimeoutRef.current = null;
            }, 1500);
        } catch (error) {
            console.error("COPY ERROR:", error);
        }
    };

    if (!isLoaded) {
        return <main className="payment_page">Loading...</main>;
    }

    if (!payment || !checkout) {
        return <main className="payment_page">Order not found</main>;
    }

    return (
        <main className="payment_page">
            <div className="payment_page_container">
                <section className="payment_card">
                    <h1>Complete payment</h1>

                    <div>
                        {payment.priceAmount} {payment.priceCurrency.toUpperCase()}
                    </div>

                    <p>Send exactly</p>

                    <strong>
                        {payment.payAmount} {payment.payCurrency.toUpperCase()}
                    </strong>

                    <div className="payment_qr">
                        <QRCodeSVG value={payment.payAddress} size={200} />
                    </div>

                    <div className="payment_address">{payment.payAddress}</div>

                    <button type="button" onClick={copyAddress}>
                        {copied ? "COPIED" : "COPY ADDRESS"}
                    </button>

                    <div>Status: {payment.status}</div>
                </section>

                <aside className="checkout_summary">
                    <div className="checkout_summary_head">
                        <h2>Order summary</h2>
                        <div>{formatPrice(checkout.total)}</div>
                    </div>

                    <div className="checkout_summary_label">ORDER SUMMARY</div>

                    <ul className="checkout_items">
                        {checkout.items.map(item => (
                            <li key={item.id} className="checkout_item">
                                <div className="checkout_item_image">
                                    {item.imageSrc ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.imageSrc} alt="" />
                                    ) : (
                                        <div className="checkout_image_placeholder" />
                                    )}
                                </div>

                                <div className="checkout_item_info">
                                    <strong>{item.name}</strong>
                                    {item.subtitle && <span>{item.subtitle}</span>}
                                    {item.quantity > 1 && <span>Quantity: {item.quantity}</span>}
                                </div>

                                <div className="checkout_item_price">
                                    {formatPrice(item.unitPrice * item.quantity)}
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="checkout_totals">
                        <div>
                            <span>Subtotal</span>
                            <span>{formatPrice(checkout.subtotal)}</span>
                        </div>

                        <div>
                            <span>Discount</span>
                            <span>{formatPrice(checkout.discount)}</span>
                        </div>

                        <div className="checkout_total">
                            <span>Total</span>
                            <strong>{formatPrice(checkout.total)}</strong>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
