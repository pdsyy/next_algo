"use client";

import { useEffect, useState } from "react";
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

export default function PaymentPage() {
    const [payment, setPayment] =
        useState<Payment | null>(null);

    const [copied, setCopied] =
        useState(false);

    useEffect(() => {
        if (!payment?.id) return;

        const interval = setInterval(
            async () => {
                try {
                    const response = await fetch(
                        `/api/payments/nowpayments/status?paymentId=${payment.id}`
                    );

                    const data =
                        await response.json();

                    console.log(
                        "PAYMENT STATUS:",
                        data
                    );

                    if (data.payment_status) {
                        setPayment(prev => {
                            if (!prev) return prev;

                            return {
                                ...prev,
                                status:
                                data.payment_status,
                            };
                        });
                    }

                } catch (error) {
                    console.error(
                        "STATUS ERROR:",
                        error
                    );
                }
            },
            5000
        );

        return () =>
            clearInterval(interval);

    }, [payment?.id]);

    useEffect(() => {
        const stored =
            sessionStorage.getItem(
                "currentPayment"
            );

        if (!stored) return;

        setPayment(JSON.parse(stored));
    }, []);

    const copyAddress = async () => {
        if (!payment) return;

        await navigator.clipboard.writeText(
            payment.payAddress
        );

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1500);
    };

    if (!payment) {
        return (
            <main>
                Payment not found
            </main>
        );
    }

    return (
        <main className="payment_page">

            <div className="payment_card">

                <h1>
                    Complete payment
                </h1>

                <div>
                    {payment.priceAmount}{" "}
                    {payment.priceCurrency.toUpperCase()}
                </div>

                <p>Send exactly</p>

                <strong>
                    {payment.payAmount}{" "}
                    {payment.payCurrency.toUpperCase()}
                </strong>

                <div>
                    <QRCodeSVG
                        value={payment.payAddress}
                        size={200}
                    />
                </div>

                <div>
                    {payment.payAddress}
                </div>

                <button
                    onClick={copyAddress}
                >
                    {copied
                        ? "COPIED"
                        : "COPY ADDRESS"}
                </button>

                <div>
                    Status: {payment.status}
                </div>

            </div>

        </main>
    );
}