"use client";

import type { ReactNode } from "react";

import { type AddToCartItem, useCart } from "./CartProvider";

type AddToCartButtonProps = {
    product: AddToCartItem;
    children: ReactNode;
    className?: string;
    openAfterAdd?: boolean;
};

export default function AddToCartButton({product, children, className, openAfterAdd = true}: AddToCartButtonProps) {
    const { addItem, openCart } = useCart();

    const handleClick = () => {
        addItem(product);
        if (openAfterAdd) openCart();
    };

    return (
        <button type="button" className={className} onClick={handleClick}>
            {children}
        </button>
    );
}
