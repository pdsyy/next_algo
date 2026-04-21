"use client"
import {createContext, useState, useContext, useEffect, ReactNode} from 'react';
import { translations } from '@/translations';
import Cookies from 'js-cookie';

interface LanguageContextType {
    language: string,
    setLanguage: (lang: string) => void,
    t: any
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({children, initialLanguage}: {children: ReactNode, initialLanguage: string}) => {
    const [language, setLang] = useState<string>(initialLanguage);
    useEffect(() => {
        const savedLang = localStorage.getItem("algo_lang");
        if (savedLang && savedLang !== language) {
            setLang(savedLang);
        }
    }, []);
    const setLanguage = (newLang: string) => {
        setLang(newLang);
        localStorage.setItem("algo_lang", newLang);
        Cookies.set("algo_lang", newLang, {expires: 365})
    };

    //const t = translations[language as keyof typeof translations];
    const t = translations["EN"];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);