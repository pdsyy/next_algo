"use client"
import React, {useState} from 'react';
interface YearMonthHandlerProps {
    leftItem: any,
    rightItem: any,
    handleValue: any,
    setHandleValue: (value: any) => void
}

const YearMonthHandler = ({leftItem, rightItem, handleValue, setHandleValue}: YearMonthHandlerProps) => {

    const [hoverMonthYearFirst, setHoverMonthYearFirst] = useState(null);
    const [MonthYearFirst, setMonthYearFirst] = useState(leftItem);

    return (
        <div className="month_year_handler">
            <div className={`top_handler_calc ${
                (hoverMonthYearFirst === rightItem || (!hoverMonthYearFirst && MonthYearFirst === rightItem)) ? "active_month" : ""
            }`}></div>
            <div
                className={`year ${MonthYearFirst === leftItem ? "active" : ""}`}
                onClick={() => {
                    setHoverMonthYearFirst(leftItem)
                    setMonthYearFirst(leftItem)
                    setHandleValue(leftItem)
                }}
            >
                {leftItem}</div>
            <div
                className={`month ${MonthYearFirst === rightItem ? "active" : ""}`}
                onClick={() => {
                    setHoverMonthYearFirst(rightItem)
                    setMonthYearFirst(rightItem)
                    setHandleValue(rightItem)
                }}
            >
                {rightItem}
            </div>
        </div>
    );
};

export default YearMonthHandler;