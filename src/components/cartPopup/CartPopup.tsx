"use client"

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./CartPopup.module.css";

export type CartLanguage = "UA" | "RU" | "EN";

export type CartItem = {
    id: string;
    name: string;
    subtitle?: string;
    imageSrc?: string;
    unitPrice: number;
    quantity: number;
};

export type CartCheckout = {
    items: CartItem[];
    currency: string;
    subtotal: number;
    discount: number;
    total: number;
};

export type CartPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onItemsChange: (items: CartItem[]) => void;
    onCheckout: (cart: CartCheckout) => void | Promise<void>;
    language?: CartLanguage;
    currency?: string;
    discount?: number;
    orderNumber?: string;
    orderDate?: string;
};

const copy = {
    UA: {
        title: "Кошик", order: "Замовлення", summary: "ВАШЕ ЗАМОВЛЕННЯ",
        subtotal: "Сума", discount: "Знижка", total: "Разом", close: "Закрити",
        buy: "Купити", processing: "Зачекайте…", empty: "Ваш кошик порожній",
        emptyText: "Додайте торгового бота, щоб оформити замовлення.",
        less: "Зменшити кількість", more: "Збільшити кількість", remove: "Видалити",
        quantity: "Кількість", error: "Не вдалося перейти до оплати. Спробуйте ще раз.",
    },
    RU: {
        title: "Корзина", order: "Заказ", summary: "ВАШ ЗАКАЗ",
        subtotal: "Сумма", discount: "Скидка", total: "Итого", close: "Закрыть",
        buy: "Купить", processing: "Подождите…", empty: "Ваша корзина пуста",
        emptyText: "Добавьте торгового бота, чтобы оформить заказ.",
        less: "Уменьшить количество", more: "Увеличить количество", remove: "Удалить",
        quantity: "Количество", error: "Не удалось перейти к оплате. Попробуйте ещё раз.",
    },
    EN: {
        title: "Cart", order: "Order", summary: "ORDER SUMMARY",
        subtotal: "Subtotal", discount: "Discount", total: "Total", close: "Close",
        buy: "Buy", processing: "Please wait…", empty: "Your cart is empty",
        emptyText: "Add a trading bot to place your order.",
        less: "Decrease quantity", more: "Increase quantity", remove: "Remove",
        quantity: "Quantity", error: "Could not proceed to checkout. Please try again.",
    },
};

const locales = { UA: "uk-UA", RU: "ru-RU", EN: "en-US" };
const htmlLanguages = { UA: "uk", RU: "ru", EN: "en" };

