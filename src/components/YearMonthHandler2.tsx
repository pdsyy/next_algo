import React, {useState} from 'react';

const YearMonthHandler = ({leftItem, rightItem, handleValue, setHandleValue}:any) => {

    const [hoverMonthYearFirst, setHoverMonthYearFirst] = useState(null);
    const [MonthYearFirst, setMonthYearFirst] = useState(leftItem);
    console.log(handleValue)
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
                    setHandleValue(3.5)
                    console.log(handleValue)
                }}
            >
                {leftItem}</div>
            <div
                className={`month ${MonthYearFirst === rightItem ? "active" : ""}`}
                onClick={() => {
                    setHoverMonthYearFirst(rightItem)
                    setMonthYearFirst(rightItem)
                    setHandleValue(2)
                    console.log(handleValue)
                }}
            >
                {rightItem}
            </div>
        </div>
    );
};

export default YearMonthHandler;