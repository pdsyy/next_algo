"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    GoogleReCaptchaProvider,
    useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

import { useCart } from "@/components/cartPopup/CartProvider";
import { useLanguage } from "@/context/LanguageProvider";
import top_lines from "@/app/images/video_block_top_lines.svg";
import bottom_lines from "@/app/images/bottom_lines_video_block.svg";
import styles from "./checkout.module.css";
import "./checkout.css";
import {
    captureReferralFromUrl,
    readReferralCode,
} from "@/lib/referral";

const CUSTOMER_STORAGE_KEY = "checkoutCustomer";
const REVIEW_PAGE_URL = "/checkout/review";

type CustomerForm = {
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
    accepted: boolean;
};

type StoredCustomer = CustomerForm & {
    savedAt: number;
};

const initialForm: CustomerForm = {
    firstName: "",
    lastName: "",
    email: "",
    referralCode: "",
    accepted: false,
};

function isStoredCustomer(value: unknown): value is StoredCustomer {
    if (!value || typeof value !== "object") return false;

    const customer = value as Partial<StoredCustomer>;

    return (
        typeof customer.firstName === "string" &&
        typeof customer.lastName === "string" &&
        typeof customer.email === "string" &&
        typeof customer.referralCode === "string" &&
        typeof customer.accepted === "boolean" &&
        typeof customer.savedAt === "number"
    );
}

