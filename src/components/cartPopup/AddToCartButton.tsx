"use client";

import type { ReactNode } from "react";
import {motion} from "framer-motion";
import { type AddToCartItem, useCart } from "./CartProvider";
import {HTMLMotionProps} from "framer-motion";

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

    const fastEase = [0.25, 0.1, 0.25, 1.0];


    const baseTransition: any = {duration: 0.7, ease: fastEase};
    const baseViewport = {once: true, amount: 0.1};

    const fadeUp: HTMLMotionProps<any> = {
        initial: {opacity: 0, y: 30, translateZ: 0},
        whileInView: {opacity: 1, y: 0, translateZ: 0},
        viewport: baseViewport,
        transition: baseTransition
    };


    return (
        <motion.button type="button" className={className} onClick={handleClick} {...fadeUp}>
            {children}
        </motion.button>
    );
}
