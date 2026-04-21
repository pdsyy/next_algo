import React, {useState} from 'react';
import dep_icon1 from "./components_images/dep_icon1.svg";
import dep_icon2 from "./components_images/dep_icon2.svg";
import dep_icon3 from "./components_images/dep_icon1.svg";
import dollar_circle from "./components_images/dollar_circle.svg";
import gradient_icon from "./components_images/gradient_line.svg";
import orange_line_icon from "./components_images/orange_line.svg";
import calendar_prop_icon from "./components_images/calendar_prop_icon.svg";
import {HTMLMotionProps, motion} from "framer-motion"
import {useLanguage} from "@/context/LanguageProvider";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Text,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine, ReferenceDot, Label
} from 'recharts';
import YearMonthHandler2 from "./YearMonthHandler2";


const CustomPaybackDot = (props:any) => {
    const { cx, cy } = props;

    if (!cx || !cy) return null;

    return (
        <svg x={cx - 10} y={cy - 10} width={20} height={20} viewBox="0 0 20 20">

            <circle cx="10" cy="10" r="7.5" fill="#FF8D28" />

            <circle cx="10" cy="10" r="3.5" fill="#121313" />
        </svg>
    );
};

const CalculatorSection = ({startPercentage}:any) => {
    const {t} = useLanguage()!;

    const [startSum, setStartSum] = useState(10000)

    const [rate, setRate] = useState(3.5);




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
        setStartSum(numValue);
    };

    const [isReinvest, setIsReinvest] = useState(false);


    const [calcResults, setCalcResults]:any = useState(null);
    const [paybackBalanceY, setPaybackBalanceY] = useState(null);
    const [exactPaybackX, setExactPaybackX] = useState(null);
    let paybackDaysDisplay;
    if (exactPaybackX !== null) {
        const days = Math.round(exactPaybackX * 30.44);
        paybackDaysDisplay = `${days} днів`;
    } else if (calcResults) {
        // Если расчет был, но точка не найдена
        paybackDaysDisplay = "> 1 року";
    } else {
        paybackDaysDisplay = "—";
    }

    const handleCalculate = () => {


        let currentBalance = startSum;
        const results:any = [];
        const monthlyRate = rate / 100;
        const botCost = 350;

        // Точка старта
        results.push({ month: 0, balance: startSum, profit: 0 });

        let foundX:any = null;
        let foundYBalance = null;

        for (let i = 1; i <= 12; i++) {
            let prevProfit = results[i - 1].profit;
            let prevBalance = results[i - 1].balance;

            let monthlyProfit = currentBalance * monthlyRate;

            if (isReinvest) {
                currentBalance += monthlyProfit;
            }

            let currentTotalProfit = isReinvest ? (currentBalance - startSum) : (monthlyProfit * i);

            let currentMonthBalance = isReinvest ? currentBalance : (startSum + currentTotalProfit);

            if (foundX === null && currentTotalProfit >= botCost) {
                const profitGain = currentTotalProfit - prevProfit;
                const needed = botCost - prevProfit;
                const ratio = needed / profitGain;

                foundX = (i - 1) + ratio;

                const balanceGain = currentMonthBalance - prevBalance;
                foundYBalance = prevBalance + (balanceGain * ratio);
            }

            results.push({
                month: i,
                balance: Math.round(currentMonthBalance),
                profit: Math.round(currentTotalProfit),
            });
        }


        setCalcResults(results);
        setExactPaybackX(foundX);
        setPaybackBalanceY(foundYBalance);
        console.log(calcResults)
    };

    const lastResult = calcResults ? calcResults[calcResults.length - 1] : null;

    const paybackDays = exactPaybackX ? Math.round(exactPaybackX * 30.44) : 0;
    console.log(paybackDays.toString().split("").at(-1))

    const CustomTooltip = ({ active, payload, label }:any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip-container">
                    <div className="tooltip_label"><div className = "month_text" style = {{textTransform:"capitalize"}}><img src={calendar_prop_icon.src} alt = ""/>{t.prop.calculator.labels.month}</div> <div>{label}</div></div>
                    <div className = "graph_balance"><div className = "popup_point_text">Баланс:</div> <div className = "graph_popup_value">{payload[0].value} USD</div></div>
                    <div className = "graph_profit"><div className = "popup_point_text">{t.prop.calculator.graph.legend.profit}:</div> <div className = "graph_popup_value" style={{color:"#34C759"}}>{payload[1].value} USD</div></div>
                </div>
            );
        }
        return null;
    };
    return (
        <div className="calculate_block_container">
            <motion.h2 {...fadeUp}>
                <span>{t.terra.calculator.titleAccent}</span> {t.terra.calculator.title}
            </motion.h2>
            <div className="calculate_block_fs">
                <motion.div className="calculate_block" {...fadeNumeric} custom={1}>
                    <div className="calculate_theme">
                        {t.prop.calculator.sumAndTerm}
                    </div>

                    <div className="input_name">
                        {t.prop.calculator.labels.depositType}
                    </div>

                    <YearMonthHandler2
                        leftItem={t.prop.calculator.labels.ownDeposit}
                        rightItem={t.prop.calculator.labels.instantProp}
                        handleValue={rate}
                        setHandleValue={setRate}
                    />

                    <div className="input_name">
                        {t.prop.calculator.labels.startSum}
                    </div>

                    <div className="input_block">
                        <div className="input_icon">
                            <img src={dollar_circle.src} alt="icon"/>
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={startSum === 0 ? "" : formatNumber(startSum)}
                            onChange={handleChange}
                            placeholder="10000"
                            className="start_summ"
                        />
                    </div>

                    <div className="reinvest_block">
                        <div className={`reinvest_handler ${isReinvest ? "active_reinvest" : ""}`}
                             onClick={() => setIsReinvest(!isReinvest)}>
                            <div></div>
                        </div>
                        {t.prop.calculator.labels.reinvest}
                    </div>

                    <div className="test_detail_item mt16">
                        {t.prop.calculator.labels.botPrice}
                        <div className="test_detail_number">
                            350$
                        </div>
                    </div>
                    <div className="test_detail_item">
                        {t.prop.calculator.labels.monthSubscribe}
                        <div className="test_detail_number">
                            <span>1 {t.prop.calculator.labels.month} FREE</span>39$
                        </div>
                    </div>

                    <div className="test_detail_item last_item">
                        {t.prop.calculator.labels.term}
                        <div className="test_detail_number">
                            {t.prop.calculator.labels.months12}
                        </div>
                    </div>

                    <div className="prop_calculate_btn" onClick={handleCalculate}>
                        {t.prop.calculator.labels.calculateBtn}
                    </div>
                </motion.div>




                <motion.div className="calculate_table" {...fadeNumeric} custom={2}>

                    {calcResults ? (
                        <>
                            <div className="graph_data">
                                <div className="deposit_rate">
                                    <div className="deposit_numbers">
                                        <div className="dep_point_name">
                                            <img src={dep_icon1.src} alt=""/>
                                            {t.prop.calculator.graph.netProfit}
                                        </div>
                                        <div className="dep_price">
                                            {lastResult ? formatNumber(lastResult.profit) : "0"} USD
                                        </div>
                                        <div className="dep_period">
                                            {t.prop.calculator.graph.period12}
                                        </div>
                                    </div>
                                    <div className="deposit_numbers">
                                        <div className="dep_point_name">
                                            <img src={dep_icon2.src} alt=""/>
                                            {t.prop.calculator.graph.totalBalance}
                                        </div>
                                        <div className="dep_price">
                                            {lastResult ? formatNumber(lastResult.balance) : "0"} USD
                                        </div>
                                        <div className="dep_period">
                                            {t.prop.calculator.graph.endOfTerm}
                                        </div>
                                    </div>
                                    <div className="deposit_numbers">
                                        <div className="dep_point_name">
                                            <img src={dep_icon3.src} alt=""/>
                                            {t.prop.calculator.graph.payback}
                                        </div>
                                        <div className="dep_price">
                                            {paybackDaysDisplay}
                                        </div>
                                        <div className="dep_period">
                                            {t.prop.calculator.graph.costNotice}
                                        </div>
                                    </div>
                                </div>
                                <div className="legend_section">
                                    <div className="legend_block">
                                        <div className="legend_icon circle_blue"></div>
                                        {t.prop.calculator.graph.legend.pnl}
                                    </div>
                                    <div className="legend_block">
                                        <div className="legend_icon circle_orange"></div>
                                        {t.prop.calculator.graph.legend.payback}
                                    </div>
                                    <div className="legend_block">
                                        <div className="legend_icon">
                                            <img src={gradient_icon.src} alt=""/>
                                        </div>
                                        {t.prop.calculator.graph.legend.balance}
                                    </div>
                                    <div className="legend_block">
                                        <div className="legend_icon">
                                            <img src={orange_line_icon.src} alt=""/>
                                        </div>
                                        {t.prop.calculator.graph.legend.profit}
                                    </div>
                                </div>
                            </div>


                            <div style={{ width: '100%', height: 240, overflowX: window.innerWidth < 768 ? "scroll" : "visible"}}>
                                <ResponsiveContainer minWidth={750}>
                                    <LineChart data={calcResults} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid  vertical={false} stroke="#414141" />
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#01F1E3" stopOpacity={1} />
                                            <stop offset="30%" stopColor="#01F1E3" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#5CF101" stopOpacity={1} />
                                        </linearGradient>
                                        <XAxis
                                            dataKey="month"
                                            type="number"
                                            domain={[0, 12]}
                                            ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                                        />
                                        <YAxis
                                            stroke="#444"
                                            tick={{ fill: '#EFEFEF', fontSize: 12 }}
                                            tickFormatter={(value) => `$${value >= 1000 ? (value / 1000) + 'k' : value} -  `}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />

                                        {Number(exactPaybackX) && (
                                            <>
                                                <ReferenceLine
                                                    x={Number(exactPaybackX)}
                                                    stroke="#FFA500"
                                                    strokeDasharray="5 5"
                                                    strokeWidth={2}
                                                    label={(props) => {
                                                        const { viewBox } = props;
                                                        return (
                                                            <Text
                                                                x={viewBox.x - 10}
                                                                y={20}
                                                                fill="#FFA500"
                                                                textAnchor="end"
                                                                verticalAnchor="start"
                                                                style={{ fontSize: '12px', fontWeight: '600'}}
                                                            >
                                                                {t.prop.calculator.graph.legend.payback}
                                                            </Text>
                                                        );
                                                    }}
                                                />
                                                <ReferenceDot
                                                    x={Number(exactPaybackX)}
                                                    y={350}
                                                    r={5}
                                                    shape={(p:any) => <CustomPaybackDot {...p}/>}
                                                />
                                                <ReferenceDot
                                                    x={Number(exactPaybackX)}
                                                    y={Number(paybackBalanceY)}
                                                    r={5}
                                                    shape={(p:any) => <CustomPaybackDot {...p}/>}
                                                />
                                            </>
                                        )}

                                        <Line type="monotone" dataKey="balance" stroke="url(#lineGradient)" strokeWidth={3} dot={false} />
                                        <Line type="monotone" dataKey="profit" stroke="#FFCC00" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="calculate_table_name">{t.prop.calculator.graph.title}</div>
                            <div className="calculate_table_description">
                                {t.prop.calculator.graph.placeholder}
                            </div>
                        </>

                    )}
                </motion.div>
                </div>
        </div>
    );
};

export default CalculatorSection;