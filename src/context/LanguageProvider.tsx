"use client";

import {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";

import Cookies from "js-cookie";
import {translations} from "@/translations";

export type Language = "UA" | "RU" | "EN";

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (typeof translations)[Language];
}

const LanguageContext =
    createContext<LanguageContextType | undefined>(
        undefined
    );

interface LanguageProviderProps {
    children: ReactNode;
    initialLanguage: Language;
}

export const LanguageProvider = ({children, initialLanguage,}: LanguageProviderProps) => {
    const [language, setLanguageState] =
        useState<Language>(initialLanguage);

    const setLanguage = (newLanguage: Language) => {
        setLanguageState(newLanguage);

        Cookies.set("algo_lang", newLanguage, {
                expires: 365,
                path: "/",
                sameSite: "lax",
            }
        );
    };

    const t = translations[language];

    const contextValue =
        useMemo(() => ({language, setLanguage, t}), [language, t]);

    return (
        <LanguageContext.Provider
            value={contextValue}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context =
        useContext(LanguageContext);

    if (!context) {
        throw new Error(
            "useLanguage must be used inside LanguageProvider"
        );
    }

    return context;
};