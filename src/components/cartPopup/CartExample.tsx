"use client";

import { useState } from "react";
import CartPopup, { type CartCheckout, type CartItem, type CartLanguage } from "./CartPopup";

// Pass your existing checkout handler and language from the parent client component.
export default function CartExample({
                                        onCheckout,
                                        language = "EN",
                                    }: {
    onCheckout: (cart: CartCheckout) => void | Promise<void>;
    language?: CartLanguage;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<CartItem[]>([]);
    const label = {
        UA: { add: "Додати AERO EA", open: "Кошик", access: "Довічний доступ" },
        RU: { add: "Добавить AERO EA", open: "Корзина", access: "Пожизненный доступ" },
        EN: { add: "Add AERO EA", open: "Cart", access: "Lifetime access" },
    }[language];

    const addToCart = () => {
        setItems(current => {
            const existing = current.find(item => item.id === "aero-ea");
            if (existing) return current.map(item => item.id === "aero-ea"
                ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item);
            return [...current, {
                id: "aero-ea", name: "AERO EA", unitPrice: 1200, quantity: 1,
            }];
        });
        setIsOpen(true);
    };

    return (
        <>
            <button type="button" onClick={addToCart}>{label.add}</button>
            <button type="button" onClick={() => setIsOpen(true)}>
                {label.open} ({items.reduce((sum, item) => sum + item.quantity, 0)})
            </button>
            <CartPopup
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                items={items.map(item => ({ ...item, subtitle: label.access }))}
                onItemsChange={setItems}
                onCheckout={onCheckout}
                language={language}
                currency="USD"
                discount={0}
            />
        </>
    );
}
