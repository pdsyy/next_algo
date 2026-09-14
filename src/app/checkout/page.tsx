"use client";

import {
    type FormEvent,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import {
    GoogleReCaptchaProvider,
    useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

import { useCart } from "@/components/cartPopup/CartProvider";
import { useLanguage } from "@/context/LanguageProvider";

import top_lines from "@/app/images/video_block_top_lines.svg";
import bottom_lines from "@/app/images/bottom_lines_video_block.svg";

import {
    captureReferralFromUrl,
    readReferralCode,
} from "@/lib/referral";

import LanguageHandler, {
    type DeliveryLanguage,
} from "@/components/LanguageHandler";

import styles from "./checkout.module.css";
import "./checkout.css";


const CUSTOMER_STORAGE_KEY =
    "checkoutCustomer";

const REVIEW_PAGE_URL =
    "/checkout/review";


type CustomerForm = {
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
    deliveryLanguage: DeliveryLanguage;
    accepted: boolean;
};


type StoredCustomer =
    Omit<CustomerForm, "deliveryLanguage"> & {
    deliveryLanguage?: DeliveryLanguage;

    existingCustomer?: boolean;
    verificationRef?: string;
    checkoutReference?: string;
    verifiedAt?: number;

    savedAt: number;
};


type VerifiedCustomer = {
    email: string;
    verificationRef: string;
    verifiedAt: number;
};


type CheckoutApiResponse = {
    success?: boolean;
    error?: string;

    verificationRequired?: boolean;
    existingCustomer?: boolean;
    verificationRef?: string;
    verified?: boolean;
};


type OtpFeedback = {
    type: "error" | "success";
    message: string;
};


const initialForm: CustomerForm = {
    firstName: "",
    lastName: "",
    email: "",
    referralCode: "",
    deliveryLanguage: "en",
    accepted: false,
};


const OTP_TEXT = {
    EN: {
        title: "Verify your email",
        description:
            "We sent a six-digit verification code to",
        descriptionAfter:
            "Enter the code to continue.",
        codeLabel: "Verification code",
        codePlaceholder: "000000",
        close: "Close",
        back: "Back",
        confirm: "Confirm",
        verifying: "Checking...",
        resend: "Send code again",
        resending: "Sending...",
        resent: "A new verification code has been sent.",
        invalidCode:
            "Enter the six-digit verification code.",
        unableToVerify:
            "Unable to verify the email address.",
        unableToResend:
            "Unable to send a new verification code.",
    },

    RU: {
        title: "Подтвердите email",
        description:
            "Мы отправили шестизначный код подтверждения на",
        descriptionAfter:
            "Введите код, чтобы продолжить.",
        codeLabel: "Код подтверждения",
        codePlaceholder: "000000",
        close: "Закрыть",
        back: "Назад",
        confirm: "Подтвердить",
        verifying: "Проверяем...",
        resend: "Отправить код ещё раз",
        resending: "Отправляем...",
        resent: "Новый код подтверждения отправлен.",
        invalidCode:
            "Введите шестизначный код подтверждения.",
        unableToVerify:
            "Не удалось подтвердить email.",
        unableToResend:
            "Не удалось повторно отправить код.",
    },

    UA: {
        title: "Підтвердьте email",
        description:
            "Ми надіслали шестизначний код підтвердження на",
        descriptionAfter:
            "Введіть код, щоб продовжити.",
        codeLabel: "Код підтвердження",
        codePlaceholder: "000000",
        close: "Закрити",
        back: "Назад",
        confirm: "Підтвердити",
        verifying: "Перевіряємо...",
        resend: "Надіслати код ще раз",
        resending: "Надсилаємо...",
        resent: "Новий код підтвердження надіслано.",
        invalidCode:
            "Введіть шестизначний код підтвердження.",
        unableToVerify:
            "Не вдалося підтвердити email.",
        unableToResend:
            "Не вдалося повторно надіслати код.",
    },
} as const;


/* =========================
   HELPERS
========================= */

function isDeliveryLanguage(
    value: unknown
): value is DeliveryLanguage {
    return value === "en" || value === "ru";
}


function isStoredCustomer(
    value: unknown
): value is StoredCustomer {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return false;
    }

    const customer =
        value as Partial<StoredCustomer>;

    return (
        typeof customer.firstName === "string" &&
        typeof customer.lastName === "string" &&
        typeof customer.email === "string" &&
        typeof customer.referralCode === "string" &&

        (
            customer.deliveryLanguage === undefined ||
            isDeliveryLanguage(
                customer.deliveryLanguage
            )
        ) &&

        typeof customer.accepted === "boolean" &&

        (
            customer.existingCustomer === undefined ||
            typeof customer.existingCustomer === "boolean"
        ) &&

        (
            customer.verificationRef === undefined ||
            typeof customer.verificationRef === "string"
        ) &&

        (
            customer.checkoutReference === undefined ||
            typeof customer.checkoutReference === "string"
        ) &&

        (
            customer.verifiedAt === undefined ||
            typeof customer.verifiedAt === "number"
        ) &&

        typeof customer.savedAt === "number"
    );
}


function generateCheckoutReference() {
    const randomValue =
        typeof window !== "undefined" &&
        typeof window.crypto?.randomUUID === "function"
            ? window.crypto.randomUUID()
            : `${Date.now()}_${Math.random()
                .toString(36)
                .slice(2)}`;

    return `checkout_${randomValue}`;
}


async function postCheckoutAction(
    payload: Record<string, unknown>
): Promise<CheckoutApiResponse> {
    const response =
        await fetch("/api/checkout", {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(payload),
        });

    let result: CheckoutApiResponse = {};

    try {
        result =
            await response.json() as CheckoutApiResponse;
    } catch {
        result = {};
    }

    if (
        !response.ok ||
        result.success !== true
    ) {
        throw new Error(
            result.error ||
            "Checkout request failed"
        );
    }

    return result;
}


/* =========================
   CHECKOUT CONTENT
========================= */

function CheckoutContent() {
    const router = useRouter();

    const { executeRecaptcha } =
        useGoogleReCaptcha();

    const {
        items,
        isHydrated,
    } = useCart();

    const {
        t,
        language,
    } = useLanguage();

    const text =
        t.checkoutCustomer;

    const otpText =
        language === "RU"
            ? OTP_TEXT.RU
            : language === "UA"
                ? OTP_TEXT.UA
                : OTP_TEXT.EN;


    const [form, setForm] =
        useState<CustomerForm>(() => ({
            ...initialForm,

            deliveryLanguage:
                language === "EN"
                    ? "en"
                    : "ru",
        }));

    const [
        isReferralLocked,
        setIsReferralLocked,
    ] = useState(false);

    const [
        checkoutReference,
        setCheckoutReference,
    ] = useState("");

    const [
        verifiedCustomer,
        setVerifiedCustomer,
    ] = useState<VerifiedCustomer | null>(
        null
    );

    const [
        verificationRef,
        setVerificationRef,
    ] = useState("");

    const [
        isOtpOpen,
        setIsOtpOpen,
    ] = useState(false);

    const [
        otp,
        setOtp,
    ] = useState("");

    const [
        otpFeedback,
        setOtpFeedback,
    ] = useState<OtpFeedback | null>(
        null
    );

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        isVerifyingOtp,
        setIsVerifyingOtp,
    ] = useState(false);

    const [
        isResendingOtp,
        setIsResendingOtp,
    ] = useState(false);

    const [
        submitError,
        setSubmitError,
    ] = useState("");


    /* =========================
       RESTORE CHECKOUT
    ========================= */

    useEffect(() => {
        const capturedReferral =
            captureReferralFromUrl();

        const storedReferral =
            capturedReferral ||
            readReferralCode();

        setIsReferralLocked(
            Boolean(storedReferral)
        );

        const fallbackReference =
            generateCheckoutReference();

        setCheckoutReference(
            fallbackReference
        );

        try {
            const stored =
                sessionStorage.getItem(
                    CUSTOMER_STORAGE_KEY
                );

            if (!stored) {
                if (storedReferral) {
                    setForm(current => ({
                        ...current,
                        referralCode:
                        storedReferral,
                    }));
                }

                return;
            }

            const customer: unknown =
                JSON.parse(stored);

            if (
                !isStoredCustomer(customer)
            ) {
                return;
            }

            const normalizedEmail =
                customer.email
                    .trim()
                    .toLowerCase();

            setForm(current => ({
                firstName:
                customer.firstName,

                lastName:
                customer.lastName,

                email:
                normalizedEmail,

                referralCode:
                    storedReferral ||
                    customer.referralCode,

                deliveryLanguage:
                    customer.deliveryLanguage ??
                    current.deliveryLanguage,

                accepted:
                customer.accepted,
            }));

            if (
                customer.checkoutReference
                    ?.trim()
            ) {
                setCheckoutReference(
                    customer
                        .checkoutReference
                        .trim()
                );
            }

            if (
                customer.existingCustomer === true &&
                customer.verificationRef?.trim()
            ) {
                setVerifiedCustomer({
                    email:
                    normalizedEmail,

                    verificationRef:
                        customer
                            .verificationRef
                            .trim(),

                    verifiedAt:
                        customer.verifiedAt ??
                        customer.savedAt,
                });
            }
        } catch (error) {
            console.error(
                "CUSTOMER STORAGE ERROR:",
                error
            );

            sessionStorage.removeItem(
                CUSTOMER_STORAGE_KEY
            );
        }
    }, []);


    /* =========================
       TOTALS
    ========================= */

    const subtotal =
        useMemo(
            () =>
                items.reduce(
                    (sum, item) =>
                        sum +
                        item.unitPrice *
                        item.quantity,
                    0
                ),
            [items]
        );

    const discount = 0;

    const total =
        Math.max(
            0,
            subtotal - discount
        );

    const locale =
        language === "UA"
            ? "uk-UA"
            : language === "RU"
                ? "ru-RU"
                : "en-US";

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

    const pluralForm =
        new Intl.PluralRules(
            locale
        ).select(itemCount);

    const itemLabel =
        pluralForm === "one"
            ? text.items.one
            : pluralForm === "few"
                ? text.items.few
                : pluralForm === "many"
                    ? text.items.many
                    : text.items.other;


    /* =========================
       VALIDATION
    ========================= */

    const canSubmit =
        form.firstName.trim().length > 0 &&
        form.lastName.trim().length > 0 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            form.email.trim()
        ) &&
        form.accepted &&
        items.length > 0;

    const canVerifyOtp =
        /^\d{6}$/.test(otp);

    const isOtpBusy =
        isVerifyingOtp ||
        isResendingOtp;


    /* =========================
       FORM HELPERS
    ========================= */

    const updateField =
        <Key extends keyof CustomerForm>(
            field: Key,
            value: CustomerForm[Key]
        ) => {
            setForm(current => ({
                ...current,
                [field]: value,
            }));

            if (field === "email") {
                setVerifiedCustomer(null);
                setVerificationRef("");
                setOtp("");
                setOtpFeedback(null);
                setCheckoutReference("");
            }

            setSubmitError("");
        };


    const verifyCaptcha =
        async (
            action: string
        ) => {
            if (!executeRecaptcha) {
                throw new Error(
                    text.recaptchaLoading
                );
            }

            const captchaToken =
                await executeRecaptcha(
                    action
                );

            const captchaResponse =
                await fetch(
                    "/api/verify-recaptcha",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            token:
                            captchaToken,
                        }),
                    }
                );

            const captchaResult =
                await captchaResponse.json() as {
                    verified?: boolean;
                    error?: string;
                };

            if (
                !captchaResponse.ok ||
                captchaResult.verified !== true
            ) {
                throw new Error(
                    captchaResult.error ||
                    text.recaptchaVerificationFailed
                );
            }
        };


    const saveCustomerAndContinue =
        ({
             existingCustomer,
             customerVerificationRef,
             reference,
         }: {
            existingCustomer: boolean;
            customerVerificationRef?: string;
            reference: string;
        }) => {
            const customerToSave:
                StoredCustomer = {
                firstName:
                    form.firstName.trim(),

                lastName:
                    form.lastName.trim(),

                email:
                    form.email
                        .trim()
                        .toLowerCase(),

                referralCode:
                    form.referralCode.trim(),

                deliveryLanguage:
                form.deliveryLanguage,

                accepted:
                form.accepted,

                existingCustomer,
                checkoutReference:
                reference,

                ...(customerVerificationRef
                    ? {
                        verificationRef:
                        customerVerificationRef,

                        verifiedAt:
                            Date.now(),
                    }
                    : {}),

                savedAt:
                    Date.now(),
            };

            sessionStorage.setItem(
                CUSTOMER_STORAGE_KEY,
                JSON.stringify(
                    customerToSave
                )
            );

            router.push(
                REVIEW_PAGE_URL
            );
        };


    /* =========================
       INITIAL SUBMIT
    ========================= */

    const handleSubmit =
        async (
            event:
                FormEvent<HTMLFormElement>
        ) => {
            event.preventDefault();

            if (
                !canSubmit ||
                isSubmitting ||
                items.length === 0
            ) {
                return;
            }

            setIsSubmitting(true);
            setSubmitError("");

            try {
                await verifyCaptcha(
                    "checkout_submit"
                );

                const email =
                    form.email
                        .trim()
                        .toLowerCase();

                const reference =
                    checkoutReference ||
                    generateCheckoutReference();

                setCheckoutReference(
                    reference
                );

                /*
                 * Пользователь уже подтвердил email
                 * и вернулся с review обратно.
                 */
                if (
                    verifiedCustomer &&
                    verifiedCustomer.email === email &&
                    verifiedCustomer.verificationRef
                ) {
                    saveCustomerAndContinue({
                        existingCustomer:
                            true,

                        customerVerificationRef:
                        verifiedCustomer
                            .verificationRef,

                        reference,
                    });

                    return;
                }

                const result =
                    await postCheckoutAction({
                        action:
                            "resolve-customer",

                        email,
                    });

                if (
                    result.verificationRequired
                ) {
                    const receivedReference =
                        result.verificationRef
                            ?.trim();

                    if (!receivedReference) {
                        throw new Error(
                            otpText.unableToVerify
                        );
                    }

                    setVerificationRef(
                        receivedReference
                    );

                    setOtp("");
                    setOtpFeedback(null);
                    setIsOtpOpen(true);

                    return;
                }

                saveCustomerAndContinue({
                    existingCustomer:
                        false,

                    reference,
                });
            } catch (error) {
                setSubmitError(
                    error instanceof Error
                        ? error.message
                        : text.unableToContinue
                );
            } finally {
                setIsSubmitting(false);
            }
        };


    /* =========================
       VERIFY OTP
    ========================= */

    const handleVerifyOtp =
        async (
            event:
                FormEvent<HTMLFormElement>
        ) => {
            event.preventDefault();

            if (
                !canVerifyOtp ||
                !verificationRef ||
                isOtpBusy
            ) {
                if (!canVerifyOtp) {
                    setOtpFeedback({
                        type: "error",
                        message:
                        otpText.invalidCode,
                    });
                }

                return;
            }

            setIsVerifyingOtp(true);
            setOtpFeedback(null);

            try {
                const result =
                    await postCheckoutAction({
                        action:
                            "verify-customer",

                        verificationRef,
                        otp,
                    });

                if (
                    result.verified !== true
                ) {
                    throw new Error(
                        otpText.unableToVerify
                    );
                }

                const confirmedReference =
                    result.verificationRef
                        ?.trim() ||
                    verificationRef;

                const email =
                    form.email
                        .trim()
                        .toLowerCase();

                const reference =
                    checkoutReference ||
                    generateCheckoutReference();

                setVerifiedCustomer({
                    email,

                    verificationRef:
                    confirmedReference,

                    verifiedAt:
                        Date.now(),
                });

                saveCustomerAndContinue({
                    existingCustomer:
                        true,

                    customerVerificationRef:
                    confirmedReference,

                    reference,
                });
            } catch (error) {
                setOtpFeedback({
                    type: "error",

                    message:
                        error instanceof Error
                            ? error.message
                            : otpText.unableToVerify,
                });
            } finally {
                setIsVerifyingOtp(false);
            }
        };


    /* =========================
       RESEND OTP
    ========================= */

    const handleResendOtp =
        async () => {
            if (isOtpBusy) {
                return;
            }

            const email =
                form.email
                    .trim()
                    .toLowerCase();

            if (!email) {
                return;
            }

            setIsResendingOtp(true);
            setOtpFeedback(null);

            try {
                await verifyCaptcha(
                    "checkout_resend_otp"
                );

                const result =
                    await postCheckoutAction({
                        action:
                            "resolve-customer",

                        email,
                    });

                const newReference =
                    result.verificationRef
                        ?.trim();

                if (
                    !result.verificationRequired ||
                    !newReference
                ) {
                    throw new Error(
                        otpText.unableToResend
                    );
                }

                setVerificationRef(
                    newReference
                );

                setOtp("");

                setOtpFeedback({
                    type: "success",
                    message:
                    otpText.resent,
                });
            } catch (error) {
                setOtpFeedback({
                    type: "error",

                    message:
                        error instanceof Error
                            ? error.message
                            : otpText.unableToResend,
                });
            } finally {
                setIsResendingOtp(false);
            }
        };


    const closeOtpDialog = () => {
        if (isOtpBusy) {
            return;
        }

        setIsOtpOpen(false);
        setVerificationRef("");
        setOtp("");
        setOtpFeedback(null);
    };


    /* =========================
       PAGE STATES
    ========================= */

    if (!isHydrated) {
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
                <a
                    href="/"
                    className={styles.back}
                >
                    {text.mainPage}
                </a>

                <div className={styles.state}>
                    <h1>
                        {text.emptyCartTitle}
                    </h1>

                    <p>
                        {text.emptyCartDescription}
                    </p>
                </div>
            </main>
        );
    }


    /* =========================
       PAGE
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
                    className={styles.back}
                >
                    {text.mainPage}
                </a>

                <form
                    className={
                        styles.customerCard
                    }
                    onSubmit={
                        handleSubmit
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
                            styles.formBody
                        }
                    >
                        <div
                            className={
                                styles.twoColumns
                            }
                        >
                            <label
                                className={
                                    styles.field
                                }
                            >
                                <span>
                                    {text.firstName}{" "}
                                    <b>*</b>
                                </span>

                                <input
                                    type="text"
                                    value={
                                        form.firstName
                                    }
                                    onChange={
                                        event =>
                                            updateField(
                                                "firstName",
                                                event.target.value
                                            )
                                    }
                                    placeholder={
                                        text.firstNamePlaceholder
                                    }
                                    autoComplete="given-name"
                                    required
                                />
                            </label>

                            <label
                                className={
                                    styles.field
                                }
                            >
                                <span>
                                    {text.lastName}{" "}
                                    <b>*</b>
                                </span>

                                <input
                                    type="text"
                                    value={
                                        form.lastName
                                    }
                                    onChange={
                                        event =>
                                            updateField(
                                                "lastName",
                                                event.target.value
                                            )
                                    }
                                    placeholder={
                                        text.lastNamePlaceholder
                                    }
                                    autoComplete="family-name"
                                    required
                                />
                            </label>
                        </div>

                        <label
                            className={
                                styles.field
                            }
                        >
                            <span>
                                {text.email}{" "}
                                <b>*</b>
                            </span>

                            <input
                                type="email"
                                value={form.email}
                                onChange={
                                    event =>
                                        updateField(
                                            "email",
                                            event.target.value
                                        )
                                }
                                placeholder={
                                    text.emailPlaceholder
                                }
                                autoComplete="email"
                                required
                            />
                        </label>

                        <label
                            className={
                                styles.field
                            }
                        >
                            <span>
                                {text.referralCode}
                            </span>

                            <input
                                type="text"
                                value={
                                    form.referralCode
                                }
                                onChange={
                                    event =>
                                        updateField(
                                            "referralCode",
                                            event.target.value
                                        )
                                }
                                disabled={
                                    isReferralLocked
                                }
                                className={
                                    isReferralLocked
                                        ? styles.referralInputLocked
                                        : undefined
                                }
                            />

                            {isReferralLocked && (
                                <small
                                    className={
                                        styles.referralLockedHint
                                    }
                                >
                                    {t.referralLocked}
                                </small>
                            )}
                        </label>

                        <div
                            className={
                                styles.field
                            }
                        >
                            <span>
                                {t.deliveryLanguageLabel}
                            </span>

                            <LanguageHandler
                                value={
                                    form.deliveryLanguage
                                }
                                onChange={
                                    deliveryLanguage =>
                                        updateField(
                                            "deliveryLanguage",
                                            deliveryLanguage
                                        )
                                }
                            />
                        </div>

                        <label
                            className={
                                styles.agreement
                            }
                        >
                            <input
                                type="checkbox"
                                checked={
                                    form.accepted
                                }
                                onChange={
                                    event =>
                                        updateField(
                                            "accepted",
                                            event.target.checked
                                        )
                                }
                                required
                            />

                            <span>
                                {text.agreement}
                            </span>
                        </label>

                        <p
                            className={
                                styles.captchaNotice
                            }
                        >
                            {text.captchaNotice.beforeLinks}

                            <a
                                href="https://policies.google.com/privacy"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {
                                    text.captchaNotice
                                        .privacyPolicy
                                }
                            </a>

                            {
                                text.captchaNotice
                                    .betweenLinks
                            }

                            <a
                                href="https://policies.google.com/terms"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {
                                    text.captchaNotice
                                        .termsOfService
                                }
                            </a>

                            {
                                text.captchaNotice
                                    .afterLinks
                            }
                        </p>

                        {submitError && (
                            <p
                                className={
                                    styles.submitError
                                }
                                role="alert"
                            >
                                {submitError}
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
                                styles.cancel
                            }
                            onClick={() =>
                                router.back()
                            }
                            disabled={
                                isSubmitting
                            }
                        >
                            {text.cancel}
                        </button>

                        <button
                            type="submit"
                            className={
                                styles.buy
                            }
                            disabled={
                                !canSubmit ||
                                isSubmitting
                            }
                        >
                            {isSubmitting
                                ? text.checking
                                : text.buy}
                        </button>
                    </footer>
                </form>

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
                        <h2>{text.order}</h2>

                        <p>
                            {itemCount} {itemLabel}{" "}
                            ·{" "}
                            {
                                formatter.format(
                                    total
                                )
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
                                    formatter.format(
                                        subtotal
                                    )
                                }
                            </dd>
                        </div>

                        <div>
                            <dt>
                                {text.discount}
                            </dt>

                            <dd>
                                {
                                    formatter.format(
                                        discount
                                    )
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
                                    formatter.format(
                                        total
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


            {/* OTP MODAL */}

            {isOtpOpen && (
                <div
                    className={
                        styles.otpBackdrop
                    }
                    role="presentation"
                >
                    <form
                        className={
                            styles.otpDialog
                        }
                        onSubmit={
                            handleVerifyOtp
                        }
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="otp-title"
                    >
                        <button
                            type="button"
                            className={
                                styles.otpClose
                            }
                            onClick={
                                closeOtpDialog
                            }
                            disabled={
                                isOtpBusy
                            }
                            aria-label={
                                otpText.close
                            }
                        >
                            ×
                        </button>

                        <header
                            className={
                                styles.otpHeader
                            }
                        >
                            <h2 id="otp-title">
                                {otpText.title}
                            </h2>

                            <p>
                                {
                                    otpText.description
                                }{" "}
                                <strong>
                                    {
                                        form.email
                                            .trim()
                                            .toLowerCase()
                                    }
                                </strong>
                                .{" "}
                                {
                                    otpText.descriptionAfter
                                }
                            </p>
                        </header>

                        <label
                            className={
                                styles.otpField
                            }
                        >
                            <span>
                                {otpText.codeLabel}
                            </span>

                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                value={otp}
                                onChange={
                                    event => {
                                        setOtp(
                                            event.target.value
                                                .replace(
                                                    /\D/g,
                                                    ""
                                                )
                                                .slice(
                                                    0,
                                                    6
                                                )
                                        );

                                        setOtpFeedback(
                                            null
                                        );
                                    }
                                }
                                placeholder={
                                    otpText.codePlaceholder
                                }
                                maxLength={6}
                                autoFocus
                                disabled={
                                    isOtpBusy
                                }
                            />
                        </label>

                        {otpFeedback && (
                            <p
                                className={
                                    otpFeedback.type ===
                                    "success"
                                        ? styles.otpSuccess
                                        : styles.otpError
                                }
                                role={
                                    otpFeedback.type ===
                                    "error"
                                        ? "alert"
                                        : "status"
                                }
                            >
                                {
                                    otpFeedback.message
                                }
                            </p>
                        )}

                        <button
                            type="button"
                            className={
                                styles.otpResend
                            }
                            onClick={
                                handleResendOtp
                            }
                            disabled={
                                isOtpBusy
                            }
                        >
                            {isResendingOtp
                                ? otpText.resending
                                : otpText.resend}
                        </button>

                        <div
                            className={
                                styles.otpActions
                            }
                        >
                            <button
                                type="button"
                                className={
                                    styles.otpBack
                                }
                                onClick={
                                    closeOtpDialog
                                }
                                disabled={
                                    isOtpBusy
                                }
                            >
                                {otpText.back}
                            </button>

                            <button
                                type="submit"
                                className={
                                    styles.otpConfirm
                                }
                                disabled={
                                    !canVerifyOtp ||
                                    isOtpBusy
                                }
                            >
                                {isVerifyingOtp
                                    ? otpText.verifying
                                    : otpText.confirm}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </main>
    );
}


/* =========================
   PAGE
========================= */

export default function CheckoutPage() {
    const { t } =
        useLanguage();

    const siteKey =
        process.env
            .NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
        return (
            <main className={styles.page}>
                {
                    t.checkoutCustomer
                        .recaptchaSiteKeyMissing
                }
            </main>
        );
    }

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={siteKey}
            scriptProps={{
                async: true,
                defer: true,
                appendTo: "head",
            }}
        >
            <CheckoutContent />
        </GoogleReCaptchaProvider>
    );
}