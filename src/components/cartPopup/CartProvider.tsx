"use client";

import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import type { CartItem } from "./CartPopup";
import {usePathname} from "next/navigation";

const CART_STORAGE_KEY = "algo_world_cart_v1";

export type AddToCartItem = Omit<CartItem, "quantity"> & {
    quantity?: number;
};

type CartContextValue = {
    items: CartItem[];
    isOpen: boolean;
    isHydrated: boolean;
    itemCount: number;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    addItem: (item: AddToCartItem) => void;
    setItems: (items: CartItem[]) => void;
    setQuantity: (id: string, quantity: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeItems(value: unknown): CartItem[] {
    if (!Array.isArray(value)) return [];

    const uniqueItems = new Map<string, CartItem>();

    for (const candidate of value) {
        if (!candidate || typeof candidate !== "object") continue;

        const item = candidate as Partial<CartItem>;
        if (
            typeof item.id !== "string" ||
            !item.id.trim() ||
            typeof item.name !== "string" ||
            !item.name.trim() ||
            typeof item.unitPrice !== "number" ||
            !Number.isFinite(item.unitPrice) ||
            item.unitPrice < 0
        ) {
            continue;
        }

        uniqueItems.set(item.id, {
            id: item.id,
            name: item.name,
            subtitle: typeof item.subtitle === "string" ? item.subtitle : undefined,
            imageSrc: typeof item.imageSrc === "string" ? item.imageSrc : undefined,
            unitPrice: item.unitPrice,
            quantity: 1,
        });
    }

    return [...uniqueItems.values()];
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItemsState] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const pathname = usePathname();
    useEffect(() => {
        if (
            pathname === "/checkout" ||
            pathname.startsWith("/checkout/") ||
            pathname === "/payment" ||
            pathname.startsWith("/payment/")
        ) {
            setIsOpen(false);
        }
    }, [pathname]);

    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(CART_STORAGE_KEY);
            if (saved) setItemsState(normalizeItems(JSON.parse(saved)));
        } catch {
            window.localStorage.removeItem(CART_STORAGE_KEY);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        try {
            if (items.length === 0) {
                window.localStorage.removeItem(CART_STORAGE_KEY);
            } else {
                window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            }
        } catch {
            // Cart remains available in memory if storage is unavailable.
        }
    }, [isHydrated, items]);

    const setItems = useCallback((nextItems: CartItem[]) => {
        setItemsState(normalizeItems(nextItems));
    }, []);

    const addItem = useCallback((newItem: AddToCartItem) => {
        const normalized = normalizeItems([{ ...newItem, quantity: 1 }])[0];
        if (!normalized) return;

        setItemsState(current => {
            const exists = current.some(item => item.id === normalized.id);
            if (!exists) return [...current, normalized];

            return current.map(item =>
                item.id === normalized.id ? { ...item, ...normalized, quantity: 1 } : item,
            );
        });
    }, []);

    // Kept for compatibility with existing components. Every product is always quantity 1.
    const setQuantity = useCallback((id: string, _quantity: number) => {
        setItemsState(current =>
            current.map(item => (item.id === id ? { ...item, quantity: 1 } : item)),
        );
    }, []);

    const removeItem = useCallback((id: string) => {
        setItemsState(current => current.filter(item => item.id !== id));
    }, []);

    const clearCart = useCallback(() => setItemsState([]), []);
    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);
    const toggleCart = useCallback(() => setIsOpen(current => !current), []);

    const itemCount = useMemo(() => items.length, [items]);

    const value = useMemo<CartContextValue>(() => ({
        items,
        isOpen,
        isHydrated,
        itemCount,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        setItems,
        setQuantity,
        removeItem,
        clearCart,
    }), [
        items,
        isOpen,
        isHydrated,
        itemCount,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        setItems,
        setQuantity,
        removeItem,
        clearCart,
    ]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used inside CartProvider");
    return context;
}
