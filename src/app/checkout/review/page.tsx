"use client";
import { useCheckoutQuote, QuoteNotice } from "@/lib/use-checkout-quote";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import { useLanguage } from "@/context/LanguageProvider";
import { useCart } from "@/components/cartPopup/CartProvider";
import { readReferralCode } from "@/lib/referral";

import TributePaymentFlow from "./TributePaymentFlow";
import { prepareTributeCheckout, validTributeUrl, type TributeSession } from "./tributeCheckout";

import editIcon from "./images/edit-line.svg";
import tether_icon from "./images/tether.svg";

import topLines from "@/app/images/video_block_top_lines.svg";
import bottomLines from "@/app/images/bottom_lines_video_block.svg";

import styles from "./review.module.css";
import "../checkout.css";


const CUSTOMER_STORAGE_KEY =
    "checkoutCustomer";

const REVIEW_STORAGE_KEY =
    "checkoutReview";

const NEXT_STEP_URL =
    "/checkout/payment";


type PaymentMethod =
    "crypto" |
    "card";

type DeliveryLanguage =
    "en" |
    "ru";


type StoredCustomer = {
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
    deliveryLanguage: DeliveryLanguage;
    accepted: boolean;

    existingCustomer: boolean;
    verificationRef?: string;
    checkoutReference: string;
    verifiedAt?: number;

    savedAt: number;
};


type StoredReview = {
    paymentMethod: PaymentMethod;
    savedAt: number;
};


/* =========================
   STORAGE VALIDATION
========================= */

function parseStoredCustomer(
    value: unknown
): StoredCustomer | null {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return null;
    }

    const {
        firstName,
        lastName,
        email,
        referralCode,
        deliveryLanguage,
        accepted,
        existingCustomer,
        verificationRef,
        checkoutReference,
        verifiedAt,
        savedAt,
    } = value as Record<string, unknown>;


    if (
        typeof firstName !== "string" ||
        typeof lastName !== "string" ||
        typeof email !== "string" ||
        typeof referralCode !== "string" ||

        (
            deliveryLanguage !== undefined &&
            deliveryLanguage !== "en" &&
            deliveryLanguage !== "ru"
        ) ||

        accepted !== true ||
        typeof existingCustomer !== "boolean" ||

        typeof checkoutReference !== "string" ||
        !checkoutReference.trim() ||

        (
            verifiedAt !== undefined &&
            typeof verifiedAt !== "number"
        ) ||

        typeof savedAt !== "number"
    ) {
        return null;
    }


    const normalizedVerificationRef =
        typeof verificationRef === "string"
            ? verificationRef.trim()
            : "";


    /*
     * Для существующего клиента наличие
     * verificationRef обязательно.
     */
    if (
        existingCustomer &&
        !normalizedVerificationRef
    ) {
        return null;
    }


    return {
        firstName:
            firstName.trim(),

        lastName:
            lastName.trim(),

        email:
            email.trim().toLowerCase(),

        referralCode:
            referralCode.trim(),

        deliveryLanguage:
            deliveryLanguage === "ru"
                ? "ru"
                : "en",

        accepted: true,

        existingCustomer,

        ...(normalizedVerificationRef
            ? {
                verificationRef:
                normalizedVerificationRef,
            }
            : {}),

        checkoutReference:
            checkoutReference.trim(),

        ...(typeof verifiedAt === "number"
            ? {
                verifiedAt,
            }
            : {}),

        savedAt,
    };
}


function isStoredReview(
    value: unknown
): value is StoredReview {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return false;
    }

    const review =
        value as Partial<StoredReview>;

    return (
        (
            review.paymentMethod === "crypto" ||
            review.paymentMethod === "card"
        ) &&
        typeof review.savedAt === "number"
    );
}


/* =========================
   PAGE
========================= */

