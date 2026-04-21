import React, { useState } from 'react';
import {useLanguage} from "@/context/LanguageProvider";
interface TripleHandlerTypes {
    items: string[],
    handleValue: any,
    setHandleValue: (item: any) => void
}

const TripleHandler = ({ items, handleValue, setHandleValue }:TripleHandlerTypes) => {
    // items = ["EN", "UA", "RU"]
    const {t, language, setLanguage} = useLanguage()!;
    const [activeIndex, setActiveIndex] = useState(items.indexOf(language));


    const handleClick = (item:string, index:number) => {
        setActiveIndex(index);
        setHandleValue(item);
    };

    return (
        <div className="triple_handler">
            <div
                className="top_handler_calc"
                style={{
                    width: 'calc(33.33% - 6px)',
                    left: `calc(${activeIndex * 33.33}% + 4px)`
                }}
            ></div>

            {items.map((item, index) => (
                <div
                    key={item}
                    className={`handler_item ${activeIndex === index ? "active" : ""}`}
                    onClick={() => handleClick(item, index)}
                >
                    {item}
                </div>
            ))}
        </div>
    );
};

export default TripleHandler;