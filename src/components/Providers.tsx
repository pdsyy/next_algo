"use client";

import React, { useState, ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageProvider";
import { ScrollProvider } from "@/context/ScrollContext";
import Header from "@/components/Header";
import {ThemeContext} from "@/context/ThemeContext";

export default function Providers({children, initialLanguage}: {children: ReactNode, initialLanguage: string }) {
    const [darkTheme, setDarkTheme] = useState(false);
    const [visibleHeader, setVisibleHeader] = useState(false);
    console.log(initialLanguage)

    return (
        <LanguageProvider initialLanguage={initialLanguage}>
            <ScrollProvider>
                <ThemeContext.Provider value={{setDarkTheme}}>
                <div className="App">


                    <Header
                        dark={darkTheme}
                        visibleHeader={visibleHeader}
                        setVisibleHeader={setVisibleHeader}
                        initialLanguage={initialLanguage}
                    />
                    {children}
                </div>
                </ThemeContext.Provider>
            </ScrollProvider>
        </LanguageProvider>
    );
}