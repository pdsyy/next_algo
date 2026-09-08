"use client";

import {
    useCallback,
    useEffect,
    useRef,
} from "react";

import {
    usePathname,
    useRouter,
} from "next/navigation";

import CartPopup, {
    type CartCheckout,
} from "./CartPopup";

import {
    useCart,
} from "./CartProvider";

const CHECKOUT_URL = "/checkout";

export default function CartPopupRoot() {
    const router = useRouter();
    const pathname = usePathname();

    const {
        items,
        setItems,
        isOpen,
        closeCart,
    } = useCart();

    const navigationResolveRef =
        useRef<(() => void) | null>(null);

    const navigationTimeoutRef =
        useRef<number | null>(null);

    /*
     * Заранее загружаем страницу checkout.
     * Благодаря этому переход обычно будет значительно быстрее.
     */
    useEffect(() => {
        router.prefetch(CHECKOUT_URL);
    }, [router]);

    /*
     * Закрываем корзину только тогда, когда Next.js
     * действительно перешёл на страницу checkout.
     */
    useEffect(() => {
        if (!pathname.startsWith(CHECKOUT_URL)) return;

        closeCart();

        navigationResolveRef.current?.();
        navigationResolveRef.current = null;

        if (navigationTimeoutRef.current !== null) {
            window.clearTimeout(
                navigationTimeoutRef.current,
            );

            navigationTimeoutRef.current = null;
        }
    }, [pathname, closeCart]);

    useEffect(() => {
        return () => {
            if (navigationTimeoutRef.current !== null) {
                window.clearTimeout(
                    navigationTimeoutRef.current,
                );
            }

            navigationResolveRef.current?.();
        };
    }, []);

    const handleCheckout = useCallback(() => {
        return new Promise<void>((_resolve, reject) => {
            const timeout = window.setTimeout(() => {
                reject(new Error("Checkout navigation timed out",),);}, 15000);

            window.addEventListener(
                "beforeunload",
                () => {
                    window.clearTimeout(timeout);
                },
                {
                    once: true,
                },
            );

            window.location.assign("/checkout");
        });
    }, []);

    return (
        <CartPopup
            isOpen={isOpen}
            onClose={closeCart}
            items={items}
            onItemsChange={setItems}
            onCheckout={handleCheckout}
            language="EN"
            currency="USD"
        />
    );
}