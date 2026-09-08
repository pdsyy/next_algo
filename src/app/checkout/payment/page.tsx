"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import { useCart } from "@/components/cartPopup/CartProvider";
import styles from "./payment.module.css";

const CUSTOMER_STORAGE_KEY =
    "checkoutCustomer";

const PENDING_ORDER_KEY =
    "algo_world_pending_crypto_order_v1";

const PAYMENT_STORAGE_KEY =
    "currentPayment";

const CHECKOUT_STORAGE_KEY =
    "algo_world_checkout_v1";

const PRODUCT_CODE =
    "123456";

type PayCurrency =
    | "usdttrc20"
    | "btc"
    | "eth";

type Customer = {
    firstName: string;
    lastName: string;
    email: string;
};

type PendingOrder = {
    orderCode: string;
    fingerprint: string;
    amount: number;
    currency: string;
};

type StoredPayment = {
    id?: string;
    orderCode?: string;
    status?: string;
};

const currencies: Array<{
    value: PayCurrency;
    title: string;
    text: string;
}> = [
    {
        value: "usdttrc20",
        title: "USDT",
        text: "TRON network (TRC20)",
    },
    {
        value: "btc",
        title: "Bitcoin",
        text: "Bitcoin network",
    },
    {
        value: "eth",
        title: "Ethereum",
        text: "Ethereum network",
    },
];

function readCustomer(): Customer | null {
    try {
        const raw =
            sessionStorage.getItem(
                CUSTOMER_STORAGE_KEY,
            );

        if (!raw) {
            return null;
        }

        const value =
            JSON.parse(raw) as Partial<Customer>;

        if (
            !value.firstName ||
            !value.lastName ||
            !value.email
        ) {
            return null;
        }

        return {
            firstName:
            value.firstName,

            lastName:
            value.lastName,

            email:
            value.email,
        };
    } catch (error) {
        console.error(
            "CUSTOMER STORAGE ERROR:",
            error,
        );

        return null;
    }
}

function readPendingOrder(
    fingerprint: string,
): PendingOrder | null {
    try {
        const raw =
            sessionStorage.getItem(
                PENDING_ORDER_KEY,
            );

        if (!raw) {
            return null;
        }

        const value =
            JSON.parse(raw) as Partial<PendingOrder>;

        if (
            typeof value.orderCode !== "string" ||
            typeof value.fingerprint !== "string" ||
            typeof value.amount !== "number" ||
            typeof value.currency !== "string"
        ) {
            sessionStorage.removeItem(
                PENDING_ORDER_KEY,
            );

            return null;
        }

        if (
            value.fingerprint !==
            fingerprint
        ) {
            return null;
        }

        return {
            orderCode:
            value.orderCode,

            fingerprint:
            value.fingerprint,

            amount:
            value.amount,

            currency:
            value.currency,
        };
    } catch (error) {
        console.error(
            "PENDING ORDER STORAGE ERROR:",
            error,
        );

        sessionStorage.removeItem(
            PENDING_ORDER_KEY,
        );

        return null;
    }
}

function readCurrentPayment():
    | StoredPayment
    | null {
    try {
        const raw =
            sessionStorage.getItem(
                PAYMENT_STORAGE_KEY,
            );

        if (!raw) {
            return null;
        }

        const value =
            JSON.parse(raw) as StoredPayment;

        if (
            typeof value.id !== "string" ||
            typeof value.orderCode !== "string"
        ) {
            return null;
        }

        return value;
    } catch {
        return null;
    }
}

