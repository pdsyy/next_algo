import React, {useMemo, useState} from 'react';
import InputRangeBar from "./InputRangeBar";
import dollar_circle from "./components_images/dollar_circle.svg";
import info_icon from "./components_images/info_icon.svg";
import YearMonthHandler from "./YearMonthHandler";
import calendar_icon from "./components_images/calendar_icon.svg";
import percent_icon from "./components_images/percent_icon.svg";
import {HTMLMotionProps, motion} from "framer-motion"
import {useLanguage} from "@/context/LanguageProvider";

type PeriodUnit = "year" | "month";
type Frequency = "yearly" | "monthly";

type CalculationResult = {
    year: number;
    balance: number;
    addedYear: number;
    totalAdded: number;
    yearlyIncome: number;
    totalIncome: number;
    finalBalance: number;
};

const CalculatorSection = ({name}:any) => {
    const { t } = useLanguage()!;

    const [hasCalculated, setHasCalculated] = useState(false);

    const [startSum, setStartSum] = useState(10000)

    const [years, setYears] = useState(5);
    const [rate, setRate] = useState(25);
    const [refillSum, setRefillSum] = useState(0);

    // В состоянии храним стабильные значения, а не переведённый текст.
    // Благодаря этому расчёт одинаково работает на UA / RU / EN.
    const [periodUnit, setPeriodUnit] = useState<PeriodUnit>("year");
    const [rateFrequency, setRateFrequency] = useState<Frequency>("yearly");
    const [refillFrequency, setRefillFrequency] = useState<Frequency>("yearly");

    const calcResults = useMemo<CalculationResult[]>(() => {
        if (!hasCalculated) return [];

        let currentBalance = startSum;
        let totalInvested = startSum;
        let totalIncome = 0;
        let elapsedMonths = 0;
        const results: CalculationResult[] = [];

        // Один ряд таблицы — один выбранный пользователем период.
        const iterations = years;
        const monthsInPeriod = periodUnit === "year" ? 12 : 1;

        // Если ставка годовая, переводим её в эквивалентную месячную.
        // За 12 месяцев итоговая доходность будет равна указанной годовой ставке.
        const monthlyRate =
            rateFrequency === "monthly"
                ? rate / 100
                : Math.pow(1 + rate / 100, 1 / 12) - 1;

        for (let i = 1; i <= iterations; i++) {
            let periodIncome = 0;
            let periodAdded = 0;
            const startOfPeriodBalance = currentBalance;

            for (let month = 0; month < monthsInPeriod; month++) {
                const monthlyProfit = currentBalance * monthlyRate;
                currentBalance += monthlyProfit;
                periodIncome += monthlyProfit;
                elapsedMonths += 1;

                const shouldRefill =
                    refillFrequency === "monthly" || elapsedMonths % 12 === 0;

                if (shouldRefill) {
                    currentBalance += refillSum;
                    totalInvested += refillSum;
                    periodAdded += refillSum;
                }
            }

            totalIncome += periodIncome;

            results.push({
                year: i,
                balance: startOfPeriodBalance,
                addedYear: periodAdded,
                totalAdded: totalInvested,
                yearlyIncome: periodIncome,
                totalIncome: totalIncome,
                finalBalance: currentBalance
            });
        }

        return results;
    }, [
        hasCalculated,
        periodUnit,
        rate,
        rateFrequency,
        refillFrequency,
        refillSum,
        startSum,
        years,
    ]);

    const handleCalculate = () => {
        setHasCalculated(true);
    };

    const pointVariants:any = {
        hidden: {opacity: 0, y: 20},
        visible: (i:any) => ({
            opacity: 1,
            y: 0,
            transition: {delay: i * 0.15, duration: 0.6, ease: "easeOut"}
        })
    };
    const fadeNumeric:HTMLMotionProps<any> = {
        initial: "hidden",
        whileInView: "visible",
        viewport: {once: true},
        variants: pointVariants
    };

    const fadeUp:HTMLMotionProps<any> = {
        initial: {opacity: 0, y: 40},
        whileInView: {opacity: 1, y: 0},
        viewport: {once: true, amount: 0.3},
        transition: {duration: 0.8, ease: "easeOut"}
    };

    return (
        <div className="calculate_block_container">
            <motion.h2 {...fadeUp}>
                <span>{t.terra.calculator.titleAccent}</span> {t.terra.calculator.title}
            </motion.h2>
            <div className="calculate_block_fs">
                <motion.div className="calculate_block" {...fadeNumeric} custom={1}>
                    <div className="calculate_theme">
                        {t.terra.calculator.themes.sumAndTerm}
                    </div>
                    <div className="input_name">
                        {t.terra.calculator.labels.startSum}
                    </div>
                    <InputRangeBar SLIDER_MAX="50000" startValue="10000" inputIcon={dollar_circle} value={startSum}
                                   setValue={setStartSum}/>

                    <div className="calculate_warn">
                        <img src={info_icon.src} alt=""/> {t.terra.calculator.warnings.startSum}
                    </div>
                    <div className="input_name">
                        {t.terra.calculator.labels.unit}
                    </div>

                    <YearMonthHandler
                        leftItem={t.terra.calculator.units.year}
                        rightItem={t.terra.calculator.units.month}
                        handleValue={
                            periodUnit === "year"
                                ? t.terra.calculator.units.year
                                : t.terra.calculator.units.month
                        }
                        setHandleValue={(value: unknown) => {
                            if (typeof value !== "string") return;
                            setPeriodUnit(
                                value === t.terra.calculator.units.month
                                    ? "month"
                                    : "year",
                            );
                        }}
                    />

                    <div className="input_name mt8">
                        {t.terra.calculator.labels.term}
                    </div>

                    <InputRangeBar SLIDER_MAX="10" startValue="5" inputIcon={calendar_icon} value={years}
                                   setValue={setYears}/>

                    <div className="calculate_warn">
                        <img src={info_icon.src} alt=""/> {t.terra.calculator.warnings.term}
                    </div>

                    <hr className="calculate_hr"/>

                    <div className="calculate_theme mt12">
                        {t.terra.calculator.themes.interest}
                    </div>
                    <div className="input_name mt8">
                        {t.terra.calculator.labels.frequency}
                    </div>

                    <YearMonthHandler
                        leftItem={t.terra.calculator.units.yearly}
                        rightItem={t.terra.calculator.units.monthly}
                        handleValue={
                            rateFrequency === "yearly"
                                ? t.terra.calculator.units.yearly
                                : t.terra.calculator.units.monthly
                        }
                        setHandleValue={(value: unknown) => {
                            if (typeof value !== "string") return;
                            setRateFrequency(
                                value === t.terra.calculator.units.monthly
                                    ? "monthly"
                                    : "yearly",
                            );
                        }}
                    />

                    <div className="input_name mt8">
                        {t.terra.calculator.labels.rate}
                    </div>

                    <InputRangeBar SLIDER_MAX="50" startValue="25" inputIcon={percent_icon} value={rate}
                                   setValue={setRate}/>

                    <div className="calculate_warn">
                        <img src={info_icon.src} alt=""/> {t.terra.calculator.warnings.rate}
                    </div>

                    <hr className="calculate_hr"/>

                    <div className="calculate_theme mt12">
                        {t.terra.calculator.themes.refill}
                    </div>
                    <div className="input_name mt8">
                        {t.terra.calculator.labels.frequency}
                    </div>
                    <YearMonthHandler
                        leftItem={t.terra.calculator.units.yearly}
                        rightItem={t.terra.calculator.units.monthly}
                        handleValue={
                            refillFrequency === "yearly"
                                ? t.terra.calculator.units.yearly
                                : t.terra.calculator.units.monthly
                        }
                        setHandleValue={(value: unknown) => {
                            if (typeof value !== "string") return;
                            setRefillFrequency(
                                value === t.terra.calculator.units.monthly
                                    ? "monthly"
                                    : "yearly",
                            );
                        }}
                    />
                    <div className="input_name mt8">
                        {t.terra.calculator.labels.sum}
                    </div>

                    <InputRangeBar SLIDER_MAX="10000" startValue="0" inputIcon={dollar_circle} value={refillSum}
                                   setValue={setRefillSum}/>

                    <div className="calculate_warn">
                        <img src={info_icon.src} alt=""/> {t.terra.calculator.warnings.refill}
                    </div>

                    <div className="calculate_button" onClick={handleCalculate}>
                        {t.terra.calculator.button}
                    </div>

                </motion.div>
                <motion.div className="calculate_table" {...fadeNumeric} custom={2}>
                    <div className="calculate_table_name">{t.terra.calculator.table.tableName}</div>

                    {calcResults.length > 0 ? (
                        <div className="table_wrapper">
                            <table className="results_table">
                                <thead>
                                <tr>
                                    <th>{periodUnit === "year" ? t.terra.calculator.units.year : t.terra.calculator.units.month}</th>
                                    <th>{t.terra.calculator.table.balance}</th>
                                    <th>{periodUnit === "year" ? t.terra.calculator.table.addedYear : t.terra.calculator.table.addedMonth}</th>
                                    <th>{t.terra.calculator.table.totalAdded}</th>
                                    <th>{periodUnit === "year" ? t.terra.calculator.table.incomeYear : t.terra.calculator.table.incomeMonth}</th>
                                    <th>{t.terra.calculator.table.totalIncome}</th>
                                    <th>{t.terra.calculator.table.finalBalance}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {calcResults.map((row:any) => (
                                    <tr key={row.year}>
                                        <td>{row.year}</td>
                                        <td>{row.balance.toLocaleString()}</td>
                                        <td>{row.addedYear.toLocaleString()}</td>
                                        <td>{row.totalAdded.toLocaleString()}</td>
                                        <td>{row.yearlyIncome.toLocaleString()}</td>
                                        <td>{row.totalIncome.toLocaleString()}</td>
                                        <td>{row.finalBalance.toLocaleString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="calculate_table_description" dangerouslySetInnerHTML={{ __html: t.terra.calculator.table.description }} />
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default CalculatorSection;