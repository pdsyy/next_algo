"use client";

import React, { useEffect, useRef, useState } from "react";
import TributePaymentFlow from "../review/TributePaymentFlow";

export default function TributeOrderReturnPage() {
    const [token, setToken] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    const captured = useRef<string | null>(null);
    useEffect(() => {
        if (captured.current === null) {
            const fromLink = new URLSearchParams(window.location.hash.slice(1)).get("token");
            let saved = "";
            try { saved = sessionStorage.getItem("aw_tribute_return_token_v1") ?? ""; } catch { /* optional */ }
            captured.current = fromLink ?? saved;
            if (fromLink) {
                // Avoid leaving the bearer token in the address bar or navigation history.
                window.history.replaceState(null, "", window.location.pathname);
                try { sessionStorage.setItem("aw_tribute_return_token_v1", fromLink); } catch { /* optional */ }
            }
        }
        const value = captured.current ?? "";
        setToken(/^[a-f0-9]{32}_[A-Za-z0-9_-]{24}$/.test(value) ? value : null);
        setLoaded(true);
    }, []);
    if (!loaded) return <main aria-busy="true" />;
    if (!token) return <main style={{ padding: 32 }}>
        <p>Open “Return to order” in the Telegram bot. / Нажмите «Вернуться к заказу» в Telegram-боте.</p>
        <a href="/">Algo World</a>
    </main>;
    return <TributePaymentFlow
        isOpen
        onClose={() => window.location.assign("/")}
        recoveryToken={token}
        customer={{ firstName: "", lastName: "", email: "", referralCode: "", deliveryLanguage: "en", existingCustomer: false, checkoutReference: "recovery" }}
        items={[{ id: "aero-ea", quantity: 1 }]}
    />;
}
