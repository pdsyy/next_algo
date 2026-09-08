"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { QRCodeSVG } from "qrcode.react";

interface Payment {
    id: string;
    status: string;

    payAddress: string;
    payAmount: number;
    payCurrency: string;

    priceAmount: number;
    priceCurrency: string;

    orderCode?: string;
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

const PAYMENT_STORAGE_KEY =
    "currentPayment";

const CHECKOUT_STORAGE_KEY =
    "algo_world_checkout_v1";

const FINAL_STATUSES = new Set([
    "finished",
    "failed",
    "expired",
    "refunded",
]);

const SUCCESS_STATUSES = new Set([
    "finished",
    "confirmed",
]);

function isPayment(
    value: unknown,
): value is Payment {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return false;
    }

    const payment =
        value as Partial<Payment>;

    return (
        typeof payment.id === "string" &&
        typeof payment.status === "string" &&
        typeof payment.payAddress === "string" &&
        typeof payment.payAmount === "number" &&
        typeof payment.payCurrency === "string" &&
        typeof payment.priceAmount === "number" &&
        typeof payment.priceCurrency === "string" &&
        (
            payment.orderCode === undefined ||
            typeof payment.orderCode === "string"
        )
    );
}

function isCheckoutItem(
    value: unknown,
): value is CheckoutItem {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return false;
    }

    const item =
        value as Partial<CheckoutItem>;

    return (
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.unitPrice === "number" &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
}

function isCheckoutOrder(
    value: unknown,
): value is CheckoutOrder {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return false;
    }

    const order =
        value as Partial<CheckoutOrder>;

    return (
        Array.isArray(order.items) &&
        order.items.length > 0 &&
        order.items.every(isCheckoutItem) &&
        typeof order.currency === "string" &&
        typeof order.subtotal === "number" &&
        typeof order.discount === "number" &&
        typeof order.total === "number"
    );
}

function getStatusText(
    status: string,
) {
    const statuses: Record<string, string> = {
        waiting:
            "Waiting for payment",

        confirming:
            "Payment is being confirmed",

        confirmed:
            "Payment confirmed",

        sending:
            "Completing your order",

        finished:
            "Payment completed",

        partially_paid:
            "Payment partially received",

        failed:
            "Payment failed",

        expired:
            "Payment expired",

        refunded:
            "Payment refunded",
    };

    return statuses[status] ?? status;
}

