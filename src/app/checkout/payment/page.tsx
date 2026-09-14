"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import Image, {
    type StaticImageData,
} from "next/image";

import { useRouter } from "next/navigation";

import { useCart } from "@/components/cartPopup/CartProvider";
import { useLanguage } from "@/context/LanguageProvider";

import bottom_lines from "@/app/images/bottom_lines_video_block.svg";
import top_lines from "@/app/images/video_block_top_lines.svg";

import tron_icon from "../images/tron_icon.svg";
import usdc_icon from "../images/usdc_icon.svg";
import tether_eth_icon from "../images/tether_eth_icon.svg";
import tether_bnb_icon from "../images/tether_bnb_icon.svg";

import styles from "./payment.module.css";
import "../checkout.css";


const CUSTOMER_STORAGE_KEY =
    "checkoutCustomer";

const PENDING_ORDER_KEY =
    "algo_world_pending_crypto_order_v1";

const PAYMENT_STORAGE_KEY =
    "currentPayment";

const CHECKOUT_STORAGE_KEY =
    "algo_world_checkout_v1";


const PRODUCT_CODES:
    Record<string, string> = {
    "terra-ea": "terra-ea",
    "aero-ea": "aero-ea",
    "hydro-ea": "hydro-ea",
};


type PayCurrency =
    | "usdttrc20"
    | "usdc"
    | "usdtbsc"
    | "usdterc20";

type DeliveryLanguage =
    | "en"
    | "ru";


type Customer = {
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
    deliveryLanguage: DeliveryLanguage;

    existingCustomer: boolean;
    verificationRef?: string;
    checkoutReference: string;
};


type PendingOrder = {
    orderCode: string;
    fingerprint: string;
    amount: number;
    currency: string;
};


type CheckoutResponse = {
    success?: boolean;
    error?: string;

    order?: {
        code?: string;
        amount?: number;
        currency?: string;
        checkoutReference?: string;
    };
};


type PaymentResponse = {
    success?: boolean;
    error?: string;

    payment?: {
        id?: string | number;
        [key: string]: unknown;
    };
};


/* =========================
   CUSTOMER STORAGE
========================= */

function readCustomer():
    Customer | null {
    try {
        const raw =
            sessionStorage.getItem(
                CUSTOMER_STORAGE_KEY
            );

        if (!raw) {
            return null;
        }

        const value =
            JSON.parse(raw) as Record<
                string,
                unknown
            >;


        const firstName =
            typeof value.firstName === "string"
                ? value.firstName.trim()
                : "";

        const lastName =
            typeof value.lastName === "string"
                ? value.lastName.trim()
                : "";

        const email =
            typeof value.email === "string"
                ? value.email
                    .trim()
                    .toLowerCase()
                : "";

        const referralCode =
            typeof value.referralCode === "string"
                ? value.referralCode.trim()
                : "";

        const deliveryLanguage:
            DeliveryLanguage =
            value.deliveryLanguage === "ru"
                ? "ru"
                : "en";

        const existingCustomer =
            value.existingCustomer;

        const verificationRef =
            typeof value.verificationRef === "string"
                ? value.verificationRef.trim()
                : "";

        const checkoutReference =
            typeof value.checkoutReference === "string"
                ? value.checkoutReference.trim()
                : "";


        if (
            !firstName ||
            !lastName ||
            !email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            ) ||
            value.accepted !== true ||
            typeof existingCustomer !== "boolean" ||
            !checkoutReference
        ) {
            return null;
        }


        /*
         * Для существующего клиента
         * verificationRef обязателен.
         */
        if (
            existingCustomer &&
            !verificationRef
        ) {
            return null;
        }


        return {
            firstName,
            lastName,
            email,
            referralCode,
            deliveryLanguage,
            existingCustomer,

            ...(verificationRef
                ? {
                    verificationRef,
                }
                : {}),

            checkoutReference,
        };
    } catch (error) {
        console.error(
            "PAYMENT CUSTOMER STORAGE ERROR:",
            error
        );

        return null;
    }
}


/* =========================
   PENDING ORDER STORAGE
========================= */

