"use client";

interface YearMonthHandlerProps {
    leftItem: string;
    rightItem: string;
    handleValue: string;
    setHandleValue: (value: string) => void;
}

const YearMonthHandler = ({
                              leftItem,
                              rightItem,
                              handleValue,
                              setHandleValue,
                          }: YearMonthHandlerProps) => {
    const isLeftActive = handleValue === leftItem;
    const isRightActive = handleValue === rightItem;

    return (
        <div className="month_year_handler">
            <div
                className={`top_handler_calc ${
                    isRightActive ? "active_month" : ""
                }`}
            />

            <div
                className={`year ${isLeftActive ? "active" : ""}`}
                onClick={() => setHandleValue(leftItem)}
            >
                {leftItem}
            </div>

            <div
                className={`month ${isRightActive ? "active" : ""}`}
                onClick={() => setHandleValue(rightItem)}
            >
                {rightItem}
            </div>
        </div>
    );
};

export default YearMonthHandler;