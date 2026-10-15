"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/components/cartPopup/CartProvider";
import styles from "./PaymentSuccessPopup.module.css";
import {useLanguage} from "@/context/LanguageProvider";

const SUCCESS_KEY = "algo_world_payment_success_v1";

type SuccessData = {
    orderCode: string;
    products: Array<{
        id: string;
        name: string;
        imageSrc?: string;
    }>;
    completedAt: number;
};

function readSuccess(): SuccessData | null {
    try {
        const raw = sessionStorage.getItem(SUCCESS_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw) as Partial<SuccessData>;
        if (
            !value.orderCode ||
            !Array.isArray(value.products) ||
            value.products.length === 0 ||
            typeof value.completedAt !== "number"
        ) return null;
        return value as SuccessData;
    } catch {
        return null;
    }
}

export default function PaymentSuccessPopup() {
    const {t, language} = useLanguage();
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

    const productNames = data.products.map(product => product.name);

    return (
        <div className={styles.overlay} role="presentation">
            <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="payment-success-title">
                <div
                    className={`${styles.products} ${
                        data.products.length === 1 ? styles.singleProduct : ""
                    }`}
                    aria-label="Purchased products"
                >
                    {data.products.map(product => (
                        <div className={styles.product} key={product.id}>
                            {product.imageSrc ? (
                                <img className={styles.image} src={product.imageSrc} alt={product.name} />
                            ) : (
                                <div className={styles.placeholder} aria-hidden="true">◇</div>
                            )}
                            {data.products.length > 1 && (
                                <strong className={styles.productName}>{product.name}</strong>
                            )}
                        </div>
                    ))}
                </div>
                <h2 id="payment-success-title">{t.paymentSuccessful}</h2>
                <p>
                    {productNames.join(", ")} {productNames.length === 1 ? t.oneLicenseGenerated : t.moreThanOneLicenseGenerated}
                    {t.successMessage}
                </p>
                {/*<small>Order #{data.orderCode}</small>*/}
                <div className={styles.actions}>
                    <button type="button" className={styles.done} onClick={close}>{t.done}</button>
                    <a className={styles.help} href="https://t.me/vladimirbabak_mql" target = "_blank">{t.needHelp}</a>
                </div>
            </section>
        </div>
    );
}