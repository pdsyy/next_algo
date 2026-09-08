"use client";

import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
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
                    throw new Error(data.error || "Could not create order");
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
                setError(caught instanceof Error ? caught.message : "Could not create order");
            } finally {
                setIsLoading(false);
            }
        };

        void createOrder();
    }, [customer, isOpen, items, pending]);

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
            setError("Use JPG, PNG or PDF");
            return;
        }
        if (candidate.size > 10 * 1024 * 1024) {
            setError("The file must be no larger than 10 MB");
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
            setError(data.error || "Could not send confirmation");
        };

        xhr.onerror = () => {
            setUploadStatus("failed");
            setError("Network error. Please try again.");
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
                {isLoading && <div className={styles.loading}>Creating order...</div>}

                {!isLoading && error && !pending && (
                    <>
                        <h2>Could not create order</h2>
                        <p className={styles.error}>{error}</p>
                        <button className={styles.secondaryButton} onClick={onClose}>Close</button>
                    </>
                )}

                {pending && pending.phase === "redirect" && (
                    <>
                        <h2>Continue to MQL5</h2>
                        <p>
                            Your payment will be processed securely on MQL5. Keep this
                            page open and return after completing the purchase.
                        </p>
                        <div className={styles.orderLabel}>ORDER NUMBER</div>
                        <button className={styles.orderNumber} onClick={copyOrderNumber}>
                            <strong>{pending.order.orderNumber}</strong>
                            <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                        <div className={styles.amount}>
                            Total: <strong>{pending.order.currency} {pending.order.total.toFixed(2)}</strong>
                        </div>
                        <button className={styles.primaryButton} onClick={openMql5}>
                            Proceed to MQL5
                        </button>
                        <button className={styles.secondaryButton} onClick={onClose}>
                            Cancel order and edit cart
                        </button>
                    </>
                )}

                {pending && pending.phase === "confirmation" && (
                    <>
                        <h2>Confirm your payment</h2>
                        <p>
                            Since you paid through MQL5, please upload a screenshot of
                            your purchase confirmation so we can verify your purchase and
                            send all the instructions to the email address you provided.
                        </p>
                        <div className={styles.orderChip}>Order {pending.order.orderNumber}</div>
                        <label
                            className={styles.dropzone}
                            onDragOver={event => event.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
                            <span className={styles.cloudIcon} aria-hidden="true">
                                {icons?.cloud ? <img src={icons.cloud} alt="" /> : "↥"}
                            </span>
                            <strong>Choose a file or drag & drop it here</strong>
                            <span>JPG, PNG or PDF, up to 10 MB</span>
                            <span className={styles.browseButton}>Browse File</span>
                        </label>
                        {file && (
                            <div className={`${styles.fileCard} ${uploadStatus === "failed" ? styles.fileCardFailed : ""}`}>
                                <div className={styles.fileIcon} aria-hidden="true">ALGO</div>
                                <div className={styles.fileInfo}>
                                    <strong>{file.name}</strong>
                                    <div className={styles.fileMeta}>
                                        <span>{formatFileSize(file.size)}</span>
                                        <span>•</span>
                                        {uploadStatus === "ready" && <span>Ready to upload</span>}
                                        {uploadStatus === "uploading" && <span className={styles.uploadingStatus}>Uploading… {uploadProgress}%</span>}
                                        {uploadStatus === "completed" && <span className={styles.completedStatus}>● Completed</span>}
                                        {uploadStatus === "failed" && <span className={styles.failedStatus}>● Failed</span>}
                                    </div>
                                    {uploadStatus === "failed" && (
                                        <button className={styles.tryAgain} type="button" onClick={submitConfirmation}>Try Again</button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className={styles.fileAction}
                                    onClick={removeSelectedFile}
                                    disabled={uploadStatus === "uploading"}
                                    aria-label="Remove file"
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
                                ? `Uploading ${uploadProgress}%`
                                : uploadStatus === "completed"
                                    ? "Sent"
                                    : "Send"}
                        </button>
                        <button className={styles.secondaryButton} onClick={openHelp}>
                            Need help?
                        </button>
                    </>
                )}

            </section>
        </div>
    );
}
