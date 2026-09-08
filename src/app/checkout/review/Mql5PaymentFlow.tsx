"use client";

import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";
import styles from "./Mql5PaymentFlow.module.css";

const STORAGE_KEY = "pendingMql5Order";

type Customer = {
    firstName: string;
    lastName: string;
    email: string;
    referralCode?: string;
};

type CartItem = {
    id: string;
    quantity: number;
};

type PendingOrder = {
    order: {
        orderNumber: string;
        total: number;
        currency: string;
    };
    orderToken: string;
    paymentUrl: string;
    phase: "redirect" | "confirmation";
};

type Props = {
    isOpen: boolean;
    customer: Customer;
    items: CartItem[];
    onClose: () => void;
    icons?: {
        cloud?: string;
        close?: string;
        delete?: string;
    };
};

type UploadStatus = "idle" | "ready" | "uploading" | "completed" | "failed";

export default function Mql5PaymentFlow({
                                            isOpen,
                                            customer,
                                            items,
                                            onClose,
                                            icons,
                                        }: Props) {
    const { t } = useLanguage();
    const text = t.mql5PaymentFlow;
    const [pending, setPending] = useState<PendingOrder | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const hasAttemptedCreation = useRef(false);

    useEffect(() => {
        if (!isOpen) return;

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setPending(JSON.parse(stored));
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            hasAttemptedCreation.current = false;
            return;
        }

        if (pending || hasAttemptedCreation.current) return;
        hasAttemptedCreation.current = true;

        const createOrder = async () => {
            setIsLoading(true);
            setError("");

            try {
                const response = await fetch("/api/orders/mql5/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ customer, items }),
                });
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || text.errors.createOrder);
                }

                const next: PendingOrder = {
                    order: data.order,
                    orderToken: data.orderToken,
                    paymentUrl: data.paymentUrl,
                    phase: "redirect",
                };
                setPending(next);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch (caught) {
                setError(caught instanceof Error ? caught.message : text.errors.createOrder);
            } finally {
                setIsLoading(false);
            }
        };

        void createOrder();
    }, [customer, isOpen, items, pending, text.errors.createOrder]);

    useEffect(() => {
        if (!isOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = previous; };
    }, [isOpen]);

    if (!isOpen) return null;

    const savePending = (next: PendingOrder) => {
        setPending(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const openMql5 = () => {
        if (!pending) return;
        savePending({ ...pending, phase: "confirmation" });
        window.open(pending.paymentUrl, "_blank", "noopener,noreferrer");
    };

    const copyOrderNumber = async () => {
        if (!pending) return;
        await navigator.clipboard.writeText(pending.order.orderNumber);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    const openHelp = () => {
        window.open("https://t.me/alg0_o", "_blank", "noopener,noreferrer");
    };

    const selectFile = (candidate?: File) => {
        if (!candidate) return;
        if (!["image/jpeg", "image/png", "application/pdf"].includes(candidate.type)) {
            setError(text.errors.fileType);
            return;
        }
        if (candidate.size > 10 * 1024 * 1024) {
            setError(text.errors.fileSize);
            return;
        }
        setFile(candidate);
        setUploadStatus("ready");
        setUploadProgress(0);
        setError("");
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        selectFile(event.target.files?.[0]);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        selectFile(event.dataTransfer.files?.[0]);
    };

    const removeSelectedFile = () => {
        if (uploadStatus === "uploading") return;
        setFile(null);
        setUploadStatus("idle");
        setUploadProgress(0);
        setError("");
    };

    const submitConfirmation = () => {
        if (
            !pending ||
            !file ||
            uploadStatus === "uploading" ||
            uploadStatus === "completed"
        ) return;

        setUploadStatus("uploading");
        setUploadProgress(0);
        setError("");

        const body = new FormData();
        body.append("orderToken", pending.orderToken);
        body.append("confirmation", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/orders/mql5/confirm");

        xhr.upload.onprogress = event => {
            if (!event.lengthComputable) return;
            setUploadProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
        };

        xhr.onload = () => {
            let data: { success?: boolean; error?: string } = {};
            try { data = JSON.parse(xhr.responseText); } catch { /* empty response */ }

            if (xhr.status >= 200 && xhr.status < 300 && data.success) {
                setUploadProgress(100);
                setUploadStatus("completed");
                localStorage.removeItem(STORAGE_KEY);
                return;
            }

            setUploadStatus("failed");
            setError(data.error || text.errors.sendConfirmation);
        };

        xhr.onerror = () => {
            setUploadStatus("failed");
            setError(text.errors.network);
        };

        xhr.send(body);
    };

    const formatFileSize = (size: number) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className={styles.overlay} role="presentation">
            <section className={styles.modal} role="dialog" aria-modal="true">
                {isLoading && <div className={styles.loading}>{text.creatingOrder}</div>}

                {!isLoading && error && !pending && (
                    <>
                        <h2>{text.createOrderErrorTitle}</h2>
                        <p className={styles.error}>{error}</p>
                        <button className={styles.secondaryButton} onClick={onClose}>{text.close}</button>
                    </>
                )}

                {pending && pending.phase === "redirect" && (
                    <>
                        <h2>{text.redirect.title}</h2>
                        <p>{text.redirect.description}</p>
                        <div className={styles.orderLabel}>{text.redirect.orderNumber}</div>
                        <button className={styles.orderNumber} onClick={copyOrderNumber}>
                            <strong>{pending.order.orderNumber}</strong>
                            <span>{copied ? text.redirect.copied : text.redirect.copy}</span>
                        </button>
                        <div className={styles.amount}>
                            {text.redirect.total}: <strong>{pending.order.currency} {pending.order.total.toFixed(2)}</strong>
                        </div>
                        <button className={styles.primaryButton} onClick={openMql5}>
                            {text.redirect.proceed}
                        </button>
                        <button className={styles.secondaryButton} onClick={onClose}>
                            {text.redirect.cancel}
                        </button>
                    </>
                )}

                {pending && pending.phase === "confirmation" && (
                    <>
                        <h2>{text.confirmation.title}</h2>
                        <p>{text.confirmation.description}</p>
                        <div className={styles.orderChip}>{text.confirmation.order} {pending.order.orderNumber}</div>
                        <label
                            className={styles.dropzone}
                            onDragOver={event => event.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
                            <span className={styles.cloudIcon} aria-hidden="true">
                                {icons?.cloud ? <img src={icons.cloud} alt="" /> : "↥"}
                            </span>
                            <strong>{text.confirmation.chooseFile}</strong>
                            <span>{text.confirmation.fileFormats}</span>
                            <span className={styles.browseButton}>{text.confirmation.browseFile}</span>
                        </label>
                        {file && (
                            <div className={`${styles.fileCard} ${uploadStatus === "failed" ? styles.fileCardFailed : ""}`}>
                                <div className={styles.fileIcon} aria-hidden="true">ALGO</div>
                                <div className={styles.fileInfo}>
                                    <strong>{file.name}</strong>
                                    <div className={styles.fileMeta}>
                                        <span>{formatFileSize(file.size)}</span>
                                        <span>•</span>
                                        {uploadStatus === "ready" && <span>{text.status.ready}</span>}
                                        {uploadStatus === "uploading" && <span className={styles.uploadingStatus}>{text.status.uploading} {uploadProgress}%</span>}
                                        {uploadStatus === "completed" && <span className={styles.completedStatus}>● {text.status.completed}</span>}
                                        {uploadStatus === "failed" && <span className={styles.failedStatus}>● {text.status.failed}</span>}
                                    </div>
                                    {uploadStatus === "failed" && (
                                        <button className={styles.tryAgain} type="button" onClick={submitConfirmation}>{text.tryAgain}</button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className={styles.fileAction}
                                    onClick={removeSelectedFile}
                                    disabled={uploadStatus === "uploading"}
                                    aria-label={text.removeFile}
                                >
                                    {uploadStatus === "uploading"
                                        ? (icons?.close ? <img src={icons.close} alt="" /> : "×")
                                        : (icons?.delete ? <img src={icons.delete} alt="" /> : "⌫")}
                                </button>
                                {uploadStatus === "uploading" && (
                                    <div className={styles.progressTrack}>
                                        <span style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                )}
                            </div>
                        )}
                        {error && <p className={styles.error} role="alert">{error}</p>}
                        <button
                            className={styles.primaryButton}
                            disabled={!file || uploadStatus === "uploading" || uploadStatus === "completed"}
                            onClick={submitConfirmation}
                        >
                            {uploadStatus === "uploading"
                                ? `${text.status.uploading} ${uploadProgress}%`
                                : uploadStatus === "completed"
                                    ? text.sent
                                    : text.send}
                        </button>
                        <button className={styles.secondaryButton} onClick={openHelp}>
                            {text.needHelp}
                        </button>
                    </>
                )}

            </section>
        </div>
    );
}