import { NextResponse } from "next/server";

type GoogleVerification = {
    success?: boolean;
    score?: number;
    action?: string;
    hostname?: string;
    "error-codes"?: string[];
};

export async function POST(request: Request) {
    try {
        const secret = process.env.RECAPTCHA_SECRET_KEY;
        if (!secret) {
            return NextResponse.json(
                { verified: false, error: "reCAPTCHA secret key is missing." },
                { status: 500 },
            );
        }

        const body: unknown = await request.json();
        const token =
            body && typeof body === "object" && "token" in body
                ? (body as { token?: unknown }).token
                : null;

        if (typeof token !== "string" || !token) {
            return NextResponse.json(
                { verified: false, error: "reCAPTCHA token is missing." },
                { status: 400 },
            );
        }

        const response = await fetch(
            "https://www.google.com/recaptcha/api/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ secret, response: token }),
                cache: "no-store",
            },
        );

        const verification = await response.json() as GoogleVerification;
        const verified =
            verification.success === true &&
            verification.action === "checkout_submit" &&
            typeof verification.score === "number" &&
            verification.score >= 0.5;

        if (!verified) {
            return NextResponse.json(
                { verified: false, error: "reCAPTCHA verification failed." },
                { status: 403 },
            );
        }

        return NextResponse.json({ verified: true });
    } catch (error) {
        console.error("RECAPTCHA VERIFY ERROR:", error);
        return NextResponse.json(
            { verified: false, error: "Could not verify reCAPTCHA." },
            { status: 500 },
        );
    }
}