export default function PaymentPage() {
    const [payment, setPayment] =
        useState<Payment | null>(null);

    const [checkout, setCheckout] =
        useState<CheckoutOrder | null>(null);

    const [isLoaded, setIsLoaded] =
        useState(false);

    const [copied, setCopied] =
        useState(false);

    const [statusError, setStatusError] =
        useState("");

    const copyTimeoutRef =
        useRef<number | null>(null);

    /* =========================
       LOAD PAYMENT AND ORDER
    ========================= */

    useEffect(() => {
        try {
            const storedPayment =
                sessionStorage.getItem(
                    PAYMENT_STORAGE_KEY,
                );

            const storedCheckout =
                localStorage.getItem(
                    CHECKOUT_STORAGE_KEY,
                );

            if (storedPayment) {
                const parsedPayment: unknown =
                    JSON.parse(storedPayment);

                if (isPayment(parsedPayment)) {
                    setPayment(parsedPayment);
                } else {
                    console.error(
                        "INVALID PAYMENT DATA:",
                        parsedPayment,
                    );
                }
            }

            if (storedCheckout) {
                const parsedCheckout: unknown =
                    JSON.parse(storedCheckout);

                if (
                    isCheckoutOrder(
                        parsedCheckout,
                    )
                ) {
                    setCheckout(
                        parsedCheckout,
                    );
                } else {
                    console.error(
                        "INVALID CHECKOUT DATA:",
                        parsedCheckout,
                    );
                }
            }
        } catch (error) {
            console.error(
                "STORAGE ERROR:",
                error,
            );
        } finally {
            setIsLoaded(true);
        }
    }, []);

    /* =========================
       PAYMENT STATUS POLLING
    ========================= */

    useEffect(() => {
        if (!payment?.id) {
            return;
        }

        if (
            FINAL_STATUSES.has(
                payment.status,
            )
        ) {
            return;
        }

        let requestInProgress =
            false;

        const checkStatus =
            async () => {
                if (requestInProgress) {
                    return;
                }

                requestInProgress = true;

                try {
                    const response =
                        await fetch(
                            `/api/payments/nowpayments/status?paymentId=${encodeURIComponent(
                                payment.id,
                            )}`,
                            {
                                cache:
                                    "no-store",
                            },
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data?.error ??
                            `Status request failed: ${response.status}`,
                        );
                    }

                    if (
                        typeof data.payment_status !==
                        "string"
                    ) {
                        return;
                    }

                    setStatusError("");

                    setPayment(previous => {
                        if (!previous) {
                            return previous;
                        }

                        const nextPayment: Payment = {
                            ...previous,
                            status:
                            data.payment_status,
                        };

                        sessionStorage.setItem(
                            PAYMENT_STORAGE_KEY,
                            JSON.stringify(
                                nextPayment,
                            ),
                        );

                        return nextPayment;
                    });
                } catch (error) {
                    console.error(
                        "STATUS ERROR:",
                        error,
                    );

                    setStatusError(
                        error instanceof Error
                            ? error.message
                            : "Unable to check payment status.",
                    );
                } finally {
                    requestInProgress =
                        false;
                }
            };

        // Проверяем статус сразу после открытия страницы.
        void checkStatus();

        const interval =
            window.setInterval(
                checkStatus,
                5000,
            );

        return () => {
            window.clearInterval(
                interval,
            );
        };
    }, [
        payment?.id,
        payment?.status,
    ]);

    /* =========================
       CLEAR COPY TIMER
    ========================= */

    useEffect(() => {
        return () => {
            if (
                copyTimeoutRef.current !==
                null
            ) {
                window.clearTimeout(
                    copyTimeoutRef.current,
                );
            }
        };
    }, []);

    /* =========================
       PRICE FORMATTER
    ========================= */

    const formatter =
        useMemo(
            () =>
                new Intl.NumberFormat(
                    "en-US",
                    {
                        style:
                            "currency",

                        currency:
                            checkout?.currency ??
                            payment?.priceCurrency ??
                            "USD",

                        maximumFractionDigits:
                            2,
                    },
                ),
            [
                checkout?.currency,
                payment?.priceCurrency,
            ],
        );

    const formatPrice = (
        value: number,
    ) => {
        return formatter.format(
            value,
        );
    };

    /* =========================
       COPY ADDRESS
    ========================= */

    const copyAddress =
        async () => {
            if (!payment) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    payment.payAddress,
                );

                setCopied(true);

                if (
                    copyTimeoutRef.current !==
                    null
                ) {
                    window.clearTimeout(
                        copyTimeoutRef.current,
                    );
                }

                copyTimeoutRef.current =
                    window.setTimeout(
                        () => {
                            setCopied(false);

                            copyTimeoutRef.current =
                                null;
                        },
                        1500,
                    );
            } catch (error) {
                console.error(
                    "COPY ERROR:",
                    error,
                );
            }
        };

    /* =========================
       PAGE STATES
    ========================= */

    if (!isLoaded) {
        return (
            <main className="payment_page">
                Loading...
            </main>
        );
    }

    /*
     * Для открытия страницы нужен только payment.
     * Отсутствие checkout больше не блокирует QR-код.
     */
    if (!payment) {
        return (
            <main className="payment_page">
                Payment not found
            </main>
        );
    }

    const isSuccessful =
        SUCCESS_STATUSES.has(
            payment.status,
        );

    const isFailed =
        payment.status === "failed" ||
        payment.status === "expired";

    /* =========================
       RENDER
    ========================= */

    return (
        <main className="payment_page">
            <div className="payment_page_container">
                <section className="payment_card">
                    <h1>
                        {isSuccessful
                            ? "Payment completed"
                            : isFailed
                                ? "Payment unsuccessful"
                                : "Complete payment"}
                    </h1>

                    {payment.orderCode && (
                        <div className="payment_order_number">
                            Order #{payment.orderCode}
                        </div>
                    )}

                    <div className="payment_price">
                        {formatPrice(
                            payment.priceAmount,
                        )}
                    </div>

                    {!isSuccessful && !isFailed && (
                        <>
                            <p>
                                Send exactly
                            </p>

                            <strong>
                                {payment.payAmount}{" "}
                                {payment.payCurrency.toUpperCase()}
                            </strong>

                            <div className="payment_qr">
                                <QRCodeSVG
                                    value={
                                        payment.payAddress
                                    }
                                    size={200}
                                />
                            </div>

                            <div className="payment_address">
                                {
                                    payment.payAddress
                                }
                            </div>

                            <button
                                type="button"
                                onClick={
                                    copyAddress
                                }
                            >
                                {copied
                                    ? "COPIED"
                                    : "COPY ADDRESS"}
                            </button>
                        </>
                    )}

                    {isSuccessful && (
                        <p className="payment_success_message">
                            Thank you! Your payment
                            has been confirmed.
                        </p>
                    )}

                    {isFailed && (
                        <p className="payment_failed_message">
                            This payment could not be
                            completed. Please create a
                            new payment.
                        </p>
                    )}

                    <div
                        className={`payment_status payment_status_${payment.status}`}
                    >
                        Status:{" "}
                        {getStatusText(
                            payment.status,
                        )}
                    </div>

                    {statusError && (
                        <p
                            className="payment_status_error"
                            role="alert"
                        >
                            {statusError}
                        </p>
                    )}
                </section>

                {checkout && (
                    <aside className="checkout_summary">
                        <div className="checkout_summary_head">
                            <h2>
                                Order summary
                            </h2>

                            <div>
                                {formatPrice(
                                    checkout.total,
                                )}
                            </div>
                        </div>

                        <div className="checkout_summary_label">
                            ORDER SUMMARY
                        </div>

                        <ul className="checkout_items">
                            {checkout.items.map(
                                item => (
                                    <li
                                        key={
                                            item.id
                                        }
                                        className="checkout_item"
                                    >
                                        <div className="checkout_item_image">
                                            {item.imageSrc ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={
                                                        item.imageSrc
                                                    }
                                                    alt=""
                                                />
                                            ) : (
                                                <div className="checkout_image_placeholder" />
                                            )}
                                        </div>

                                        <div className="checkout_item_info">
                                            <strong>
                                                {
                                                    item.name
                                                }
                                            </strong>

                                            {item.subtitle && (
                                                <span>
                                                    {
                                                        item.subtitle
                                                    }
                                                </span>
                                            )}

                                            {item.quantity >
                                                1 && (
                                                    <span>
                                                    Quantity:{" "}
                                                        {
                                                            item.quantity
                                                        }
                                                </span>
                                                )}
                                        </div>

                                        <div className="checkout_item_price">
                                            {formatPrice(
                                                item.unitPrice *
                                                item.quantity,
                                            )}
                                        </div>
                                    </li>
                                ),
                            )}
                        </ul>

                        <div className="checkout_totals">
                            <div>
                                <span>
                                    Subtotal
                                </span>

                                <span>
                                    {formatPrice(
                                        checkout.subtotal,
                                    )}
                                </span>
                            </div>

                            <div>
                                <span>
                                    Discount
                                </span>

                                <span>
                                    {formatPrice(
                                        checkout.discount,
                                    )}
                                </span>
                            </div>

                            <div className="checkout_total">
                                <span>
                                    Total
                                </span>

                                <strong>
                                    {formatPrice(
                                        checkout.total,
                                    )}
                                </strong>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </main>
    );
}