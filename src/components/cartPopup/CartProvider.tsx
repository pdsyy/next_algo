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

import type {CartItem} from "./CartPopup";

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

    return value.flatMap((candidate): CartItem[] => {
        if (!candidate || typeof candidate !== "object") return [];

        const item = candidate as Partial<CartItem>;
        if (typeof item.id !== "string" || !item.id.trim() || typeof item.name !== "string" || !item.name.trim() || typeof item.unitPrice !== "number" || !Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
            return [];
        }

        return [{
            id: item.id,
            name: item.name,
            subtitle: typeof item.subtitle === "string" ? item.subtitle : undefined,
            imageSrc: typeof item.imageSrc === "string" ? item.imageSrc : undefined,
            unitPrice: item.unitPrice,
            quantity: Math.min(99, Math.max(1, Math.floor(item.quantity ?? 1))),
        }];
    });
}

export function CartProvider({children}: { children: ReactNode }) {
    const [items, setItemsState] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

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
        // Do not overwrite a saved cart with [] before it has been restored.
        if (!isHydrated) return;

        try {
            if (items.length === 0) {
                window.localStorage.removeItem(CART_STORAGE_KEY);
            } else {
                window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            }
        } catch {
            // The cart remains usable in memory when storage is blocked/full.
        }
    }, [isHydrated, items]);

    const setItems = useCallback((nextItems: CartItem[]) => {
        setItemsState(normalizeItems(nextItems));
    }, []);

    const addItem = useCallback((newItem: AddToCartItem) => {
        const normalized = normalizeItems([{...newItem, quantity: newItem.quantity ?? 1}])[0];
        if (!normalized) return;

        setItemsState(current => {
            const existing = current.find(item => item.id === normalized.id);
            if (!existing) return [...current, normalized];

            return current.map(item => item.id === normalized.id
                ? {
                    ...item,
                    ...normalized,
                    quantity: Math.min(99, item.quantity + normalized.quantity),
                }
                : item);
        });
    }, []);

    const setQuantity = useCallback((id: string, quantity: number) => {
        if (!Number.isFinite(quantity)) return;
        setItemsState(current => current.map(item => item.id === id
            ? {...item, quantity: Math.min(99, Math.max(1, Math.floor(quantity)))}
            : item));
    }, []);

    const removeItem = useCallback((id: string) => {
        setItemsState(current => current.filter(item => item.id !== id));
    }, []);

    const clearCart = useCallback(() => setItemsState([]), []);
    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);
    const toggleCart = useCallback(() => setIsOpen(current => !current), []);

    const itemCount = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items],
    );

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
