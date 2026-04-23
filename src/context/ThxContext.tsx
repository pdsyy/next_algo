"use client"
import {createContext, useState, useContext, ReactNode} from 'react';

// Визначаємо інтерфейс для контексту
interface ThxContextType {
    activePopup: boolean;
    setActivePopup: (val: boolean) => void;
}

const ThxContext = createContext<ThxContextType | undefined>(undefined);

export const ThxProvider = ({children}: {children: ReactNode}) => {
    const [activePopup, setActivePopup] = useState(false);

    return (
        <ThxContext.Provider value={{activePopup, setActivePopup}}>
            {children}
        </ThxContext.Provider>
    );
};

export const useThxContext = () => {
    const context = useContext(ThxContext);
    if (context === undefined) {
        throw new Error('useThxContext must be used within a ThxProvider');
    }
    return context;
};