function ProductIcon() {
    return (
        <svg viewBox="0 0 52 58" fill="none" aria-hidden="true">
            <path d="M26 2 49 15v28L26 56 3 43V15L26 2Z" fill="#d2d5d5" stroke="#a9aeae" strokeWidth="2" />
            <path d="m26 7 18 11v22L26 51 8 40V18L26 7Z" fill="#e3e5e5" stroke="#b1b6b6" />
            <path d="M16 22h17m-17 7h21m-21 7h17" stroke="#8b9191" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="29" cy="22" r="2.5" fill="#e3e5e5" stroke="#8b9191" />
            <circle cx="22" cy="29" r="2.5" fill="#e3e5e5" stroke="#8b9191" />
            <circle cx="30" cy="36" r="2.5" fill="#e3e5e5" stroke="#8b9191" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5m4-5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CartDialog({
                        onClose, items, onItemsChange, onCheckout, isClosing,
                        language = "EN", currency = "USD", discount = 0, orderNumber, orderDate,
                    }: Omit<CartPopupProps, "isOpen"> & { isClosing: boolean }) {
    const text = copy[language];
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef(onClose);
    const busyRef = useRef(false);
    const aliveRef = useRef(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(false);
    closeRef.current = onClose;

    const formatter = new Intl.NumberFormat(locales[language], {
        style: "currency", currency,
    });
    const fractionDigits = new Intl.NumberFormat("en-US", {
        style: "currency", currency,
    }).resolvedOptions().maximumFractionDigits ?? 2;
    const scale = 10 ** fractionDigits;
    const money = (minor: number) => formatter.format(minor / scale);
    const subtotalMinor = items.reduce((sum, item) =>
        sum + Math.round(item.unitPrice * scale) * item.quantity, 0);
    const discountMinor = Math.min(subtotalMinor, Math.max(0,
        Number.isFinite(discount) ? Math.round(discount * scale) : 0));
    const totalMinor = subtotalMinor - discountMinor;
    const date = orderDate ? new Date(orderDate) : null;
    const formattedDate = date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat(locales[language], {
            year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
        }).format(date)
        : null;

    useEffect(() => {
        aliveRef.current = true;
        const previousFocus = document.activeElement instanceof HTMLElement
            ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        const previousPadding = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
        }
        document.body.style.overflow = "hidden";
        panelRef.current?.focus();

        const focusable = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? []).filter(element => element.getClientRects().length > 0);

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeRef.current();
            }
            if (event.key !== "Tab") return;
            const nodes = focusable();
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            if (!first) {
                event.preventDefault();
                panelRef.current?.focus();
            } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panelRef.current)) {
                event.preventDefault();
                first.focus();
            }
        };
        const handleFocus = (event: FocusEvent) => {
            if (event.target instanceof Node && !panelRef.current?.contains(event.target)) {
                panelRef.current?.focus();
            }
        };
        document.addEventListener("keydown", handleKey);
        document.addEventListener("focusin", handleFocus);
        return () => {
            aliveRef.current = false;
            document.removeEventListener("keydown", handleKey);
            document.removeEventListener("focusin", handleFocus);
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPadding;
            if (previousFocus?.isConnected) previousFocus.focus();
        };
    }, []);

    const changeQuantity = (id: string, delta: number) => {
        if (busyRef.current) return;
        setError(false);
        onItemsChange(items.map(item => item.id === id
            ? { ...item, quantity: Math.min(99, Math.max(1, item.quantity + delta)) }
            : item));
    };
    const remove = (id: string) => {
        if (busyRef.current) return;
        setError(false);
        panelRef.current?.focus();
        onItemsChange(items.filter(item => item.id !== id));
    };
    const checkout = async () => {
        if (busyRef.current || items.length === 0) return;

        busyRef.current = true;
        setBusy(true);
        setError(false);

        try {
            await onCheckout({
                items: items.map(item => ({ ...item })),
                currency,
                subtotal: subtotalMinor / scale,
                discount: discountMinor / scale,
                total: totalMinor / scale,
            });

            // Закрываем корзину после сохранения заказа
            onClose();
        } catch (error) {
            console.error("CHECKOUT ERROR:", error);

            if (aliveRef.current) {
                setError(true);
            }
        } finally {
            busyRef.current = false;

            if (aliveRef.current) {
                setBusy(false);
            }
        }
    };

    return createPortal(
        <div
            className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ""}`}
            onClick={event => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                ref={panelRef}
                className={`${styles.panel} ${isClosing ? styles.panelClosing : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId} tabIndex={-1} lang={htmlLanguages[language]}>
                <header className={styles.header}>
                    <h2 id={titleId} className={styles.title}>
                        {orderNumber ? `${text.order} #${orderNumber}` : text.title}
                    </h2>
                    <p className={styles.meta}>
                        {formattedDate && <>{formattedDate}<span aria-hidden="true"> · </span></>}
                        {money(totalMinor)}
                    </p>
                </header>
                <div className={styles.sectionLabel}>{text.summary}</div>
                <div className={styles.content}>
                    {items.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}><ProductIcon /></div>
                            <h3>{text.empty}</h3>
                            <p>{text.emptyText}</p>
                        </div>
                    ) : (
                        <>
                            <ul className={styles.items}>
                                {items.map(item => (
                                    <li key={item.id} className={styles.item}>
                                        <div className={styles.productImage}>
                                            {item.imageSrc
                                                // Plain img accepts your local paths and remote product images without next/image configuration.
                                                // eslint-disable-next-line @next/next/no-img-element
                                                ? <img src={item.imageSrc} alt="" width={48} height={54} />
                                                : <ProductIcon />}
                                        </div>
                                        <div className={styles.productInfo}>
                                            <h3 className={styles.productName}>{item.name}</h3>
                                            {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
                                        </div>
                                        <div className={styles.controls}>
                                            <div className={styles.quantity} role="group" aria-label={`${text.quantity}: ${item.name}`}>
                                                <button type="button" onClick={() => changeQuantity(item.id, -1)}
                                                        disabled={busy || item.quantity <= 1} aria-label={`${text.less}: ${item.name}`}>−</button>
                                                <span aria-live="polite" aria-atomic="true">{item.quantity}</span>
                                                <button type="button" onClick={() => changeQuantity(item.id, 1)}
                                                        disabled={busy || item.quantity >= 99} aria-label={`${text.more}: ${item.name}`}>+</button>
                                            </div>
                                            <button type="button" className={styles.remove} onClick={() => remove(item.id)}
                                                    disabled={busy} aria-label={`${text.remove}: ${item.name}`}><TrashIcon /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <dl className={styles.totals} aria-live="polite" aria-atomic="true">
                                <div className={styles.totalRow}><dt>{text.subtotal}</dt><dd>{money(subtotalMinor)}</dd></div>
                                <div className={styles.totalRow}><dt>{text.discount}</dt><dd>{discountMinor > 0 ? `−${money(discountMinor)}` : money(0)}</dd></div>
                                <div className={`${styles.totalRow} ${styles.grandTotal}`}><dt>{text.total}</dt><dd>{money(totalMinor)}</dd></div>
                            </dl>
                        </>
                    )}
                </div>
                <footer className={styles.footer}>
                    {error && <p className={styles.error} role="alert">{text.error}</p>}
                    <div className={styles.actions}>
                        <button type="button" className={styles.close} onClick={onClose}>{text.close}</button>
                        <button type="button" className={styles.buy} onClick={checkout}
                                disabled={busy || items.length === 0} aria-busy={busy}>
                            {busy ? text.processing : text.buy}
                        </button>
                    </div>
                </footer>
            </div>
        </div>,
        document.body,
    );
}

export default function CartPopup(props: CartPopupProps) {
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!mounted) return;

        if (props.isOpen) {
            setShouldRender(true);
            setIsClosing(false);
            return;
        }

        if (!shouldRender) return;

        setIsClosing(true);

        const closeTimer = window.setTimeout(() => {
            setShouldRender(false);
            setIsClosing(false);
        }, 240);

        return () => window.clearTimeout(closeTimer);
    }, [mounted, props.isOpen, shouldRender]);

    if (!mounted || !shouldRender) return null;

    return <CartDialog {...props} isClosing={isClosing} />;
}