export default function ReviewPage() {
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
        t.checkoutReview;


    const [
        isReferralLocked,
        setIsReferralLocked,
    ] = useState(false);

    const [
        customer,
        setCustomer,
    ] = useState<StoredCustomer | null>(
        null
    );

    const [
        paymentMethod,
        setPaymentMethod,
    ] = useState<PaymentMethod>(
        "crypto"
    );

    const [
        isStorageLoaded,
        setIsStorageLoaded,
    ] = useState(false);

    const [
        isTributeOpen,
        setIsTributeOpen,
    ] = useState(false);


    const [isPaying, setIsPaying] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [recoveryToken, setRecoveryToken] = useState<string>();
    const paymentInFlight = useRef(false);
    const preparedSession = useRef<TributeSession | null>(null);
    const paymentText = {
        EN: {
            busy: "Preparing payment…",
            error: "Unable to prepare payment. Please try again.",
            unsupported: "Tribute currently supports a single Aero license. Use crypto for other products or a mixed cart.",
            restoreError: "Unable to check the existing order. Please try again or contact support.",
        },
        RU: {
            busy: "Подготавливаем оплату…",
            error: "Не удалось подготовить оплату. Попробуйте ещё раз.",
            unsupported: "Через Tribute пока доступна одна лицензия Aero. Для других товаров и смешанной корзины используйте криптооплату.",
            restoreError: "Не удалось проверить существующий заказ. Повторите попытку или обратитесь в поддержку.",
        },
        UA: {
            busy: "Готуємо оплату…",
            error: "Не вдалося підготувати оплату. Спробуйте ще раз.",
            unsupported: "Через Tribute поки доступна одна ліцензія Aero. Для інших товарів і змішаного кошика використовуйте криптооплату.",
            restoreError: "Не вдалося перевірити наявне замовлення. Спробуйте ще раз або зверніться до підтримки.",
        },
    }[language];

    // The back/forward cache can restore a page whose button was still loading.
    useEffect(() => {
        const onPageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                paymentInFlight.current = false;
                setIsPaying(false);
            }
        };
        window.addEventListener("pageshow", onPageShow);
        return () => window.removeEventListener("pageshow", onPageShow);
    }, []);

    const deliveryLanguageLabel =
        language === "UA"
            ? "Мова файлів та інструкції"
            : language === "RU"
                ? "Язык файлов и инструкции"
                : "Files and instructions language";


    const locale =
        {
            UA: "uk-UA",
            RU: "ru-RU",
            EN: "en-US",
        }[language];


    /* =========================
       LOAD STORAGE
    ========================= */

    useEffect(() => {
        const storedReferralCode =
            readReferralCode();

        setIsReferralLocked(
            Boolean(storedReferralCode)
        );

        try {
            const storedCustomer =
                sessionStorage.getItem(
                    CUSTOMER_STORAGE_KEY
                );

            const storedReview =
                sessionStorage.getItem(
                    REVIEW_STORAGE_KEY
                );


            if (storedCustomer) {
                const parsedCustomer =
                    parseStoredCustomer(
                        JSON.parse(
                            storedCustomer
                        )
                    );

                if (parsedCustomer) {
                    setCustomer(
                        parsedCustomer
                    );

                    /*
                     * Записываем нормализованные данные обратно,
                     * не удаляя verificationRef,
                     * existingCustomer и checkoutReference.
                     */
                    sessionStorage.setItem(
                        CUSTOMER_STORAGE_KEY,
                        JSON.stringify(
                            parsedCustomer
                        )
                    );
                } else {
                    sessionStorage.removeItem(
                        CUSTOMER_STORAGE_KEY
                    );
                }
            }


            if (storedReview) {
                const parsedReview:
                    unknown =
                    JSON.parse(
                        storedReview
                    );

                if (
                    isStoredReview(parsedReview)
                ) {
                    setPaymentMethod(
                        parsedReview.paymentMethod
                    );
                }
            }
        } catch (error) {
            console.error(
                "REVIEW STORAGE ERROR:",
                error
            );
        } finally {
            setIsStorageLoaded(true);
        }
    }, []);


    /* =========================
       TOTALS
    ========================= */

    const pricing = useCheckoutQuote(items, customer?.referralCode ?? "", customer?.deliveryLanguage ?? "en");
    const subtotal = pricing.quote?.subtotal ?? 0;
    const discount = pricing.quote?.discount ?? 0;
    const total = pricing.quote?.total ?? 0;

    const formatter =
        useMemo(
            () =>
                new Intl.NumberFormat(
                    locale,
                    {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 2,
                    }
                ),
            [locale]
        );


    const itemCount =
        items.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );

    const plural =
        new Intl.PluralRules(
            locale
        ).select(itemCount);

    const itemLabel =
        plural === "one"
            ? text.items.one
            : plural === "few"
                ? text.items.few
                : plural === "many"
                    ? text.items.many
                    : text.items.other;


    /* =========================
       ACTIONS
    ========================= */

    const editCustomer = () => {
        if (paymentInFlight.current) return;
        router.push(
            "/checkout"
        );
    };


    const handleConfirm = async () => {
        if (!pricing.ready || !customer || items.length === 0 || paymentInFlight.current) return;
        paymentInFlight.current = true;
        setIsPaying(true);
        setPaymentError("");
        let navigating = false;
        try {
            const reviewToSave: StoredReview = { paymentMethod, savedAt: Date.now() };
            sessionStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviewToSave));

            if (paymentMethod === "card") {
                const session = await prepareTributeCheckout(
                    { ...customer, expectedTotal: total },
                    items.map(item => ({
                        id: item.id, quantity: item.quantity,
                        name: item.name, imageSrc: item.imageSrc,
                    })),
                    paymentText,
                    preparedSession.current,
                );
                preparedSession.current = session;
                if (!session.testMode && session.state === "pending" && validTributeUrl(session.paymentUrl)) {
                    window.location.assign(session.paymentUrl);
                    navigating = true;
                } else {
                    // Keep the existing status/recovery UI for paid, processing,
                    // test and manual-review orders; never create a second order.
                    setRecoveryToken(session.token);
                    setIsTributeOpen(true);
                }
                return;
            }

            router.push(NEXT_STEP_URL);
            navigating = true;
        } catch (error) {
            setPaymentError(error instanceof Error ? error.message : paymentText.error);
        } finally {
            if (!navigating) {
                paymentInFlight.current = false;
                setIsPaying(false);
            }
        }
    };

    /* =========================
       PAGE STATES
    ========================= */

    if (
        !isHydrated ||
        !isStorageLoaded
    ) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>
                    {text.loading}
                </div>
            </main>
        );
    }


    if (items.length === 0) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>
                    <h1>
                        {text.emptyCartTitle}
                    </h1>

                    <p>
                        {text.emptyCartDescription}
                    </p>

                    <a
                        href="/"
                        className={styles.back}
                    >
                        {text.mainPage}
                    </a>
                </div>
            </main>
        );
    }


    if (!customer) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>
                    <h1>
                        {text.missingCustomerTitle}
                    </h1>

                    <p>
                        {
                            text.missingCustomerDescription
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
                        {text.goToCheckout}
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
                className={styles.topLines}
                aria-hidden="true"
            >
                <img
                    src={topLines.src}
                    alt=""
                />
            </div>

            <div className={styles.shell}>
                <a
                    href="/"
                    className={styles.back}
                >
                    {text.mainPage}
                </a>

                <section
                    className={
                        styles.reviewCard
                    }
                >
                    <header
                        className={
                            styles.cardHeader
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
                        {text.orderSummaryLabel}
                    </div>

                    <div
                        className={
                            styles.customerData
                        }
                    >
                        <div
                            className={
                                styles.twoColumns
                            }
                        >
                            <div
                                className={
                                    styles.dataField
                                }
                            >
                                <span>
                                    {text.firstName}{" "}
                                    <b>*</b>
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        editCustomer
                                    }
                                >
                                    <strong>
                                        {
                                            customer.firstName
                                        }
                                    </strong>

                                    <img
                                        src={
                                            editIcon.src
                                        }
                                        alt=""
                                        className={
                                            styles.editIcon
                                        }
                                    />
                                </button>
                            </div>

                            <div
                                className={
                                    styles.dataField
                                }
                            >
                                <span>
                                    {text.lastName}{" "}
                                    <b>*</b>
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        editCustomer
                                    }
                                >
                                    <strong>
                                        {
                                            customer.lastName
                                        }
                                    </strong>

                                    <img
                                        src={
                                            editIcon.src
                                        }
                                        alt=""
                                        className={
                                            styles.editIcon
                                        }
                                    />
                                </button>
                            </div>
                        </div>

                        <div
                            className={
                                styles.dataField
                            }
                        >
                            <span>
                                {text.email}{" "}
                                <b>*</b>
                            </span>

                            <button
                                type="button"
                                onClick={
                                    editCustomer
                                }
                            >
                                <strong>
                                    {customer.email}
                                </strong>

                                <img
                                    src={
                                        editIcon.src
                                    }
                                    alt=""
                                    className={
                                        styles.editIcon
                                    }
                                />
                            </button>
                        </div>

                        <div
                            className={
                                styles.dataField
                            }
                        >
                            <span>
                                {text.referralCode}
                            </span>

                            <button
                                type="button"
                                onClick={
                                    isReferralLocked
                                        ? undefined
                                        : editCustomer
                                }
                                disabled={
                                    isReferralLocked
                                }
                                className={
                                    isReferralLocked
                                        ? styles.referralFieldLocked
                                        : undefined
                                }
                            >
                                <strong>
                                    {
                                        customer.referralCode ||
                                        "—"
                                    }
                                </strong>

                                {!isReferralLocked && (
                                    <img
                                        src={
                                            editIcon.src
                                        }
                                        alt=""
                                        className={
                                            styles.editIcon
                                        }
                                    />
                                )}
                            </button>
                        </div>

                        <div
                            className={
                                styles.dataField
                            }
                        >
                            <span>
                                {
                                    deliveryLanguageLabel
                                }
                            </span>

                            <button
                                type="button"
                                onClick={
                                    editCustomer
                                }
                            >
                                <strong>
                                    {
                                        customer.deliveryLanguage ===
                                        "ru"
                                            ? "Русский"
                                            : "English"
                                    }
                                </strong>

                                <img
                                    src={
                                        editIcon.src
                                    }
                                    alt=""
                                    className={
                                        styles.editIcon
                                    }
                                />
                            </button>
                        </div>
                    </div>

                    <div
                        className={
                            styles.sectionTitle
                        }
                    >
                        {text.paymentMethod}
                    </div>

                    <fieldset
                        className={
                            styles.paymentMethods
                        }
                    >
                        <legend
                            className={
                                styles.visuallyHidden
                            }
                        >
                            {
                                text.choosePaymentMethod
                            }
                        </legend>

                        <label
                            className={`
                                ${styles.paymentOption}
                                ${
                                paymentMethod ===
                                "crypto"
                                    ? styles.paymentOptionActive
                                    : ""
                            }
                            `}
                        >
                            <input
                                type="radio"
                                disabled={isPaying}
                                name="paymentMethod"
                                value="crypto"
                                checked={
                                    paymentMethod ===
                                    "crypto"
                                }
                                onChange={() =>
                                    setPaymentMethod(
                                        "crypto"
                                    )
                                }
                            />

                            <img
                                className={
                                    styles.cryptoIcon
                                }
                                src={
                                    tether_icon.src
                                }
                                alt=""
                            />

                            <strong>
                                {text.crypto}
                            </strong>

                            <span
                                className={
                                    styles.radioMark
                                }
                                aria-hidden="true"
                            />
                        </label>

                        <label
                            className={`
                                
                                ${styles.paymentOption}
                                ${
                                paymentMethod ===
                                "card"
                                    ? styles.paymentOptionActive
                                    : ""
                            }
                            `}
                        >
                            <input
                                type="radio"
                                disabled={isPaying}
                                name="paymentMethod"
                                value="card"
                                checked={
                                    paymentMethod ===
                                    "card"
                                }
                                onChange={() =>
                                    setPaymentMethod(
                                        "card"
                                    )
                                }
                            />

                            <span
                                className={
                                    styles.cardBrands
                                }
                                aria-hidden="true"
                            >
                                <span
                                    className={
                                        styles.visa
                                    }
                                >
                                    VISA
                                </span>

                                <span
                                    className={
                                        styles.mastercard
                                    }
                                />
                            </span>

                            <strong>
                                Visa/Mastercard
                            </strong>

                            <span
                                className={
                                    styles.radioMark
                                }
                                aria-hidden="true"
                            />
                        </label>
                    </fieldset>


                    {paymentError && (
                        <p role="alert" style={{ padding: "0 24px", color: "#b42318" }}>
                            {paymentError}
                        </p>
                    )}

                    <footer
                        className={
                            styles.actions
                        }
                    >
                        <button
                            type="button"
                            className={
                                styles.backButton
                            }
                            disabled={isPaying}
                            onClick={() =>
                                router.push(
                                    "/checkout"
                                )
                            }
                        >
                            {text.back}
                        </button>

                        <button
                            type="button"
                            className={
                                styles.confirmButton
                            }
                            disabled={!pricing.ready || isPaying || isTributeOpen}
                            aria-busy={isPaying}
                            onClick={
                                handleConfirm
                            }
                        >
                            {
                                isPaying ? paymentText.busy : text.confirmAndPay
                            }
                        </button>
                    </footer>
                </section>

                <aside
                    className={
                        styles.summaryCard
                    }
                    aria-label={
                        text.orderSummary
                    }
                >
                    <header
                        className={
                            styles.summaryHeader
                        }
                    >
                        <h2>
                            {text.order}
                        </h2>

                        <p>
                            {itemCount}{" "}
                            {itemLabel} ·{" "}
                            {
                                (pricing.ready ? formatter.format(total) : "—")
                            }
                        </p>
                    </header>

                    <div
                        className={
                            styles.sectionTitle
                        }
                    >
                        {text.orderSummaryLabel}
                    </div>

                    <ul
                        className={
                            styles.items
                        }
                    >
                        {items.map(item => (
                            <li
                                className={
                                    styles.item
                                }
                                key={item.id}
                            >
                                <div
                                    className={
                                        styles.itemImage
                                    }
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
                                        <span
                                            aria-hidden="true"
                                        >
                                            ◇
                                        </span>
                                    )}
                                </div>

                                <div
                                    className={
                                        styles.itemText
                                    }
                                >
                                    <strong>
                                        {item.name}
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
                                            {
                                                text.quantity
                                            }
                                                :{" "}
                                                {
                                                    item.quantity
                                                }
                                        </span>
                                        )}
                                </div>

                                <span
                                    className={
                                        styles.itemPrice
                                    }
                                >
                                    {
                                        formatter.format(
                                            item.unitPrice *
                                            item.quantity
                                        )
                                    }
                                </span>
                            </li>
                        ))}
                    </ul>

                    <dl
                        className={
                            styles.totals
                        }
                    >
                        <div>
                            <dt>
                                {text.subtotal}
                            </dt>

                            <dd>
                                {
                                    (pricing.ready ? formatter.format(subtotal) : "—")
                                }
                            </dd>
                        </div>

                        <div>
                            <dt>
                                {text.discount}
                            </dt>

                            <dd>
                                {
                                    (pricing.ready ? formatter.format(discount) : "—")
                                }
                            </dd>
                        </div>

                        <div
                            className={
                                styles.total
                            }
                        >
                            <dt>
                                {text.total}
                            </dt>

                            <dd>
                                {
                                    (pricing.ready ? formatter.format(total) : "—")
                                }
                            </dd>
                        </div>
                    </dl>
                </aside>
            </div>

            <div
                className={
                    styles.bottomLines
                }
                aria-hidden="true"
            >
                <img
                    src={bottomLines.src}
                    alt=""
                />
            </div>

            <TributePaymentFlow
                isOpen={isTributeOpen}
                recoveryToken={recoveryToken}
                onClose={() => setIsTributeOpen(false)}
                customer={customer}
                items={items.map(item => ({ id: item.id, quantity: item.quantity }))}
            />
        </main>
    );
}