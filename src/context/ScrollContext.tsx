"use client"
import { createContext, useContext } from 'react';
interface ScrollContextType {
    scrollToSection: (sectionId: any) => void
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider = ({ children }: any) => {
    const scrollToSection = (sectionId:string) => {
        const isMainPage = window.location.pathname === "/";

        if (isMainPage) {
            const element = document.getElementById(sectionId);
            if (element) {
                const elementHeight = element.offsetHeight;
                const windowHeight = window.innerHeight;
                const headerOffset = 100;

                if (elementHeight > windowHeight * 0.8) {
                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: elementPosition - headerOffset,
                        behavior: 'smooth'
                    });
                } else {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        } else {
            window.location.href = `/#${sectionId}`;
        }
    };

    return (
        <ScrollContext.Provider value={{ scrollToSection }}>
            {children}
        </ScrollContext.Provider>
    );
};

export const useScroll = () => useContext(ScrollContext);