function readPendingOrder(
    fingerprint: string
): PendingOrder | null {
    try {
        const saved =
            sessionStorage.getItem(
                PENDING_ORDER_KEY
            );

        if (!saved) {
            return null;
        }

        const parsed =
            JSON.parse(
                saved
            ) as Partial<PendingOrder>;

        if (
            parsed.fingerprint !== fingerprint ||
            typeof parsed.orderCode !== "string" ||
            !parsed.orderCode.trim() ||
            typeof parsed.amount !== "number" ||
            !Number.isFinite(parsed.amount) ||
            parsed.amount <= 0 ||
            typeof parsed.currency !== "string" ||
            !parsed.currency.trim()
        ) {
            return null;
        }

        return {
            orderCode:
                parsed.orderCode.trim(),

            fingerprint:
            parsed.fingerprint,

            amount:
            parsed.amount,

            currency:
                parsed.currency
                    .trim()
                    .toUpperCase(),
        };
    } catch (error) {
        console.error(
            "PENDING ORDER STORAGE ERROR:",
            error
        );

        sessionStorage.removeItem(
            PENDING_ORDER_KEY
        );

        return null;
    }
}


/* =========================
   VERIFICATION HELPERS
========================= */

function isCustomerVerificationError(
    message: string,
    status: number
) {
    return (
        status === 409 ||
        /verification|verify|otp|already exists|existing customer|email.+exists/i.test(
            message
        )
    );
}


function invalidateStoredVerification() {
    try {
        const raw =
            sessionStorage.getItem(
                CUSTOMER_STORAGE_KEY
            );

        if (!raw) {
            return;
        }

        const stored =
            JSON.parse(raw) as Record<
                string,
                unknown
            >;

        /*
         * Оставляем данные формы, но удаляем
         * старое подтверждение. На /checkout
         * email снова пройдёт resolve + OTP.
         */
        stored.existingCustomer = false;

        delete stored.verificationRef;
        delete stored.verifiedAt;

        sessionStorage.setItem(
            CUSTOMER_STORAGE_KEY,
            JSON.stringify(stored)
        );
    } catch (error) {
        console.error(
            "INVALIDATE VERIFICATION ERROR:",
            error
        );

        sessionStorage.removeItem(
            CUSTOMER_STORAGE_KEY
        );
    }
}


/* =========================
   PAGE
========================= */