export default function CheckoutPaymentPage() {
    const router =
        useRouter();

    const {
        items,
        isHydrated,
    } = useCart();

    const [
        customer,
        setCustomer,
    ] = useState<Customer | null>(
        null,
    );

    const [
        loaded,
        setLoaded,
    ] = useState(false);

    const [
        payCurrency,
        setPayCurrency,
    ] = useState<PayCurrency>(
        "usdttrc20",
    );

    const [
        busy,
        setBusy,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    useEffect(() => {
        setCustomer(
            readCustomer(),
        );

        setLoaded(true);
    }, []);

    const terra =
        useMemo(
            () =>
                items.find(
                    item =>
                        item.id ===
                        "terra-ea",
                ),
            [items],
        );

    const quantity =
        terra?.quantity ?? 0;

    const previewTotal =
        (terra?.unitPrice ?? 0) *
        quantity;

    const fingerprint =
        customer
            ? [
                customer.email
                    .trim()
                    .toLowerCase(),

                PRODUCT_CODE,

                quantity,
            ].join("|")
            : "";

    /*
     * Сохраняем товары и итоговую сумму,
     * чтобы страница /payment могла показать
     * правую карточку с составом заказа.
     */
    const saveCheckoutSnapshot = (
        amount: number,
        currency: string,
    ) => {
        if (
            !terra ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            throw new Error(
                "Invalid order amount.",
            );
        }

        const normalizedCurrency =
            currency
                .trim()
                .toUpperCase() ||
            "USD";

        const checkoutSnapshot = {
            items:
                items.map(item => ({
                    id:
                    item.id,

                    name:
                    item.name,

                    subtitle:
                    item.subtitle,

                    imageSrc:
                    item.imageSrc,

                    /*
                     * Пока поддерживается только Terra.
                     * Используем серверную сумму CML,
                     * чтобы стоимость товара совпадала
                     * с реальной суммой оплаты.
                     */
                    unitPrice:
                        item.id ===
                        "terra-ea"
                            ? amount /
                            item.quantity
                            : item.unitPrice,

                    quantity:
                    item.quantity,
                })),

            currency:
            normalizedCurrency,

            subtotal:
            amount,

            discount:
                0,

            total:
            amount,

            savedAt:
                Date.now(),
        };

        localStorage.setItem(
            CHECKOUT_STORAGE_KEY,
            JSON.stringify(
                checkoutSnapshot,
            ),
        );
    };

    const startPayment =
        async () => {
            if (
                !customer ||
                !terra ||
                quantity < 1 ||
                busy
            ) {
                return;
            }

            setBusy(true);
            setError("");

            try {
                /*
                 * Ищем ранее созданный CML-заказ.
                 * Это предотвращает появление нового
                 * заказа после обычной ошибки
                 * создания NOWPayments-платежа.
                 */
                let pending =
                    readPendingOrder(
                        fingerprint,
                    );

                /*
                 * Если подходящего заказа нет,
                 * создаём покупателя и заказ в CML.
                 */
                if (!pending) {
                    const checkoutResponse =
                        await fetch(
                            "/api/checkout",
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },

                                body:
                                    JSON.stringify({
                                        email:
                                        customer.email,

                                        firstName:
                                        customer.firstName,

                                        lastName:
                                        customer.lastName,

                                        productCode:
                                        PRODUCT_CODE,

                                        quantity,
                                    }),
                            },
                        );

                    const checkoutData =
                        await checkoutResponse.json();

                    if (
                        !checkoutResponse.ok ||
                        !checkoutData.success ||
                        !checkoutData.order?.code
                    ) {
                        throw new Error(
                            checkoutData.error ||
                            "Could not create the order.",
                        );
                    }

                    const orderAmount =
                        Number(
                            checkoutData.order
                                .amount,
                        );

                    const orderCurrency =
                        String(
                            checkoutData.order
                                .currency ??
                            "USD",
                        ).toUpperCase();

                    if (
                        !Number.isFinite(
                            orderAmount,
                        ) ||
                        orderAmount <= 0
                    ) {
                        throw new Error(
                            "CML returned an invalid order amount.",
                        );
                    }

                    pending = {
                        orderCode:
                            String(
                                checkoutData.order
                                    .code,
                            ),

                        fingerprint,

                        amount:
                        orderAmount,

                        currency:
                        orderCurrency,
                    };

                    sessionStorage.setItem(
                        PENDING_ORDER_KEY,
                        JSON.stringify(
                            pending,
                        ),
                    );
                }

                /*
                 * Уже на этом этапе сохраняем
                 * снимок заказа.
                 */
                saveCheckoutSnapshot(
                    pending.amount,
                    pending.currency,
                );

                /*
                 * Если для этого CML-заказа уже
                 * создавался NOWPayments-платёж,
                 * не создаём второй платёж.
                 */
                const existingPayment =
                    readCurrentPayment();

                if (
                    existingPayment?.id &&
                    existingPayment.orderCode ===
                    pending.orderCode
                ) {
                    router.push(
                        "/payment",
                    );

                    return;
                }

                /*
                 * Создаём NOWPayments-платёж
                 * для существующего CML-заказа.
                 */
                const response =
                    await fetch(
                        "/api/payments/nowpayments/create",
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({
                                    orderCode:
                                    pending.orderCode,

                                    payCurrency,
                                }),
                        },
                    );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success ||
                    !data.payment?.id
                ) {
                    throw new Error(
                        data.error ||
                        "Could not create the crypto payment.",
                    );
                }

                const serverAmount =
                    Number(
                        data.order?.amount ??
                        data.payment
                            ?.priceAmount ??
                        pending.amount,
                    );

                const serverCurrency =
                    String(
                        data.order?.currency ??
                        data.payment
                            ?.priceCurrency ??
                        pending.currency,
                    ).toUpperCase();

                if (
                    !Number.isFinite(
                        serverAmount,
                    ) ||
                    serverAmount <= 0
                ) {
                    throw new Error(
                        "NOWPayments returned an invalid amount.",
                    );
                }

                /*
                 * Ещё раз обновляем snapshot
                 * окончательной серверной суммой.
                 */
                saveCheckoutSnapshot(
                    serverAmount,
                    serverCurrency,
                );

                /*
                 * Сохраняем сам платёж для
                 * страницы с QR-кодом.
                 */
                sessionStorage.setItem(
                    PAYMENT_STORAGE_KEY,
                    JSON.stringify({
                        ...data.payment,

                        orderCode:
                        pending.orderCode,
                    }),
                );

                router.push(
                    "/payment",
                );
            } catch (reason) {
                console.error(
                    "CREATE PAYMENT ERROR:",
                    reason,
                );

                setError(
                    reason instanceof Error
                        ? reason.message
                        : "Payment creation failed.",
                );
            } finally {
                setBusy(false);
            }
        };

    if (
        !isHydrated ||
        !loaded
    ) {
        return (
            <main
                className={
                    styles.page
                }
            >
                <div
                    className={
                        styles.state
                    }
                >
                    Loading…
                </div>
            </main>
        );
    }

    const hasUnsupportedItems =
        items.some(
            item =>
                item.id !==
                "terra-ea",
        );

    if (
        !customer ||
        !terra ||
        hasUnsupportedItems
    ) {
        return (
            <main
                className={
                    styles.page
                }
            >
                <div
                    className={
                        styles.state
                    }
                >
                    <h1>
                        Order cannot be
                        continued
                    </h1>

                    <p>
                        Please return to
                        checkout and check
                        your customer details
                        and cart.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/checkout",
                            )
                        }
                    >
                        Back to checkout
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main
            className={
                styles.page
            }
        >
            <div
                className={
                    styles.shell
                }
            >
                <a
                    href="/"
                    className={
                        styles.home
                    }
                >
                    Main page
                </a>

                <section
                    className={
                        styles.card
                    }
                >
                    <header
                        className={
                            styles.header
                        }
                    >
                        <h1>
                            Pay with crypto
                        </h1>

                        <p>
                            Select the
                            cryptocurrency
                            you want to send.
                        </p>
                    </header>

                    <div
                        className={
                            styles.sectionTitle
                        }
                    >
                        PAYMENT CURRENCY
                    </div>

                    <div
                        className={
                            styles.options
                        }
                    >
                        {currencies.map(
                            currency => (
                                <label
                                    key={
                                        currency.value
                                    }
                                    className={`${styles.option} ${
                                        payCurrency ===
                                        currency.value
                                            ? styles.active
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="currency"
                                        value={
                                            currency.value
                                        }
                                        checked={
                                            payCurrency ===
                                            currency.value
                                        }
                                        onChange={() =>
                                            setPayCurrency(
                                                currency.value,
                                            )
                                        }
                                    />

                                    <span
                                        className={
                                            styles.coin
                                        }
                                    >
                                        {currency.title.slice(
                                            0,
                                            1,
                                        )}
                                    </span>

                                    <span>
                                        <strong>
                                            {
                                                currency.title
                                            }
                                        </strong>

                                        <small>
                                            {
                                                currency.text
                                            }
                                        </small>
                                    </span>

                                    <i
                                        aria-hidden="true"
                                    />
                                </label>
                            ),
                        )}

                        {error && (
                            <p
                                className={
                                    styles.error
                                }
                                role="alert"
                            >
                                {error}
                            </p>
                        )}
                    </div>

                    <footer
                        className={
                            styles.actions
                        }
                    >
                        <button
                            type="button"
                            className={
                                styles.back
                            }
                            onClick={() =>
                                router.push(
                                    "/checkout/review",
                                )
                            }
                            disabled={
                                busy
                            }
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            className={
                                styles.pay
                            }
                            onClick={
                                startPayment
                            }
                            disabled={
                                busy
                            }
                            aria-busy={
                                busy
                            }
                        >
                            {busy
                                ? "Creating payment…"
                                : "Continue to payment"}
                        </button>
                    </footer>
                </section>

                <aside
                    className={
                        styles.summary
                    }
                >
                    <header>
                        <h2>
                            Order
                        </h2>

                        <p>
                            {quantity}{" "}
                            {quantity === 1
                                ? "item"
                                : "items"}{" "}
                            · $
                            {previewTotal.toFixed(
                                2,
                            )}
                        </p>
                    </header>

                    <div
                        className={
                            styles.sectionTitle
                        }
                    >
                        ORDER SUMMARY
                    </div>

                    <div
                        className={
                            styles.product
                        }
                    >
                        {terra.imageSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={
                                    terra.imageSrc
                                }
                                alt=""
                            />
                        ) : (
                            <span>
                                ◇
                            </span>
                        )}

                        <div>
                            <strong>
                                {
                                    terra.name
                                }
                            </strong>

                            <small>
                                Quantity:{" "}
                                {quantity}
                            </small>
                        </div>
                    </div>

                    <dl>
                        <div>
                            <dt>
                                Total
                            </dt>

                            <dd>
                                $
                                {previewTotal.toFixed(
                                    2,
                                )}
                            </dd>
                        </div>
                    </dl>
                </aside>
            </div>
        </main>
    );
}