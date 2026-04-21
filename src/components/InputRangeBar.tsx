import React, {useState} from 'react';
import dollar_circle from "../app/terra/images/dollar_circle.svg";

const InputRangeBar = ({SLIDER_MAX, startValue, inputIcon, value, setValue}:any) => {


    const formatNumber = (num:any) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const cleanNumber = (str:any) => {
        return str.replace(/\s/g, '');
    };

    const handleChange = (e:any) => {
        const rawValue = cleanNumber(e.target.value);

        if (rawValue !== '' && !/^\d+$/.test(rawValue)) return;

        const numValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
        setValue(numValue);
    };

    const sliderValue = Math.min(value, SLIDER_MAX);
    const progress = (sliderValue / SLIDER_MAX) * 100;
    return (
        <>
            <div className="input_block">
                <div className="input_icon">
                    <img src={inputIcon.src} alt="icon" />
                </div>
                <input
                    type="text"
                    inputMode="numeric"
                    value={value === 0 ? "" : formatNumber(value)}
                    onChange={handleChange}
                    placeholder={startValue}
                    className = "start_summ"
                />
            </div>

            <div className="range_bar_start">
                <input
                    type="range"
                    min="0"
                    max={SLIDER_MAX}
                    value={sliderValue}
                    onChange={handleChange}
                    className="styled-slider"
                    style={{ backgroundSize: `${progress}% 100%` }}
                />
            </div>
        </>
    );
};

export default InputRangeBar;