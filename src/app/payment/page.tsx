"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./paymentStyle.css";
import top_lines from "@/app/images/video_block_top_lines.svg";
import bottom_lines from "@/app/images/bottom_lines_video_block.svg";

const PAYMENT_KEY = "currentPayment";
const CHECKOUT_KEY = "algo_world_checkout_v1";
const SUCCESS_KEY = "algo_world_payment_success_v1";
const FINAL_STATUSES = new Set(["finished", "failed", "expired", "refunded"]);

type Payment = {
    id: string;
    status: string;
    payAddress: string;
    payAmount: number;
    payCurrency: string;
    priceAmount: number;
    priceCurrency: string;
    orderCode?: string;
};

type Item = {
    id: string;
    name: string;
    subtitle?: string;
    imageSrc?: string;
    unitPrice: number;
    quantity: number;
};

type Checkout = {
    items: Item[];
    currency: string;
    subtotal: number;
    discount: number;
    total: number;
    savedAt: number;
};

const STATUS_TEXT: Record<string, string> = {
    waiting: "Waiting for payment",
    confirming: "Confirming payment",
    confirmed: "Payment confirmed",
    sending: "Processing payment",
    partially_paid: "Partially paid",
    finished: "Payment completed",
    failed: "Payment failed",
    expired: "Payment expired",
    refunded: "Payment refunded",
};

function getStatusKind(status: string) {
    if (status === "finished" || status === "confirmed") return "success";
    if (status === "failed" || status === "expired" || status === "refunded") return "error";
    return "pending";
}

