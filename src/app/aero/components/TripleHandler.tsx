import React from "react";

interface HandlerItem {
    value: number;
    label: React.ReactNode;
}

interface TripleHandlerTypes {
    items: HandlerItem[];
    handleValue: number;
    setHandleValue: (value: number) => void;
}

const TripleHandler = ({
                           items,
                           handleValue,
                           setHandleValue,
                       }: TripleHandlerTypes) => {
    const activeIndex = items.findIndex(
        (item) => item.value === handleValue
    );

    return (
        <div className="triple_handler explore_records">
            {items.length > 0 && activeIndex >= 0 && (
                <div
                    className="top_handler_calc"
                    style={{
                        width: `calc(${100 / items.length}% - 6px)`,
                        left: `calc(${
                            (activeIndex * 100) / items.length
                        }% + 4px)`,
                    }}
                />
            )}

            {items.map((item) => (
                <div
                    key={item.value}
                    className={`handler_item ${
                        handleValue === item.value ? "active" : ""
                    }`}
                    style={{ flex: 1 }}
                    onClick={() => setHandleValue(item.value)}
                >
                    {item.label}
                </div>
            ))}
        </div>
    );
};

export default TripleHandler;