"use client";

import { useEffect } from "react";
import { captureReferralFromUrl } from "@/lib/referral";

export default function ReferralTracker() {
    useEffect(() => {
        captureReferralFromUrl();
    }, []);

    return null;
}