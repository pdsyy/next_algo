"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import editIcon from "./images/edit-line.svg"
import cloudIcon from "./images/cloude.svg";
import closeIcon from "./images/close_cross.svg";
import deleteIcon from "./images/delete_icon.svg";
import tether_icon from "./images/tether.svg"
import { useCart } from "@/components/cartPopup/CartProvider";
import Mql5PaymentFlow from "./Mql5PaymentFlow";
import topLines from "@/app/images/video_block_top_lines.svg";
import bottomLines from "@/app/images/bottom_lines_video_block.svg";
import styles from "./review.module.css";
import "../checkout.css"

const CUSTOMER_STORAGE_KEY = "checkoutCustomer";
const REVIEW_STORAGE_KEY = "checkoutReview";
const NEXT_STEP_URL = "/checkout/payment";

type PaymentMethod = "crypto" | "card";

type StoredCustomer = {
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
    accepted: boolean;
    savedAt: number;
};

type StoredReview = {
    paymentMethod: PaymentMethod;
    savedAt: number;
};

function isStoredCustomer(value: unknown): value is StoredCustomer {
    if (!value || typeof value !== "object") return false;

    const customer = value as Partial<StoredCustomer>;

    return (
        typeof customer.firstName === "string" &&
        typeof customer.lastName === "string" &&
        typeof customer.email === "string" &&
        typeof customer.referralCode === "string" &&
        customer.accepted === true &&
        typeof customer.savedAt === "number"
    );
}

function isStoredReview(value: unknown): value is StoredReview {
    if (!value || typeof value !== "object") return false;

    const review = value as Partial<StoredReview>;

    return (
        (review.paymentMethod === "crypto" || review.paymentMethod === "card") &&
        typeof review.savedAt === "number"
    );
}


