"use client";

import React, {
    ReactNode,
    useState,
} from "react";

import {LanguageProvider} from "@/context/LanguageProvider";
import type {Language} from "@/context/LanguageProvider";
import {ScrollProvider} from "@/context/ScrollContext";
import {ThemeContext} from "@/context/ThemeContext";
import {ThxProvider} from "@/context/ThxContext";
import Header from "@/components/Header";
import ThxPopup from "@/components/ThxPopup";
import {CartProvider} from "@/components/cartPopup/CartProvider";
import ReferralTracker from "@/components/ReferralTracker";


interface ProvidersProps {
    children: ReactNode;
    initialLanguage: Language;
}


export default function Providers({children, initialLanguage}: ProvidersProps) {
    const [darkTheme, setDarkTheme] = useState(false);
    const [visibleHeader, setVisibleHeader] = useState(false);

    return (
        <LanguageProvider
            initialLanguage={initialLanguage}
        >
            <ScrollProvider>
                <ThxProvider>
                    <ThemeContext.Provider
                        value={{
                            setDarkTheme,
                        }}
                    >
                        <CartProvider>
                            <ReferralTracker />
                            <div className="App">
                                <Header
                                    dark={darkTheme}
                                    visibleHeader={
                                        visibleHeader
                                    }
                                    setVisibleHeader={
                                        setVisibleHeader
                                    }
                                />

                                {children}

                                <ThxPopup/>
                            </div>
                        </CartProvider>
                    </ThemeContext.Provider>
                </ThxProvider>
            </ScrollProvider>
        </LanguageProvider>
    );
}