function CheckoutContent() {

    const [isReferralLocked, setIsReferralLocked] = useState(false);
    const router = useRouter();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const { items, isHydrated } = useCart();
    const { t, language } = useLanguage();
    const text = t.checkoutCustomer;

    const [form, setForm] = useState<CustomerForm>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        const capturedReferral = captureReferralFromUrl();
        const storedReferral = capturedReferral || readReferralCode();

        setIsReferralLocked(Boolean(storedReferral));

        try {
            const stored = sessionStorage.getItem(CUSTOMER_STORAGE_KEY);

            if (!stored) {
                if (storedReferral) {
                    setForm((current) => ({
                        ...current,
                        referralCode: storedReferral,
                    }));
                }

                return;
            }

            const customer: unknown = JSON.parse(stored);
            if (!isStoredCustomer(customer)) return;

            setForm({
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                referralCode: storedReferral || customer.referralCode,
                accepted: customer.accepted,
            });
        } catch (error) {
            console.error("CUSTOMER STORAGE ERROR:", error);
            sessionStorage.removeItem(CUSTOMER_STORAGE_KEY);
        }
    }, []);

    const subtotal = useMemo(
        () =>
            items.reduce(
                (sum, item) => sum + item.unitPrice * item.quantity,
                0,
            ),
        [items],
    );

    const discount = 0;
    const total = Math.max(0, subtotal - discount);
    const locale =
        language === "UA"
            ? "uk-UA"
            : language === "RU"
                ? "ru-RU"
                : "en-US";

    const formatter = useMemo(
        () =>
            new Intl.NumberFormat(locale, {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 2,
            }),
        [locale],
    );

    const itemCount = items.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );
    const pluralForm = new Intl.PluralRules(locale).select(itemCount);
    const itemLabel =
        pluralForm === "one"
            ? text.items.one
            : pluralForm === "few"
                ? text.items.few
                : pluralForm === "many"
                    ? text.items.many
                    : text.items.other;

    const canSubmit =
        form.firstName.trim().length > 0 &&
        form.lastName.trim().length > 0 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
        form.accepted &&
        items.length > 0;

    const updateField = <Key extends keyof CustomerForm>(
        field: Key,
        value: CustomerForm[Key],
    ) => {
        setForm(current => ({ ...current, [field]: value }));
        setSubmitError("");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmit || isSubmitting || items.length === 0) return;

        if (!executeRecaptcha) {
            setSubmitError(text.recaptchaLoading);
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const captchaToken = await executeRecaptcha("checkout_submit");

            const captchaResponse = await fetch("/api/verify-recaptcha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: captchaToken }),
            });

            const captchaResult = (await captchaResponse.json()) as {
                verified?: boolean;
                error?: string;
            };

            if (!captchaResponse.ok || captchaResult.verified !== true) {
                throw new Error(
                    captchaResult.error || text.recaptchaVerificationFailed,
                );
            }

            const customerToSave: StoredCustomer = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim().toLowerCase(),
                referralCode: form.referralCode.trim(),
                accepted: form.accepted,
                savedAt: Date.now(),
            };

            // Сохраняем только данные покупателя. Товары уже находятся в CartProvider.
            // Токен reCAPTCHA сохранять нельзя: он одноразовый и быстро истекает.
            sessionStorage.setItem(
                CUSTOMER_STORAGE_KEY,
                JSON.stringify(customerToSave),
            );

            router.push(REVIEW_PAGE_URL);
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : text.unableToContinue,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isHydrated) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>{text.loading}</div>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className={styles.page}>
                <a href="/" className={styles.back}>
                    {text.mainPage}
                </a>

                <div className={styles.state}>
                    <h1>{text.emptyCartTitle}</h1>
                    <p>{text.emptyCartDescription}</p>
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
                <a href="/" className={styles.back}>
                    {text.mainPage}
                </a>

                <form className={styles.customerCard} onSubmit={handleSubmit}>
                    <header className={styles.cardHeader}>
                        <h1>{text.title}</h1>
                        <p>{text.description}</p>
                    </header>

                    <div className={styles.sectionTitle}>
                        {text.orderSummaryLabel}
                    </div>

                    <div className={styles.formBody}>
                        <div className={styles.twoColumns}>
                            <label className={styles.field}>
                                <span>
                                    {text.firstName} <b>*</b>
                                </span>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={event =>
                                        updateField(
                                            "firstName",
                                            event.target.value,
                                        )
                                    }
                                    placeholder={text.firstNamePlaceholder}
                                    autoComplete="given-name"
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>
                                    {text.lastName} <b>*</b>
                                </span>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={event =>
                                        updateField(
                                            "lastName",
                                            event.target.value,
                                        )
                                    }
                                    placeholder={text.lastNamePlaceholder}
                                    autoComplete="family-name"
                                    required
                                />
                            </label>
                        </div>

                        <label className={styles.field}>
                            <span>
                                {text.email} <b>*</b>
                            </span>
                            <input
                                type="email"
                                value={form.email}
                                onChange={event =>
                                    updateField("email", event.target.value)
                                }
                                placeholder={text.emailPlaceholder}
                                autoComplete="email"
                                required
                            />
                        </label>

                        <label className={styles.field}>
                            <span>{text.referralCode}</span>

                            <input
                                type="text"
                                value={form.referralCode}
                                onChange={(event) =>
                                    updateField("referralCode", event.target.value)
                                }
                                disabled={isReferralLocked}
                                className={
                                    isReferralLocked
                                        ? styles.referralInputLocked
                                        : undefined
                                }
                            />

                            {isReferralLocked && (
                                <small className={styles.referralLockedHint}>
                                    {t.referralLocked}
                                </small>
                            )}
                        </label>

                        <label className={styles.agreement}>
                            <input
                                type="checkbox"
                                checked={form.accepted}
                                onChange={event =>
                                    updateField(
                                        "accepted",
                                        event.target.checked,
                                    )
                                }
                                required
                            />
                            <span>{text.agreement}</span>
                        </label>

                        <p className={styles.captchaNotice}>
                            {text.captchaNotice.beforeLinks}
                            <a
                                href="https://policies.google.com/privacy"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {text.captchaNotice.privacyPolicy}
                            </a>
                            {text.captchaNotice.betweenLinks}
                            <a
                                href="https://policies.google.com/terms"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {text.captchaNotice.termsOfService}
                            </a>
                            {text.captchaNotice.afterLinks}
                        </p>

                        {submitError && (
                            <p className={styles.submitError} role="alert">
                                {submitError}
                            </p>
                        )}
                    </div>

                    <footer className={styles.actions}>
                        <button
                            type="button"
                            className={styles.cancel}
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            {text.cancel}
                        </button>

                        <button
                            type="submit"
                            className={styles.buy}
                            disabled={!canSubmit || isSubmitting}
                        >
                            {isSubmitting ? text.checking : text.buy}
                        </button>
                    </footer>
                </form>

                <aside
                    className={styles.summaryCard}
                    aria-label={text.orderSummary}
                >
                    <header className={styles.summaryHeader}>
                        <h2>{text.order}</h2>
                        <p>
                            {itemCount} {itemLabel} · {formatter.format(total)}
                        </p>
                    </header>

                    <div className={styles.sectionTitle}>
                        {text.orderSummaryLabel}
                    </div>

                    <ul className={styles.items}>
                        {items.map(item => (
                            <li className={styles.item} key={item.id}>
                                <div className={styles.itemImage}>
                                    {item.imageSrc ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.imageSrc} alt="" />
                                    ) : (
                                        <span aria-hidden="true">◇</span>
                                    )}
                                </div>

                                <div className={styles.itemText}>
                                    <strong>{item.name}</strong>
                                    {item.quantity > 1 && (
                                        <span>
                                            {text.quantity}: {item.quantity}
                                        </span>
                                    )}
                                </div>

                                <span className={styles.itemPrice}>
                                    {formatter.format(
                                        item.unitPrice * item.quantity,
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <dl className={styles.totals}>
                        <div>
                            <dt>{text.subtotal}</dt>
                            <dd>{formatter.format(subtotal)}</dd>
                        </div>
                        <div>
                            <dt>{text.discount}</dt>
                            <dd>{formatter.format(discount)}</dd>
                        </div>
                        <div className={styles.total}>
                            <dt>{text.total}</dt>
                            <dd>{formatter.format(total)}</dd>
                        </div>
                    </dl>
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

export default function CheckoutPage() {
    const { t } = useLanguage();
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
        return (
            <main className={styles.page}>
                {t.checkoutCustomer.recaptchaSiteKeyMissing}
            </main>
        );
    }

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={siteKey}
            scriptProps={{ async: true, defer: true, appendTo: "head" }}
        >
            <CheckoutContent />
        </GoogleReCaptchaProvider>
    );
}