export default function ReviewPage() {
    const router = useRouter();
    const { items, isHydrated } = useCart();

    const [customer, setCustomer] = useState<StoredCustomer | null>(null);
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("crypto");
    const [isStorageLoaded, setIsStorageLoaded] = useState(false);
    const [isMql5Open, setIsMql5Open] = useState(false);

    useEffect(() => {
        try {
            const storedCustomer = sessionStorage.getItem(CUSTOMER_STORAGE_KEY);
            const storedReview = sessionStorage.getItem(REVIEW_STORAGE_KEY);

            if (storedCustomer) {
                const parsedCustomer: unknown = JSON.parse(storedCustomer);
                if (isStoredCustomer(parsedCustomer)) {
                    setCustomer(parsedCustomer);
                }
            }

            if (storedReview) {
                const parsedReview: unknown = JSON.parse(storedReview);
                if (isStoredReview(parsedReview)) {
                    setPaymentMethod(parsedReview.paymentMethod);
                }
            }
        } catch (error) {
            console.error("REVIEW STORAGE ERROR:", error);
        } finally {
            setIsStorageLoaded(true);
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

    const editCustomer = () => {
        router.push("/checkout");
    };

    const handleConfirm = () => {
        if (!customer || items.length === 0) return;

        const reviewToSave: StoredReview = {
            paymentMethod,
            savedAt: Date.now(),
        };

        // На следующей странице способ оплаты берётся из этого объекта.
        // Товары по-прежнему берутся из CartProvider, а цены проверяются сервером.
        sessionStorage.setItem(
            REVIEW_STORAGE_KEY,
            JSON.stringify(reviewToSave),
        );

        if (paymentMethod === "card") {
            setIsMql5Open(true);
            return;
        }

        router.push(NEXT_STEP_URL);
    };

    if (!isHydrated || !isStorageLoaded) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>Loading...</div>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>
                    <h1>Your cart is empty</h1>
                    <p>Add a trading bot before placing an order.</p>
                    <a href="/" className={styles.back}>
                        Main page
                    </a>
                </div>
            </main>
        );
    }

    if (!customer) {
        return (
            <main className={styles.page}>
                <div className={styles.state}>
                    <h1>Customer details not found</h1>
                    <p>Please complete the checkout form first.</p>
                    <button type="button" onClick={() => router.push("/checkout")}>
                        Go to checkout
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.topLines} aria-hidden="true">
                <img src={topLines.src} alt="" />
            </div>

            <div className={styles.shell}>
                <a href="/" className={styles.back}>
                    Main page
                </a>

                <section className={styles.reviewCard}>
                    <header className={styles.cardHeader}>
                        <h1>Review order</h1>
                        <p>Confirm your details and selected license options.</p>
                    </header>

                    <div className={styles.sectionTitle}>ORDER SUMMARY</div>

                    <div className={styles.customerData}>
                        <div className={styles.twoColumns}>
                            <div className={styles.dataField}>
                                <span>
                                    First name <b>*</b>
                                </span>
                                <button type="button" onClick={editCustomer}>
                                    <strong>{customer.firstName}</strong>
                                    <img src = {editIcon.src}  alt = "" className = {styles.editIcon}/>
                                </button>
                            </div>

                            <div className={styles.dataField}>
                                <span>
                                    Last name <b>*</b>
                                </span>
                                <button type="button" onClick={editCustomer}>
                                    <strong>{customer.lastName}</strong>
                                    <img src = {editIcon.src}  alt = "" className = {styles.editIcon}/>
                                </button>
                            </div>
                        </div>

                        <div className={styles.dataField}>
                            <span>
                                Email <b>*</b>
                            </span>
                            <button type="button" onClick={editCustomer}>
                                <strong>{customer.email}</strong>
                                <img src = {editIcon.src}  alt = "" className = {styles.editIcon}/>
                            </button>
                        </div>

                        <div className={styles.dataField}>
                            <span>Referral / discount code</span>
                            <button type="button" onClick={editCustomer}>
                                <strong>{customer.referralCode || "—"}</strong>
                                <img src = {editIcon.src}  alt = "" className = {styles.editIcon}/>
                            </button>
                        </div>
                    </div>

                    <div className={styles.sectionTitle}>PAYMENT METHOD</div>

                    <fieldset className={styles.paymentMethods}>
                        <legend className={styles.visuallyHidden}>
                            Choose payment method
                        </legend>

                        <label
                            className={`${styles.paymentOption} ${
                                paymentMethod === "crypto"
                                    ? styles.paymentOptionActive
                                    : ""
                            }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="crypto"
                                checked={paymentMethod === "crypto"}
                                onChange={() => setPaymentMethod("crypto")}
                            />
                            <img className={styles.cryptoIcon} src = {tether_icon.src} alt = ""/>
                            <strong>Crypto</strong>
                            <span className={styles.radioMark} aria-hidden="true" />
                        </label>

                        <label
                            className={`${styles.disabled_payment_method} ${styles.paymentOption} ${
                                paymentMethod === "card"
                                    ? styles.paymentOptionActive
                                    : ""
                            }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="card"
                                checked={paymentMethod === "card"}
                                onChange={() => setPaymentMethod("card")}
                                disabled={true}
                            />
                            <span className={styles.cardBrands} aria-hidden="true">
                                <span className={styles.visa}>VISA</span>
                                <span className={styles.mastercard} />
                            </span>
                            <strong>Visa/Mastercard</strong>
                            <span className={styles.radioMark} aria-hidden="true" />
                        </label>
                    </fieldset>

                    <footer className={styles.actions}>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => router.push("/checkout")}
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            className={styles.confirmButton}
                            onClick={handleConfirm}
                        >
                            Confirm and pay
                        </button>
                    </footer>
                </section>

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
                                    {item.subtitle && <span>{item.subtitle}</span>}
                                    {item.quantity > 1 && (
                                        <span>Quantity: {item.quantity}</span>
                                    )}
                                </div>

                                <span className={styles.itemPrice}>
                                    {formatter.format(item.unitPrice * item.quantity)}
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

            <div className={styles.bottomLines} aria-hidden="true">
                <img src={bottomLines.src} alt="" />
            </div>

            <Mql5PaymentFlow
                isOpen={isMql5Open}
                onClose={() => setIsMql5Open(false)}
                customer={customer}
                items={items.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                }))}
                icons={{
                    cloud: cloudIcon.src,
                    close: closeIcon.src,
                    delete: deleteIcon.src,
                }}
            />
        </main>
    );
}