export default function PaymentPage() {
    const [payment, setPayment] = useState<Payment | null>(null);
    const [checkout, setCheckout] = useState<Checkout | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [copied, setCopied] = useState(false);
    const redirected = useRef(false);

    useEffect(() => {
        try {
            const paymentRaw = sessionStorage.getItem(PAYMENT_KEY);
            const checkoutRaw = localStorage.getItem(CHECKOUT_KEY);
            if (paymentRaw) setPayment(JSON.parse(paymentRaw));
            if (checkoutRaw) setCheckout(JSON.parse(checkoutRaw));
        } catch (error) {
            console.error("PAYMENT STORAGE ERROR:", error);
        } finally {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!payment?.id || FINAL_STATUSES.has(payment.status)) return;

        let stopped = false;

        const checkStatus = async () => {
            try {
                const response = await fetch(
                    `/api/payments/nowpayments/status?paymentId=${encodeURIComponent(payment.id)}`,
                    { cache: "no-store" },
                );
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Unable to check payment status");
                }
                if (stopped || typeof data.payment_status !== "string") return;

                setPayment(previous => {
                    if (!previous) return previous;
                    const next = { ...previous, status: data.payment_status };
                    sessionStorage.setItem(PAYMENT_KEY, JSON.stringify(next));
                    return next;
                });
            } catch (error) {
                console.error("STATUS ERROR:", error);
            }
        };

        void checkStatus();
        const timer = window.setInterval(checkStatus, 5000);

        return () => {
            stopped = true;
            window.clearInterval(timer);
        };
    }, [payment?.id, payment?.status]);

    useEffect(() => {
        if (payment?.status !== "finished" || redirected.current) return;

        redirected.current = true;
        const successItems = checkout?.items ?? [];

        sessionStorage.setItem(
            SUCCESS_KEY,
            JSON.stringify({
                orderCode: payment.orderCode || "",
                products: successItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    imageSrc: item.imageSrc,
                })),
                completedAt: Date.now(),
            }),
        );

        window.location.replace("/?payment=success");
    }, [payment?.status, payment?.orderCode, checkout]);

    const formatter = useMemo(
        () =>
            new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: (checkout?.currency || payment?.priceCurrency || "USD").toUpperCase(),
                maximumFractionDigits: 2,
            }),
        [checkout?.currency, payment?.priceCurrency],
    );

    const copyAddress = async () => {
        if (!payment) return;
        await navigator.clipboard.writeText(payment.payAddress);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    if (!loaded) {
        return (
            <main className="payment_page">
                <div className="payment_state">Loading payment…</div>
            </main>
        );
    }

    if (!payment) {
        return (
            <main className="payment_page">
                <div className="payment_state">
                    <h1>Payment not found</h1>
                    <p>Please return to checkout and create a new payment.</p>
                    <a href="/checkout">Return to checkout</a>
                </div>
            </main>
        );
    }

    const statusKind = getStatusKind(payment.status);
    const statusText = STATUS_TEXT[payment.status] || payment.status;

    return (
        <main className="payment_page">
            <div className="top_lines_wrapper">
                <img
                    src={top_lines.src}
                    alt=""
                    className="top_lines_video_block"
                />
            </div>
            <div className="payment_page_container">
                <a href="/" className="payment_home">Main page</a>

                <section className="payment_card">
                    <header className="payment_card_header">
                        <div>
                            <h1>Complete payment</h1>
                            <p>Send the exact amount to the address below.</p>
                        </div>
                        <span className={`payment_status payment_status_${statusKind}`}>
                            <i aria-hidden="true" />
                            {statusText}
                        </span>
                    </header>

                    <div className="payment_section_title">PAYMENT DETAILS</div>

                    <div className="payment_card_body">
                        {payment.orderCode && (
                            <div className="payment_order_number">
                                <span>Order number</span>
                                <strong>#{payment.orderCode}</strong>
                            </div>
                        )}

                        <div className="payment_amount">
                            <span>Send exactly</span>
                            <strong>
                                {payment.payAmount} {payment.payCurrency.toUpperCase()}
                            </strong>
                            <small>{formatter.format(payment.priceAmount)}</small>
                        </div>

                        <div className="payment_qr">
                            <QRCodeSVG value={payment.payAddress} size={190} />
                        </div>

                        <div className="payment_address_block">
                            <span>Payment address</span>
                            <div className="payment_address_row">
                                <code>{payment.payAddress}</code>
                                <button type="button" onClick={copyAddress}>
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <p className="payment_notice">
                            Send only {payment.payCurrency.toUpperCase()} using the selected network.
                            Sending another asset or using another network may result in permanent loss.
                        </p>
                    </div>
                </section>

                {checkout && (
                    <aside className="checkout_summary">
                        <header className="checkout_summary_head">
                            <h2>Order summary</h2>
                            <p>
                                {checkout.items.length} {checkout.items.length === 1 ? "item" : "items"}
                                {" · "}{formatter.format(checkout.total)}
                            </p>
                        </header>

                        <div className="checkout_summary_label">ORDER SUMMARY</div>

                        <ul className="checkout_items">
                            {checkout.items.map(item => (
                                <li key={item.id} className="checkout_item">
                                    <div className="checkout_item_image">
                                        {item.imageSrc ? (
                                            <img src={item.imageSrc} alt="" />
                                        ) : (
                                            <div className="checkout_image_placeholder">◇</div>
                                        )}
                                    </div>
                                    <div className="checkout_item_info">
                                        <strong>{item.name}</strong>
                                        {item.subtitle && <span>{item.subtitle}</span>}
                                    </div>
                                    <div className="checkout_item_price">
                                        {formatter.format(item.unitPrice)}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <dl className="checkout_totals">
                            <div>
                                <dt>Subtotal</dt>
                                <dd>{formatter.format(checkout.subtotal)}</dd>
                            </div>
                            <div>
                                <dt>Discount</dt>
                                <dd>{formatter.format(checkout.discount)}</dd>
                            </div>
                            <div className="checkout_total">
                                <dt>Total</dt>
                                <dd>{formatter.format(checkout.total)}</dd>
                            </div>
                        </dl>
                    </aside>
                )}
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