export default function CheckoutPaymentPage() {
    const router =
        useRouter();

    const {
        t,
        language,
    } = useLanguage();

    const {
        items,
        isHydrated,
    } = useCart();

    const text =
        t.checkoutPayment;


    const [
        customer,
        setCustomer,
    ] = useState<Customer | null>(
        null
    );

    const [
        loaded,
        setLoaded,
    ] = useState(false);

    const [
        payCurrency,
        setPayCurrency,
    ] = useState<PayCurrency>(
        "usdttrc20"
    );

    const [
        busy,
        setBusy,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        requiresEmailVerification,
        setRequiresEmailVerification,
    ] = useState(false);


    const verificationExpiredText =
        language === "RU"
            ? "Подтверждение email истекло или недействительно. Вернитесь к данным покупателя и запросите новый код."
            : language === "UA"
                ? "Підтвердження email завершилося або недійсне. Поверніться до даних покупця та запросіть новий код."
                : "Email verification has expired or is invalid. Return to the customer details and request a new code.";

    const verificationButtonText =
        language === "RU"
            ? "Подтвердить email"
            : language === "UA"
                ? "Підтвердити email"
                : "Verify email";


    const currencies:
        Array<{
            value: PayCurrency;
            title: string;
            text: string;
            image: string | StaticImageData;
        }> = [
        {
            value: "usdttrc20",
            title: "USDT",
            text:
            text.currencies.usdtTrc20,
            image: tron_icon,
        },

        {
            value: "usdc",
            title: "USDC",
            text:
            text.currencies.usdc,
            image: usdc_icon,
        },

        {
            value: "usdtbsc",
            title: "USDT",
            text:
            text.currencies.usdtBep20,
            image: tether_bnb_icon,
        },

        {
            value: "usdterc20",
            title: "USDT",
            text:
            text.currencies.usdtErc20,
            image: tether_eth_icon,
        },
    ];


    /* =========================
       LOAD CUSTOMER
    ========================= */

    useEffect(() => {
        setCustomer(
            readCustomer()
        );

        setLoaded(true);
    }, []);


    /* =========================
       ORDER DATA
    ========================= */

    const checkoutItems =
        useMemo(
            () =>
                items.filter(
                    item =>
                        PRODUCT_CODES[
                            item.id
                            ]
                ),
            [items]
        );


    const previewTotal =
        checkoutItems.reduce(
            (sum, item) =>
                sum + item.unitPrice,
            0
        );


    const productFingerprint =
        checkoutItems
            .map(
                item =>
                    PRODUCT_CODES[
                        item.id
                        ]
            )
            .sort()
            .join(",");


    /*
     * checkoutReference входит в fingerprint.
     * Поэтому новая покупка тех же товаров
     * не использует старый Pending Order.
     */
    const fingerprint =
        customer
            ? [
                customer.email
                    .toLowerCase(),

                productFingerprint,

                customer.referralCode,

                customer.deliveryLanguage,

                customer.existingCustomer
                    ? "existing"
                    : "new",

                customer.checkoutReference,
            ].join("|")
            : "";


    /* =========================
       START PAYMENT
    ========================= */

    const startPayment =
        async () => {
            if (
                !customer ||
                checkoutItems.length === 0 ||
                busy
            ) {
                return;
            }

            setBusy(true);
            setError("");
            setRequiresEmailVerification(
                false
            );

            try {
                let pending =
                    readPendingOrder(
                        fingerprint
                    );


                /* =========================
                   CREATE CML ORDER
                ========================= */

                if (!pending) {
                    const checkoutResponse =
                        await fetch(
                            "/api/checkout",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },

                                body: JSON.stringify({
                                    action:
                                        "create-order",

                                    email:
                                    customer.email,

                                    firstName:
                                    customer.firstName,

                                    lastName:
                                    customer.lastName,

                                    referralCode:
                                    customer.referralCode,

                                    deliveryLanguage:
                                    customer.deliveryLanguage,

                                    existingCustomer:
                                    customer.existingCustomer,

                                    verificationRef:
                                    customer.verificationRef,

                                    checkoutReference:
                                    customer.checkoutReference,

                                    items:
                                        checkoutItems.map(
                                            item => ({
                                                productCode:
                                                    PRODUCT_CODES[
                                                        item.id
                                                        ],

                                                quantity: 1,
                                            })
                                        ),
                                }),
                            }
                        );


                    let checkoutData:
                        CheckoutResponse = {};

                    try {
                        checkoutData =
                            await checkoutResponse
                                .json() as CheckoutResponse;
                    } catch {
                        checkoutData = {};
                    }


                    if (
                        !checkoutResponse.ok ||
                        checkoutData.success !== true ||
                        !checkoutData.order?.code
                    ) {
                        const message =
                            checkoutData.error ||
                            text.errors.createOrder;

                        if (
                            isCustomerVerificationError(
                                message,
                                checkoutResponse.status
                            )
                        ) {
                            invalidateStoredVerification();

                            sessionStorage.removeItem(
                                PENDING_ORDER_KEY
                            );

                            setRequiresEmailVerification(
                                true
                            );

                            throw new Error(
                                verificationExpiredText
                            );
                        }

                        throw new Error(
                            message
                        );
                    }


                    const orderAmount =
                        Number(
                            checkoutData.order.amount
                        );

                    const orderCurrency =
                        String(
                            checkoutData.order.currency ??
                            ""
                        ).toUpperCase();


                    if (
                        !Number.isFinite(
                            orderAmount
                        ) ||
                        orderAmount <= 0 ||
                        !orderCurrency
                    ) {
                        throw new Error(
                            text.errors.createOrder
                        );
                    }


                    pending = {
                        orderCode:
                            String(
                                checkoutData
                                    .order
                                    .code
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
                            pending
                        )
                    );
                }


                /* =========================
                   CREATE NOWPAYMENTS PAYMENT
                ========================= */

                const response =
                    await fetch(
                        "/api/payments/nowpayments/create",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify({
                                orderCode:
                                pending.orderCode,

                                payCurrency,
                            }),
                        }
                    );


                let data:
                    PaymentResponse = {};

                try {
                    data =
                        await response
                            .json() as PaymentResponse;
                } catch {
                    data = {};
                }


                if (
                    !response.ok ||
                    data.success !== true ||
                    !data.payment?.id
                ) {
                    throw new Error(
                        data.error ||
                        text.errors.createPayment
                    );
                }


                /* =========================
                   SAVE CHECKOUT
                ========================= */

                localStorage.setItem(
                    CHECKOUT_STORAGE_KEY,
                    JSON.stringify({
                        items:
                            checkoutItems.map(
                                item => ({
                                    ...item,
                                    quantity: 1,
                                })
                            ),

                        currency:
                        pending.currency,

                        subtotal:
                        previewTotal,

                        discount: 0,

                        total:
                        pending.amount,

                        deliveryLanguage:
                        customer.deliveryLanguage,

                        savedAt:
                            Date.now(),
                    })
                );


                sessionStorage.setItem(
                    PAYMENT_STORAGE_KEY,
                    JSON.stringify({
                        ...data.payment,

                        orderCode:
                        pending.orderCode,

                        deliveryLanguage:
                        customer.deliveryLanguage,
                    })
                );


                router.push(
                    "/payment"
                );
            } catch (reason) {
                setError(
                    reason instanceof Error
                        ? reason.message
                        : text.errors.paymentFailed
                );
            } finally {
                setBusy(false);
            }
        };


    /* =========================
       PAGE STATES
    ========================= */

    if (
        !isHydrated ||
        !loaded
    ) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>
                    {text.loading}
                </div>
            </main>
        );
    }


    if (
        !customer ||
        checkoutItems.length === 0 ||
        checkoutItems.length !==
        items.length
    ) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>
                    <h1>
                        {
                            text.invalidOrder
                                .title
                        }
                    </h1>

                    <p>
                        {
                            text.invalidOrder
                                .description
                        }
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/checkout"
                            )
                        }
                    >
                        {
                            text.invalidOrder
                                .button
                        }
                    </button>
                </div>
            </main>
        );
    }


    /* =========================
       PAGE CONTENT
    ========================= */

    return (
        <main className={styles.page}>
            <div
                className="top_lines_wrapper"
                aria-hidden="true"
            >
                <img
                    src={top_lines.src}
                    alt=""
                    className="top_lines_video_block"
                />
            </div>

            <div className={styles.shell}>
                <a
                    href="/"
                    className={styles.home}
                >
                    {text.mainPage}
                </a>

                <section
                    className={styles.card}
                >
                    <header
                        className={
                            styles.header
                        }
                    >
                        <h1>{text.title}</h1>
                        <p>{text.description}</p>
                    </header>

                    <div
                        className={
                            styles.sectionTitle
                        }
                    >
                        {text.paymentCurrency}
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
                                    className={`
                                        ${styles.option}
                                        ${
                                        payCurrency ===
                                        currency.value
                                            ? styles.active
                                            : ""
                                    }
                                    `}
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
                                                currency.value
                                            )
                                        }
                                    />

                                    <span
                                        className={
                                            styles.coin
                                        }
                                    >
                                        <Image
                                            src={
                                                currency.image
                                            }
                                            alt=""
                                        />
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
                            )
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
                                    requiresEmailVerification
                                        ? "/checkout"
                                        : "/checkout/review"
                                )
                            }
                            disabled={busy}
                        >
                            {requiresEmailVerification
                                ? verificationButtonText
                                : text.back}
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
                                busy ||
                                requiresEmailVerification
                            }
                            aria-busy={busy}
                        >
                            {busy
                                ? text.creatingPayment
                                : text.continueToPayment}
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
                            {text.order}
                        </h2>

                        <p>
                            {
                                checkoutItems.length
                            }{" "}
                            {
                                checkoutItems.length ===
                                1
                                    ? text.item
                                    : text.items
                            }{" "}
                            · $
                            {
                                previewTotal.toFixed(
                                    2
                                )
                            }
                        </p>
                    </header>

                    <div
                        className={
                            styles.sectionTitle
                        }
                    >
                        {text.orderSummary}
                    </div>

                    {checkoutItems.map(
                        item => (
                            <div
                                className={
                                    styles.product
                                }
                                key={item.id}
                            >
                                {item.imageSrc ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={
                                            item.imageSrc
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
                                        {item.name}
                                    </strong>

                                    <small>
                                        {
                                            text.oneLicense
                                        }
                                    </small>
                                </div>
                            </div>
                        )
                    )}

                    <dl>
                        <div>
                            <dt>
                                {text.total}
                            </dt>

                            <dd>
                                $
                                {
                                    previewTotal.toFixed(
                                        2
                                    )
                                }
                            </dd>
                        </div>
                    </dl>
                </aside>
            </div>

            <div
                className="bottom_lines_wrapper"
                aria-hidden="true"
            >
                <img
                    src={bottom_lines.src}
                    alt=""
                    className="bottom_lines_video_block"
                />
            </div>
        </main>
    );
}