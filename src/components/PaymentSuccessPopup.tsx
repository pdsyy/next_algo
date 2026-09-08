"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/components/cartPopup/CartProvider";
import styles from "./PaymentSuccessPopup.module.css";

const SUCCESS_KEY = "algo_world_payment_success_v1";

type SuccessData = {
    orderCode: string;
    productNames: string[];
    imageSrc?: string;
    completedAt: number;
};

function readSuccess(): SuccessData | null {
    try {
        const raw = sessionStorage.getItem(SUCCESS_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw) as Partial<SuccessData>;
        if (!value.orderCode || !Array.isArray(value.productNames) || value.productNames.length === 0 || typeof value.completedAt !== "number") return null;
        return value as SuccessData;
    } catch {
        return null;
    }
}

export default function PaymentSuccessPopup() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { clearCart, closeCart } = useCart();
    const [data, setData] = useState<SuccessData | null>(null);

    useEffect(() => {
        if (pathname !== "/" || searchParams.get("payment") !== "success") return;
        setData(readSuccess());
    }, [pathname, searchParams]);

    const close = () => {
        clearCart();
        closeCart();
        sessionStorage.removeItem(SUCCESS_KEY);
        sessionStorage.removeItem("currentPayment");
        sessionStorage.removeItem("algo_world_pending_crypto_order_v1");
        sessionStorage.removeItem("checkoutReview");
        localStorage.removeItem("algo_world_checkout_v1");
        window.history.replaceState({}, "", "/");
        setData(null);
    };

    if (!data) return null;

    return (
        <div className={styles.overlay} role="presentation">
            <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="payment-success-title">
                {data.imageSrc ? <img className={styles.image} src={data.imageSrc} alt="" /> : <div className={styles.placeholder}>◇</div>}
                <h2 id="payment-success-title">Payment Successful!</h2>
                <p>
                    Your {data.productNames.join(", ")} {data.productNames.length === 1 ? "license is" : "licenses are"} being generated.
                    Check your email for activation instructions and setup guide.
                </p>
                <small>Order #{data.orderCode}</small>
                <div className={styles.actions}>
                    <button type="button" className={styles.done} onClick={close}>Done</button>
                    <a className={styles.help} href="mailto:support@algo-world.com">Need help?</a>
                </div>
            </section>
        </div>
    );
}