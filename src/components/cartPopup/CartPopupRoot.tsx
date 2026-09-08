"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useLanguage } from "@/context/LanguageProvider";
import CartPopup, {
    type CartCheckout,
    type CartLanguage,
} from "./CartPopup";
import { useCart } from "./CartProvider";

const CHECKOUT_STORAGE_KEY = "algo_world_checkout_v1";

export default function CartPopupRoot() {
    const router = useRouter();
    const pathname = usePathname();
    const { language } = useLanguage()!;
    const { items, setItems, isOpen, closeCart } = useCart();

    useEffect(() => {
        closeCart();
    }, [pathname, closeCart]);

    const handleCheckout = (checkout: CartCheckout) => {
        window.localStorage.setItem(
            CHECKOUT_STORAGE_KEY,
            JSON.stringify({
                ...checkout,
                savedAt: Date.now(),
            }),
        );

        closeCart();
        router.push("/checkout");
    };

    return (
        <CartPopup
            isOpen={isOpen}
            onClose={closeCart}
            items={items}
            onItemsChange={setItems}
            onCheckout={handleCheckout}
            language={language as CartLanguage}
            currency="USD"
            discount={0}
        />
    );
}