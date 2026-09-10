export const REFERRAL_STORAGE_KEY = "algo_world_referral_v1";

const REFERRAL_LIFETIME = 30 * 24 * 60 * 60 * 1000;
const REFERRAL_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

type StoredReferral = {
    code: string;
    capturedAt: number;
    expiresAt: number;
};

function normalizeReferral(value: string | null | undefined) {
    const code = value?.trim() ?? "";

    return REFERRAL_PATTERN.test(code) ? code : "";
}

export function clearReferralCode() {
    if (typeof window === "undefined") return;

    localStorage.removeItem(REFERRAL_STORAGE_KEY);
}
export function readReferralCode(): string {
    if (typeof window === "undefined") return "";

    try {
        const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
        if (!raw) return "";

        const stored = JSON.parse(raw) as Partial<StoredReferral>;

        if (
            typeof stored.code !== "string" ||
            typeof stored.expiresAt !== "number" ||
            stored.expiresAt <= Date.now()
        ) {
            localStorage.removeItem(REFERRAL_STORAGE_KEY);
            return "";
        }

        return normalizeReferral(stored.code);
    } catch {
        localStorage.removeItem(REFERRAL_STORAGE_KEY);
        return "";
    }
}

export function captureReferralFromUrl(): string {
    if (typeof window === "undefined") return "";

    // Первый реферер не перезаписывается.
    const existingCode = readReferralCode();
    if (existingCode) return existingCode;

    const url = new URL(window.location.href);
    const code = normalizeReferral(url.searchParams.get("ref"));

    if (!code) return "";

    const now = Date.now();

    const referral: StoredReferral = {
        code,
        capturedAt: now,
        expiresAt: now + REFERRAL_LIFETIME,
    };

    localStorage.setItem(
        REFERRAL_STORAGE_KEY,
        JSON.stringify(referral),
    );

    return code;
}