"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    GoogleReCaptchaProvider,
    useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

import { useCart } from "@/components/cartPopup/CartProvider";
import top_lines from "@/app/images/video_block_top_lines.svg";
import bottom_lines from "@/app/images/bottom_lines_video_block.svg";
import styles from "./checkout.module.css";
import "./checkout.css";

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
    const router = useRouter();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const { items, isHydrated } = useCart();

    const [form, setForm] = useState<CustomerForm>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(CUSTOMER_STORAGE_KEY);
            if (!stored) return;

            const customer: unknown = JSON.parse(stored);
            if (!isStoredCustomer(customer)) return;

            setForm({
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                referralCode: customer.referralCode,
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

    const formatter = useMemo(
        () =>
            new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 2,
            }),
        [],
    );

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
            setSubmitError("reCAPTCHA is still loading. Please try again.");
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
                    captchaResult.error || "reCAPTCHA verification failed.",
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
                    : "Unable to continue. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isHydrated) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>Loading...</div>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className={styles.page}>
                <a href="/" className={styles.back}>
                    Main page
                </a>

                <div className={styles.state}>
                    <h1>Your cart is empty</h1>
                    <p>Add a trading bot before placing an order.</p>
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
                    Main page
                </a>

                <form className={styles.customerCard} onSubmit={handleSubmit}>
                    <header className={styles.cardHeader}>
                        <h1>Customer details</h1>
                        <p>
                            Your program and license keys will be issued to this
                            email.
                        </p>
                    </header>

                    <div className={styles.sectionTitle}>ORDER SUMMARY</div>

                    <div className={styles.formBody}>
                        <div className={styles.twoColumns}>
                            <label className={styles.field}>
                                <span>
                                    First name <b>*</b>
                                </span>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={event =>
                                        updateField("firstName", event.target.value)
                                    }
                                    placeholder="First name"
                                    autoComplete="given-name"
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>
                                    Last name <b>*</b>
                                </span>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={event =>
                                        updateField("lastName", event.target.value)
                                    }
                                    placeholder="Last name"
                                    autoComplete="family-name"
                                    required
                                />
                            </label>
                        </div>

                        <label className={styles.field}>
                            <span>
                                Email <b>*</b>
                            </span>
                            <input
                                type="email"
                                value={form.email}
                                onChange={event =>
                                    updateField("email", event.target.value)
                                }
                                placeholder="hello@mail.com"
                                autoComplete="email"
                                required
                            />
                        </label>

                        <label className={styles.field}>
                            <span>Referral / discount code</span>
                            <input
                                type="text"
                                value={form.referralCode}
                                onChange={event =>
                                    updateField("referralCode", event.target.value)
                                }
                                placeholder="Code"
                                autoComplete="off"
                            />
                        </label>

                        <label className={styles.agreement}>
                            <input
                                type="checkbox"
                                checked={form.accepted}
                                onChange={event =>
                                    updateField("accepted", event.target.checked)
                                }
                                required
                            />
                            <span>
                                I agree to Trade&apos;s terms and conditions,
                                privacy policy, and risk disclosure, and understand
                                that my purchase is from Mitalio OÜ and payment is
                                securely processed by credit or debit card.
                            </span>
                        </label>

                        <p className={styles.captchaNotice}>
                            This site is protected by reCAPTCHA and the Google{" "}
                            <a
                                href="https://policies.google.com/privacy"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Privacy Policy
                            </a>{" "}
                            and{" "}
                            <a
                                href="https://policies.google.com/terms"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Terms of Service
                            </a>{" "}
                            apply.
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
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={styles.buy}
                            disabled={!canSubmit || isSubmitting}
                        >
                            {isSubmitting ? "Checking..." : "Buy"}
                        </button>
                    </footer>
                </form>

                <aside className={styles.summaryCard} aria-label="Order summary">
                    <header className={styles.summaryHeader}>
                        <h2>Order</h2>
                        <p>
                            {items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                            items · {formatter.format(total)}
                        </p>
                    </header>

                    <div className={styles.sectionTitle}>ORDER SUMMARY</div>

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
                                        <span>Quantity: {item.quantity}</span>
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
                            <dt>Subtotal</dt>
                            <dd>{formatter.format(subtotal)}</dd>
                        </div>
                        <div>
                            <dt>Discount</dt>
                            <dd>{formatter.format(discount)}</dd>
                        </div>
                        <div className={styles.total}>
                            <dt>Total</dt>
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
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
        return (
            <main className={styles.page}>
                reCAPTCHA site key is missing.
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