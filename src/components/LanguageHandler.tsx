"use client";

export type DeliveryLanguage = "en" | "ru";

interface LanguageHandlerProps {
    value: DeliveryLanguage;
    onChange: (value: DeliveryLanguage) => void;
}

const LanguageHandler = ({
                             value,
                             onChange,
                         }: LanguageHandlerProps) => {
    const isEnglishActive = value === "en";
    const isRussianActive = value === "ru";

    return (
        <div className="month_year_handler">
            <div
                className={`top_handler_calc ${
                    isRussianActive ? "active_month" : ""
                }`}
            />

            <div
                className={`year ${isEnglishActive ? "active" : ""}`}
                onClick={() => onChange("en")}
            >
                English
            </div>

            <div
                className={`month ${isRussianActive ? "active" : ""}`}
                onClick={() => onChange("ru")}
            >
                Русский
            </div>
        </div>
    );
};

export default LanguageHandler;
