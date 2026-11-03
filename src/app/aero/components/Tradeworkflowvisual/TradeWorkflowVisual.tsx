"use client";

import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {motion, useInView, useReducedMotion} from "framer-motion";
import "./trade-workflow-visual.css";

export const TRADE_CHART_HEDGE_DELAY_MS = 4988;

type Vars = CSSProperties & Record<`--${string}`, string>;

const v = (d: number, dur?: number, pd?: number, dx?: number): Vars => {
    const s: Vars = {"--d": `${d}ms`};
    if (dur !== undefined) s["--dur"] = `${dur}ms`;
    if (pd !== undefined) s["--pd"] = `${pd}ms`;
    if (dx !== undefined) s["--dx"] = `${dx}px`;
    return s;
};

const EASE_OUT = [0.2, 0.8, 0.2, 1] as const;

type TradeChartProps = {
    className?: string;
    ariaLabel?: string;
    onStart?: () => void;
};

export const TradeChart = ({className = "", ariaLabel = "Trade workflow chart", onStart}: TradeChartProps) => {
    const ref = useRef<SVGSVGElement>(null);
    const inView = useInView(ref, {once: true, amount: 0.3});

    useEffect(() => {
        if (inView) onStart?.();
    }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <svg
            ref={ref}
            className={`trade_chart${inView ? " is_playing" : ""} ${className}`.trim()}
            viewBox="40 400 1310 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={ariaLabel}
        >
            <g className="tc_candle" style={v(450)}>
                <path d="M70.1269 612.238H60.3492C60.1563 612.238 60 612.395 60 612.587V632.841C60 633.034 60.1563 633.19 60.3492 633.19H70.1269C70.3197 633.19 70.4761 633.034 70.4761 632.841V612.587C70.4761 612.395 70.3197 612.238 70.1269 612.238Z" fill="url(#tcPaint0)" strokeWidth="0.698404" stroke="url(#tcPaint1)"/>
                <path d="M65.2383 601.066V643.669" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M61.0479 632.493V612.938H69.4287" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(476)}>
                <path d="M85.4917 585.004V626.21" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M81.3013 616.429V596.176H89.6821" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M90.3808 595.477H80.6031C80.4102 595.477 80.2539 595.633 80.2539 595.826V616.778C80.2539 616.971 80.4102 617.127 80.6031 617.127H90.3808C90.5736 617.127 90.73 616.971 90.73 616.778V595.826C90.73 595.633 90.5736 595.477 90.3808 595.477Z" fill="url(#tcPaint2)" strokeWidth="0.698404" stroke="url(#tcPaint3)"/>
            </g>
            <g className="tc_candle" style={v(502)}>
                <path d="M105.745 586.398V618.525" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M110.634 595.477H100.857C100.664 595.477 100.507 595.633 100.507 595.826V608.397C100.507 608.59 100.664 608.746 100.857 608.746H110.634C110.827 608.746 110.983 608.59 110.983 608.397V595.826C110.983 595.633 110.827 595.477 110.634 595.477Z" fill="url(#tcPaint4)" strokeWidth="0.698404" stroke="url(#tcPaint5)"/>
                <path d="M101.555 608.049V596.176H109.936" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(528)}>
                <path d="M125.999 586.398V623.414" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M130.888 594.781H121.11C120.918 594.781 120.761 594.938 120.761 595.13V613.289C120.761 613.482 120.918 613.638 121.11 613.638H130.888C131.081 613.638 131.237 613.482 131.237 613.289V595.13C131.237 594.938 131.081 594.781 130.888 594.781Z" fill="url(#tcPaint6)" strokeWidth="0.698404" stroke="url(#tcPaint7)"/>
                <path d="M121.809 612.937V595.477H130.19" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(554)}>
                <path d="M151.84 575.926H142.063C141.87 575.926 141.713 576.082 141.713 576.275V600.719C141.713 600.912 141.87 601.068 142.063 601.068H151.84C152.033 601.068 152.189 600.912 152.189 600.719V576.275C152.189 576.082 152.033 575.926 151.84 575.926Z" fill="url(#tcPaint8)" strokeWidth="0.698404" stroke="url(#tcPaint9)"/>
                <path d="M146.951 566.84V610.141" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M142.761 600.367V576.621H151.142" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(580)}>
                <path d="M172.094 564.746H162.316C162.123 564.746 161.967 564.902 161.967 565.095V581.159C161.967 581.351 162.123 581.508 162.316 581.508H172.094C172.287 581.508 172.443 581.351 172.443 581.159V565.095C172.443 564.902 172.287 564.746 172.094 564.746Z" fill="url(#tcPaint10)" strokeWidth="0.698404" stroke="url(#tcPaint11)"/>
                <path d="M167.205 554.273V591.987" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M163.015 580.814V565.449H171.395" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(606)}>
                <path d="M183.268 580.114V567.543H191.649" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M187.459 557.07V589.895" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M192.348 566.84H182.57C182.377 566.84 182.221 566.996 182.221 567.189V580.459C182.221 580.652 182.377 580.808 182.57 580.808H192.348C192.54 580.808 192.697 580.652 192.697 580.459V567.189C192.697 566.996 192.54 566.84 192.348 566.84Z" fill="url(#tcPaint12)" strokeWidth="0.698404" stroke="url(#tcPaint13)"/>
            </g>
            <g className="tc_candle" style={v(632)}>
                <path d="M212.601 575.926H202.824C202.631 575.926 202.474 576.082 202.474 576.275V597.926C202.474 598.118 202.631 598.275 202.824 598.275H212.601C212.794 598.275 212.95 598.118 212.95 597.926V576.275C212.95 576.082 212.794 575.926 212.601 575.926Z" fill="url(#tcPaint14)" strokeWidth="0.698404" stroke="url(#tcPaint15)"/>
                <path d="M207.712 564.746V608.047" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M203.522 597.573V576.621H211.903" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(658)}>
                <path d="M232.855 584.305H223.077C222.884 584.305 222.728 584.461 222.728 584.654V600.717C222.728 600.91 222.884 601.066 223.077 601.066H232.855C233.048 601.066 233.204 600.91 233.204 600.717V584.654C233.204 584.461 233.048 584.305 232.855 584.305Z" fill="url(#tcPaint16)" strokeWidth="0.698404" stroke="url(#tcPaint17)"/>
                <path d="M227.966 573.824V610.84" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M223.776 600.369V585.004H232.156" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(684)}>
                <path d="M248.918 559.859V600.367" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M253.807 568.941H244.029C243.837 568.941 243.68 569.098 243.68 569.291V590.941C243.68 591.134 243.837 591.29 244.029 591.29H253.807C254 591.29 254.156 591.134 254.156 590.941V569.291C254.156 569.098 254 568.941 253.807 568.941Z" fill="url(#tcPaint18)" strokeWidth="0.698404" stroke="url(#tcPaint19)"/>
                <path d="M244.728 590.585V569.633H253.109" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(710)}>
                <path d="M264.981 577.319V556.367H273.362" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M269.172 547.289V588.495" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M274.061 555.668H264.283C264.09 555.668 263.934 555.824 263.934 556.017V577.668C263.934 577.861 264.09 578.017 264.283 578.017H274.061C274.254 578.017 274.41 577.861 274.41 577.668V556.017C274.41 555.824 274.254 555.668 274.061 555.668Z" fill="url(#tcPaint20)" strokeWidth="0.698404" stroke="url(#tcPaint21)"/>
            </g>
            <g className="tc_candle" style={v(736)}>
                <path d="M292.219 531.223V572.428" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M297.108 540.305H287.33C287.138 540.305 286.981 540.461 286.981 540.654V563.003C286.981 563.196 287.138 563.352 287.33 563.352H297.108C297.301 563.352 297.457 563.196 297.457 563.003V540.654C297.457 540.461 297.301 540.305 297.108 540.305Z" fill="url(#tcPaint22)" strokeWidth="0.698404" stroke="url(#tcPaint23)"/>
                <path d="M288.029 562.654V541.004H296.41" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(762)}>
                <path d="M308.282 563.352V550.082H316.663" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M312.473 538.906V573.826" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M317.362 549.383H307.584C307.391 549.383 307.235 549.539 307.235 549.732V563.7C307.235 563.893 307.391 564.049 307.584 564.049H317.362C317.555 564.049 317.711 563.893 317.711 563.7V549.732C317.711 549.539 317.555 549.383 317.362 549.383Z" fill="url(#tcPaint24)" strokeWidth="0.698404" stroke="url(#tcPaint25)"/>
            </g>
            <g className="tc_candle" style={v(788)}>
                <path d="M328.536 561.254V547.984H336.917" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M332.727 537.512V571.734" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M337.616 547.289H327.838C327.645 547.289 327.489 547.445 327.489 547.638V561.606C327.489 561.799 327.645 561.956 327.838 561.956H337.616C337.808 561.956 337.965 561.799 337.965 561.606V547.638C337.965 547.445 337.808 547.289 337.616 547.289Z" fill="url(#tcPaint26)" strokeWidth="0.698404" stroke="url(#tcPaint27)"/>
            </g>
            <g className="tc_candle" style={v(814)}>
                <path d="M349.488 554.966V536.109H357.869" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M353.679 524.238V564.746" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M358.568 535.418H348.79C348.597 535.418 348.441 535.574 348.441 535.767V555.322C348.441 555.515 348.597 555.672 348.79 555.672H358.568C358.761 555.672 358.917 555.515 358.917 555.322V535.767C358.917 535.574 358.761 535.418 358.568 535.418Z" fill="url(#tcPaint28)" strokeWidth="0.698404" stroke="url(#tcPaint29)"/>
            </g>
            <g className="tc_candle" style={v(866)}>
                <path d="M392.091 536.109V582.204" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M396.98 546.594H387.202C387.009 546.594 386.853 546.75 386.853 546.943V571.387C386.853 571.58 387.009 571.736 387.202 571.736H396.98C397.173 571.736 397.329 571.58 397.329 571.387V546.943C397.329 546.75 397.173 546.594 396.98 546.594Z" fill="url(#tcPaint30)" strokeWidth="0.698404" stroke="url(#tcPaint31)"/>
                <path d="M387.901 571.035V547.289H396.282" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(892)}>
                <path d="M408.154 578.717V567.543H416.535" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M412.345 557.762V588.491" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M417.234 566.84H407.456C407.263 566.84 407.107 566.996 407.107 567.189V579.062C407.107 579.255 407.263 579.411 407.456 579.411H417.234C417.427 579.411 417.583 579.255 417.583 579.062V567.189C417.583 566.996 417.427 566.84 417.234 566.84Z" fill="url(#tcPaint32)" strokeWidth="0.698404" stroke="url(#tcPaint33)"/>
            </g>
            <g className="tc_candle" style={v(918)}>
                <path d="M432.598 569.629V612.93" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M428.408 602.457V578.711H436.789" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M437.487 578.016H427.71C427.517 578.016 427.361 578.172 427.361 578.365V602.809C427.361 603.002 427.517 603.158 427.71 603.158H437.487C437.68 603.158 437.837 603.002 437.837 602.809V578.365C437.837 578.172 437.68 578.016 437.487 578.016Z" fill="url(#tcPaint34)" strokeWidth="0.698404" stroke="url(#tcPaint35)"/>
            </g>
            <g className="tc_candle" style={v(944)}>
                <path d="M452.852 585.699V624.81" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M457.741 594.781H447.963C447.771 594.781 447.614 594.938 447.614 595.13V614.686C447.614 614.879 447.771 615.035 447.963 615.035H457.741C457.934 615.035 458.09 614.879 458.09 614.686V595.13C458.09 594.938 457.934 594.781 457.741 594.781Z" fill="url(#tcPaint36)" strokeWidth="0.698404" stroke="url(#tcPaint37)"/>
                <path d="M448.662 614.333V595.477H457.043" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(970)}>
                <path d="M468.915 601.063V588.492H477.296" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M473.106 577.32V610.844" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M477.995 587.797H468.217C468.024 587.797 467.868 587.953 467.868 588.146V601.416C467.868 601.609 468.024 601.765 468.217 601.765H477.995C478.187 601.765 478.344 601.609 478.344 601.416V588.146C478.344 587.953 478.187 587.797 477.995 587.797Z" fill="url(#tcPaint38)" strokeWidth="0.698404" stroke="url(#tcPaint39)"/>
            </g>
            <g className="tc_candle" style={v(996)}>
                <path d="M498.248 592.68H488.471C488.278 592.68 488.121 592.836 488.121 593.029V602.807C488.121 602.999 488.278 603.156 488.471 603.156H498.248C498.441 603.156 498.597 602.999 498.597 602.807V593.029C498.597 592.836 498.441 592.68 498.248 592.68Z" fill="url(#tcPaint40)" strokeWidth="0.698404" stroke="url(#tcPaint41)"/>
                <path d="M493.359 582.91V613.64" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M489.169 602.462V593.383H497.55" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1022)}>
                <path d="M510.121 593.38V580.809H518.502" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M519.201 580.117H509.423C509.23 580.117 509.074 580.274 509.074 580.466V593.736C509.074 593.929 509.23 594.085 509.423 594.085H519.201C519.393 594.085 519.55 593.929 519.55 593.736V580.466C519.55 580.274 519.393 580.117 519.201 580.117Z" fill="url(#tcPaint42)" strokeWidth="0.698404" stroke="url(#tcPaint43)"/>
                <path d="M514.312 568.941V603.163" strokeWidth="1.39681" stroke="#609DE0"/>
            </g>
            <g className="tc_candle" style={v(1048)}>
                <path d="M534.565 576.621V611.541" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M539.454 587.098H529.676C529.483 587.098 529.327 587.254 529.327 587.447V601.415C529.327 601.608 529.483 601.764 529.676 601.764H539.454C539.647 601.764 539.803 601.608 539.803 601.415V587.447C539.803 587.254 539.647 587.098 539.454 587.098Z" fill="url(#tcPaint44)" strokeWidth="0.698404" stroke="url(#tcPaint45)"/>
                <path d="M530.375 601.067V587.797H538.756" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1074)}>
                <path d="M554.819 590.59V626.208" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M559.708 599.672H549.93C549.737 599.672 549.581 599.828 549.581 600.021V616.084C549.581 616.277 549.737 616.434 549.93 616.434H559.708C559.901 616.434 560.057 616.277 560.057 616.084V600.021C560.057 599.828 559.901 599.672 559.708 599.672Z" fill="url(#tcPaint46)" strokeWidth="0.698404" stroke="url(#tcPaint47)"/>
                <path d="M550.629 615.732V600.367H559.01" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1100)}>
                <path d="M575.771 603.164V638.084" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M580.66 611.539H570.882C570.689 611.539 570.533 611.695 570.533 611.888V628.65C570.533 628.843 570.689 628.999 570.882 628.999H580.66C580.853 628.999 581.009 628.843 581.009 628.65V611.888C581.009 611.695 580.853 611.539 580.66 611.539Z" fill="url(#tcPaint48)" strokeWidth="0.698404" stroke="url(#tcPaint49)"/>
                <path d="M571.581 628.302V612.238H579.961" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1126)}>
                <path d="M600.914 611.539H591.136C590.943 611.539 590.787 611.695 590.787 611.888V631.444C590.787 631.636 590.943 631.793 591.136 631.793H600.914C601.107 631.793 601.263 631.636 601.263 631.444V611.888C601.263 611.695 601.107 611.539 600.914 611.539Z" fill="url(#tcPaint50)" strokeWidth="0.698404" stroke="url(#tcPaint51)"/>
                <path d="M596.025 602.461V642.27" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M591.835 631.095V612.238H600.216" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1152)}>
                <path d="M623.263 594.082H613.485C613.292 594.082 613.136 594.238 613.136 594.431V614.685C613.136 614.878 613.292 615.034 613.485 615.034H623.263C623.456 615.034 623.612 614.878 623.612 614.685V594.431C623.612 594.238 623.456 594.082 623.263 594.082Z" fill="url(#tcPaint52)" strokeWidth="0.698404" stroke="url(#tcPaint53)"/>
                <path d="M618.374 583.605V624.113" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M614.184 614.337V594.781H622.564" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1178)}>
                <path d="M638.628 578.02V616.432" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M634.438 605.952V588.492H642.818" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M643.517 587.797H633.739C633.546 587.797 633.39 587.953 633.39 588.146V606.305C633.39 606.497 633.546 606.654 633.739 606.654H643.517C643.709 606.654 643.866 606.497 643.866 606.305V588.146C643.866 587.953 643.709 587.797 643.517 587.797Z" fill="url(#tcPaint54)" strokeWidth="0.698404" stroke="url(#tcPaint55)"/>
            </g>
            <g className="tc_candle" style={v(1204)}>
                <path d="M665.865 573.824H656.087C655.895 573.824 655.738 573.981 655.738 574.173V593.729C655.738 593.922 655.895 594.078 656.087 594.078H665.865C666.058 594.078 666.214 593.922 666.214 593.729V574.173C666.214 573.981 666.058 573.824 665.865 573.824Z" fill="url(#tcPaint56)" strokeWidth="0.698404" stroke="url(#tcPaint57)"/>
                <path d="M656.786 593.384V574.527H665.167" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M660.977 562.652V603.858" strokeWidth="1.39681" stroke="#609DE0"/>
            </g>
            <g className="tc_candle" style={v(1230)}>
                <path d="M681.23 566.145V595.477" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M686.119 576.621H676.342C676.149 576.621 675.992 576.777 675.992 576.97V586.05C675.992 586.242 676.149 586.399 676.342 586.399H686.119C686.312 586.399 686.468 586.242 686.468 586.05V576.97C686.468 576.777 686.312 576.621 686.119 576.621Z" fill="url(#tcPaint58)" strokeWidth="0.698404" stroke="url(#tcPaint59)"/>
                <path d="M677.04 585.701V577.32H685.421" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1256)}>
                <path d="M707.071 581.512H697.294C697.101 581.512 696.944 581.668 696.944 581.861V593.734C696.944 593.927 697.101 594.083 697.294 594.083H707.071C707.264 594.083 707.42 593.927 707.42 593.734V581.861C707.42 581.668 707.264 581.512 707.071 581.512Z" fill="url(#tcPaint60)" strokeWidth="0.698404" stroke="url(#tcPaint61)"/>
                <path d="M697.992 593.381V582.207H706.373" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M702.183 572.43V604.556" strokeWidth="1.39681" stroke="#609DE0"/>
            </g>
            <g className="tc_candle" style={v(1282)}>
                <path d="M722.436 582.207V622.016" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M718.246 612.237V591.285H726.626" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M727.325 590.59H717.547C717.355 590.59 717.198 590.746 717.198 590.939V612.59C717.198 612.782 717.355 612.939 717.547 612.939H727.325C727.518 612.939 727.674 612.782 727.674 612.59V590.939C727.674 590.746 727.518 590.59 727.325 590.59Z" fill="url(#tcPaint62)" strokeWidth="0.698404" stroke="url(#tcPaint63)"/>
            </g>
            <g className="tc_candle" style={v(1308)}>
                <path d="M747.578 598.27H737.801C737.608 598.27 737.451 598.426 737.451 598.619V611.888C737.451 612.081 737.608 612.238 737.801 612.238H747.578C747.771 612.238 747.927 612.081 747.927 611.888V598.619C747.927 598.426 747.771 598.27 747.578 598.27Z" fill="url(#tcPaint64)" strokeWidth="0.698404" stroke="url(#tcPaint65)"/>
                <path d="M738.499 611.544V598.973H746.88" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M742.69 589.191V622.016" strokeWidth="1.39681" stroke="#609DE0"/>
            </g>
            <g className="tc_candle" style={v(1334)}>
                <path d="M758.753 601.067V585.004H767.134" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M762.944 573.824V611.538" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M767.832 584.305H758.055C757.862 584.305 757.706 584.461 757.706 584.654V601.416C757.706 601.608 757.862 601.765 758.055 601.765H767.832C768.025 601.765 768.182 601.608 768.182 601.416V584.654C768.182 584.461 768.025 584.305 767.832 584.305Z" fill="url(#tcPaint66)" strokeWidth="0.698404" stroke="url(#tcPaint67)"/>
            </g>
            <g className="tc_candle" style={v(1360)}>
                <path d="M783.197 564.746V603.158" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M788.086 574.527H778.309C778.116 574.527 777.959 574.684 777.959 574.877V593.733C777.959 593.926 778.116 594.083 778.309 594.083H788.086C788.279 594.083 788.436 593.926 788.436 593.733V574.877C788.436 574.684 788.279 574.527 788.086 574.527Z" fill="url(#tcPaint68)" strokeWidth="0.698404" stroke="url(#tcPaint69)"/>
                <path d="M779.007 593.381V575.223H787.388" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1412)}>
                <path d="M825.8 568.941V611.544" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M830.689 580.117H820.911C820.718 580.117 820.562 580.274 820.562 580.466V600.72C820.562 600.913 820.718 601.069 820.911 601.069H830.689C830.882 601.069 831.038 600.913 831.038 600.72V580.466C831.038 580.274 830.882 580.117 830.689 580.117Z" fill="url(#tcPaint70)" strokeWidth="0.698404" stroke="url(#tcPaint71)"/>
                <path d="M821.61 600.364V580.809H829.991" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1438)}>
                <path d="M853.735 594.082H843.958C843.765 594.082 843.608 594.238 843.608 594.431V614.685C843.608 614.878 843.765 615.034 843.958 615.034H853.735C853.928 615.034 854.084 614.878 854.084 614.685V594.431C854.084 594.238 853.928 594.082 853.735 594.082Z" fill="url(#tcPaint72)" strokeWidth="0.698404" stroke="url(#tcPaint73)"/>
                <path d="M844.656 614.337V594.781H853.037" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M848.847 583.605V624.113" strokeWidth="1.39681" stroke="#609DE0"/>
            </g>
            <g className="tc_candle" style={v(1464)}>
                <path d="M876.784 575.926H867.006C866.813 575.926 866.657 576.082 866.657 576.275V601.418C866.657 601.61 866.813 601.767 867.006 601.767H876.784C876.976 601.767 877.133 601.61 877.133 601.418V576.275C877.133 576.082 876.976 575.926 876.784 575.926Z" fill="url(#tcPaint74)" strokeWidth="0.698404" stroke="url(#tcPaint75)"/>
                <path d="M871.895 566.84V611.538" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M867.705 601.065V576.621H876.085" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1490)}>
                <path d="M900.529 571.035H890.752C890.559 571.035 890.402 571.191 890.402 571.384V586.749C890.402 586.942 890.559 587.098 890.752 587.098H900.529C900.722 587.098 900.878 586.942 900.878 586.749V571.384C900.878 571.191 900.722 571.035 900.529 571.035Z" fill="url(#tcPaint76)" strokeWidth="0.698404" stroke="url(#tcPaint77)"/>
                <path d="M891.45 586.397V571.73H899.831" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M895.641 562.652V596.874" strokeWidth="1.39681" stroke="#609DE0"/>
            </g>
            <g className="tc_candle" style={v(1516)}>
                <path d="M919.386 552.176V587.794" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M924.275 561.258H914.497C914.304 561.258 914.148 561.414 914.148 561.607V578.369C914.148 578.562 914.304 578.718 914.497 578.718H924.275C924.468 578.718 924.624 578.562 924.624 578.369V561.607C924.624 561.414 924.468 561.258 924.275 561.258Z" fill="url(#tcPaint78)" strokeWidth="0.698404" stroke="url(#tcPaint79)"/>
                <path d="M915.196 578.016V561.953H923.577" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1542)}>
                <path d="M944.529 564.746H934.751C934.558 564.746 934.402 564.902 934.402 565.095V586.746C934.402 586.939 934.558 587.095 934.751 587.095H944.529C944.722 587.095 944.878 586.939 944.878 586.746V565.095C944.878 564.902 944.722 564.746 944.529 564.746Z" fill="url(#tcPaint80)" strokeWidth="0.698404" stroke="url(#tcPaint81)"/>
                <path d="M939.64 554.273V597.574" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M935.45 586.401V565.449H943.831" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1568)}>
                <path d="M955.703 567.546V546.594H964.084" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M959.894 536.109V577.315" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M964.783 545.891H955.005C954.812 545.891 954.656 546.047 954.656 546.24V567.89C954.656 568.083 954.812 568.24 955.005 568.24H964.783C964.975 568.24 965.132 568.083 965.132 567.89V546.24C965.132 546.047 964.975 545.891 964.783 545.891Z" fill="url(#tcPaint82)" strokeWidth="0.698404" stroke="url(#tcPaint83)"/>
            </g>
            <g className="tc_candle" style={v(1594)}>
                <path d="M985.734 539.605H975.957C975.764 539.605 975.607 539.762 975.607 539.955V551.828C975.607 552.02 975.764 552.177 975.957 552.177H985.734C985.927 552.177 986.083 552.02 986.083 551.828V539.955C986.083 539.762 985.927 539.605 985.734 539.605Z" fill="url(#tcPaint84)" strokeWidth="0.698404" stroke="url(#tcPaint85)"/>
                <path d="M976.655 551.479V540.305H985.036" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M980.846 528.434V561.957" strokeWidth="1.39681" stroke="#609DE0"/>
            </g>
            <g className="tc_candle" style={v(1750)}>
                <path d="M1085.24 562.43V595.953" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1090.13 573.602H1080.35C1080.16 573.602 1080 573.758 1080 573.951V585.824C1080 586.016 1080.16 586.173 1080.35 586.173H1090.13C1090.32 586.173 1090.48 586.016 1090.48 585.824V573.951C1090.48 573.758 1090.32 573.602 1090.13 573.602Z" fill="url(#tcPaint86)" strokeWidth="0.698404" stroke="url(#tcPaint87)"/>
                <path d="M1081.05 585.475V574.301H1089.43" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1620)}>
                <path d="M1003.19 539.605H993.417C993.224 539.605 993.068 539.762 993.068 539.955V552.526C993.068 552.719 993.224 552.875 993.417 552.875H1003.19C1003.39 552.875 1003.54 552.719 1003.54 552.526V539.955C1003.54 539.762 1003.39 539.605 1003.19 539.605Z" fill="url(#tcPaint88)" strokeWidth="0.698404" stroke="url(#tcPaint89)"/>
                <path d="M998.306 529.125V562.648" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M994.116 552.178V540.305H1002.5" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1776)}>
                <path d="M1093.29 504.684V485.129H1101.67" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M1102.7 563.121V596.644" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1107.59 573.602H1097.81C1097.62 573.602 1097.46 573.758 1097.46 573.951V586.522C1097.46 586.715 1097.62 586.871 1097.81 586.871H1107.59C1107.78 586.871 1107.94 586.715 1107.94 586.522V573.951C1107.94 573.758 1107.78 573.602 1107.59 573.602Z" fill="url(#tcPaint90)" strokeWidth="0.698404" stroke="url(#tcPaint91)"/>
                <path d="M1098.51 586.174V574.301H1106.89" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1646)}>
                <path d="M1015.07 521.449V561.957" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1019.96 530.527H1010.18C1009.99 530.527 1009.83 530.684 1009.83 530.877V552.527C1009.83 552.72 1009.99 552.876 1010.18 552.876H1019.96C1020.15 552.876 1020.31 552.72 1020.31 552.527V530.877C1020.31 530.684 1020.15 530.527 1019.96 530.527Z" fill="url(#tcPaint92)" strokeWidth="0.698404" stroke="url(#tcPaint93)"/>
                <path d="M1010.88 552.175V531.223H1019.26" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1672)}>
                <path d="M1032.32 494.207V544.492" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1037.21 502.59H1027.43C1027.24 502.59 1027.08 502.746 1027.08 502.939V533.669C1027.08 533.862 1027.24 534.018 1027.43 534.018H1037.21C1037.4 534.018 1037.56 533.862 1037.56 533.669V502.939C1037.56 502.746 1037.4 502.59 1037.21 502.59Z" fill="url(#tcPaint94)" strokeWidth="0.698404" stroke="url(#tcPaint95)"/>
                <path d="M1028.13 533.32V503.289H1036.51" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1698)}>
                <path d="M1046.08 553.064V534.207H1054.46" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M1050.27 524.43V562.842" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1055.16 533.508H1045.38C1045.19 533.508 1045.04 533.664 1045.04 533.857V553.412C1045.04 553.605 1045.19 553.762 1045.38 553.762H1055.16C1055.35 553.762 1055.51 553.605 1055.51 553.412V533.857C1055.51 533.664 1055.35 533.508 1055.16 533.508Z" fill="url(#tcPaint96)" strokeWidth="0.698404" stroke="url(#tcPaint97)"/>
            </g>
            <g className="tc_candle" style={v(1724)}>
                <path d="M1070.24 545.43V583.842" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1075.13 554.508H1065.35C1065.16 554.508 1065 554.664 1065 554.857V574.412C1065 574.605 1065.16 574.762 1065.35 574.762H1075.13C1075.32 574.762 1075.48 574.605 1075.48 574.412V554.857C1075.48 554.664 1075.32 554.508 1075.13 554.508Z" fill="url(#tcPaint98)" strokeWidth="0.698404" stroke="url(#tcPaint99)"/>
                <path d="M1066.05 574.064V555.207H1074.43" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1802)}>
                <path d="M1117.24 543.59V583.399" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1122.13 553.371H1112.35C1112.16 553.371 1112 553.527 1112 553.72V573.276C1112 573.468 1112.16 573.625 1112.35 573.625H1122.13C1122.32 573.625 1122.48 573.468 1122.48 573.276V553.72C1122.48 553.527 1122.32 553.371 1122.13 553.371Z" fill="url(#tcPaint100)" strokeWidth="0.698404" stroke="url(#tcPaint101)"/>
                <path d="M1113.05 572.923V554.066H1121.43" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1828)}>
                <path d="M1138.19 529.621V570.129" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1143.08 540.797H1133.3C1133.11 540.797 1132.95 540.953 1132.95 541.146V560.701C1132.95 560.894 1133.11 561.051 1133.3 561.051H1143.08C1143.27 561.051 1143.43 560.894 1143.43 560.701V541.146C1143.43 540.953 1143.27 540.797 1143.08 540.797Z" fill="url(#tcPaint102)" strokeWidth="0.698404" stroke="url(#tcPaint103)"/>
                <path d="M1134 560.353V541.496H1142.38" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1854)}>
                <path d="M1154.95 553.367V526.828H1163.33" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M1159.14 515.652V564.541" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1164.03 526.133H1154.25C1154.06 526.133 1153.91 526.289 1153.91 526.482V553.72C1153.91 553.913 1154.06 554.069 1154.25 554.069H1164.03C1164.22 554.069 1164.38 553.913 1164.38 553.72V526.482C1164.38 526.289 1164.22 526.133 1164.03 526.133Z" fill="url(#tcPaint104)" strokeWidth="0.698404" stroke="url(#tcPaint105)"/>
            </g>
            <g className="tc_candle" style={v(1880)}>
                <path d="M1180.09 512.863V551.974" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1175.9 542.192V522.637H1184.28" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M1184.98 521.941H1175.21C1175.01 521.941 1174.86 522.098 1174.86 522.291V542.544C1174.86 542.737 1175.01 542.894 1175.21 542.894H1184.98C1185.18 542.894 1185.33 542.737 1185.33 542.544V522.291C1185.33 522.098 1185.18 521.941 1184.98 521.941Z" fill="url(#tcPaint106)" strokeWidth="0.698404" stroke="url(#tcPaint107)"/>
            </g>
            <g className="tc_candle" style={v(1906)}>
                <path d="M1205.94 505.879H1196.16C1195.96 505.879 1195.81 506.035 1195.81 506.228V525.783C1195.81 525.976 1195.96 526.133 1196.16 526.133H1205.94C1206.13 526.133 1206.28 525.976 1206.28 525.783V506.228C1206.28 506.035 1206.13 505.879 1205.94 505.879Z" fill="url(#tcPaint108)" strokeWidth="0.698404" stroke="url(#tcPaint109)"/>
                <path d="M1196.86 525.431V506.574H1205.24" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M1201.05 497.496V535.908" strokeWidth="1.39681" stroke="#609DE0"/>
            </g>
            <g className="tc_candle" style={v(1932)}>
                <path d="M1220.6 504.48V540.099" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1225.49 513.559H1215.71C1215.52 513.559 1215.36 513.715 1215.36 513.908V529.971C1215.36 530.164 1215.52 530.32 1215.71 530.32H1225.49C1225.68 530.32 1225.84 530.164 1225.84 529.971V513.908C1225.84 513.715 1225.68 513.559 1225.49 513.559Z" fill="url(#tcPaint110)" strokeWidth="0.698404" stroke="url(#tcPaint111)"/>
                <path d="M1216.41 529.627V514.262H1224.79" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(1958)}>
                <path d="M1235.97 525.434V502.387H1244.35" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M1240.16 491.211V535.21" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1245.05 501.688H1235.27C1235.08 501.688 1234.92 501.844 1234.92 502.037V525.782C1234.92 525.975 1235.08 526.132 1235.27 526.132H1245.05C1245.24 526.132 1245.4 525.975 1245.4 525.782V502.037C1245.4 501.844 1245.24 501.688 1245.05 501.688Z" fill="url(#tcPaint112)" strokeWidth="0.698404" stroke="url(#tcPaint113)"/>
            </g>
            <g className="tc_candle" style={v(1984)}>
                <path d="M1256.22 514.258V494.703H1264.6" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M1260.41 484.227V525.432" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1265.3 494.004H1255.52C1255.33 494.004 1255.17 494.16 1255.17 494.353V514.607C1255.17 514.8 1255.33 514.956 1255.52 514.956H1265.3C1265.49 514.956 1265.65 514.8 1265.65 514.607V494.353C1265.65 494.16 1265.49 494.004 1265.3 494.004Z" fill="url(#tcPaint114)" strokeWidth="0.698404" stroke="url(#tcPaint115)"/>
            </g>
            <g className="tc_candle" style={v(2010)}>
                <path d="M1281.36 462.574V511.463" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1286.25 473.754H1276.47C1276.28 473.754 1276.12 473.91 1276.12 474.103V502.039C1276.12 502.232 1276.28 502.388 1276.47 502.388H1286.25C1286.44 502.388 1286.6 502.232 1286.6 502.039V474.103C1286.6 473.91 1286.44 473.754 1286.25 473.754Z" fill="url(#tcPaint116)" strokeWidth="0.698404" stroke="url(#tcPaint117)"/>
                <path d="M1277.17 501.683V474.445H1285.55" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(2036)}>
                <path d="M1307.2 469.562H1297.43C1297.23 469.562 1297.08 469.719 1297.08 469.912V487.372C1297.08 487.565 1297.23 487.721 1297.43 487.721H1307.2C1307.4 487.721 1307.55 487.565 1307.55 487.372V469.912C1307.55 469.719 1307.4 469.562 1307.2 469.562Z" fill="url(#tcPaint118)" strokeWidth="0.698404" stroke="url(#tcPaint119)"/>
                <path d="M1302.32 459.082V497.494" strokeWidth="1.39681" stroke="#609DE0"/>
                <path d="M1298.13 487.02V470.258H1306.51" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
            </g>
            <g className="tc_candle" style={v(2062)}>
                <path d="M1328.16 446.512H1318.38C1318.19 446.512 1318.03 446.668 1318.03 446.861V474.797C1318.03 474.99 1318.19 475.146 1318.38 475.146H1328.16C1328.35 475.146 1328.5 474.99 1328.5 474.797V446.861C1328.5 446.668 1328.35 446.512 1328.16 446.512Z" fill="url(#tcPaint120)" strokeWidth="0.698404" stroke="url(#tcPaint121)"/>
                <path d="M1319.08 474.449V447.211H1327.46" strokeWidth="0.488883" stroke="white" strokeOpacity="0.28"/>
                <path d="M1323.27 437.43V484.921" strokeWidth="1.39681" stroke="#609DE0"/>
            </g>
            <g className="tc_candle" style={v(840)}>
                <path d="M378.472 529.125H367.996V550.077H378.472V529.125Z" fill="url(#tcPaint122)" strokeWidth="0.698404" stroke="url(#tcPaint123)"/>
                <path d="M373.234 519.352V559.859" strokeWidth="1.39681" stroke="#609DE0"/>
            </g>
            <g className="tc_candle" style={v(1386)}>
                <path d="M809.387 564.055H798.911V585.705H809.387V564.055Z" fill="url(#tcPaint124)" strokeWidth="0.698404" stroke="url(#tcPaint125)"/>
                <path d="M804.15 554.273V595.479" strokeWidth="1.39681" stroke="#609DE0"/>
            </g>
            <circle cx="1009.5" cy="538.93" r="13.5" fill="#1F7BFF" fillOpacity="0.5" className="tc_halo tc_halo--main" style={v(2438,undefined,3138)}/>
            <circle cx="1009.5" cy="538.93" r="10.5" fill="#015DFF" fillOpacity="0.5" className="tc_halo" style={v(2508)}/>
            <circle cx="1009.5" cy="538.93" r="6.5" fill="#015DFF" className="tc_halo" style={v(2578)}/>
            <circle cx="1086.5" cy="574.93" r="13.5" fill="#1F7BFF" fillOpacity="0.5" className="tc_halo tc_halo--main" style={v(3188,undefined,3888)}/>
            <circle cx="1086.5" cy="574.93" r="10.5" fill="#015DFF" fillOpacity="0.5" className="tc_halo" style={v(3258)}/>
            <circle cx="1086.5" cy="574.93" r="6.5" fill="#015DFF" className="tc_halo" style={v(3328)}/>
            <circle cx="594.5" cy="616.93" r="13.5" fill="#1F7BFF" fillOpacity="0.5" className="tc_halo tc_halo--main" style={v(3938,undefined,4638)}/>
            <circle cx="594.5" cy="616.93" r="10.5" fill="#015DFF" fillOpacity="0.5" className="tc_halo" style={v(4008)}/>
            <circle cx="594.5" cy="616.93" r="6.5" fill="#015DFF" className="tc_halo" style={v(4078)}/>
            <path d="M1009.5 535.43L1009.5 531.83M1009.5 463.43L1009.5 467.03M1009.5 524.63L1009.5 517.43M1009.5 510.23L1009.5 503.03M1009.5 495.83L1009.5 488.63M1009.5 481.43L1009.5 474.23" strokeWidth="3" stroke="#015DFF" className="tc_stem" style={v(2658)}/>
            <path d="M1011 539.93H1006.98M368 539.93H372.019M998.944 539.93H990.906M982.869 539.93H974.831M966.794 539.93H958.756M950.719 539.93H942.681M934.644 539.93H926.606M918.569 539.93H910.531M902.494 539.93H894.456M886.419 539.93H878.381M870.344 539.93H862.306M854.269 539.93H846.231M838.194 539.93H830.156M822.119 539.93H814.081M806.044 539.93H798.006M789.969 539.93H781.931M773.894 539.93H765.856M757.819 539.93H749.781M741.744 539.93H733.706M725.669 539.93H717.631M709.594 539.93H701.556M693.519 539.93H685.481M677.444 539.93H669.406M661.369 539.93H653.331M645.294 539.93H637.256M629.219 539.93H621.181M613.144 539.93H605.106M597.069 539.93H589.031M580.994 539.93H572.956M564.919 539.93H556.881M548.844 539.93L540.806 539.93M532.768 539.93H524.731M516.693 539.93H508.656M500.618 539.93H492.581M484.544 539.93H476.506M468.469 539.93H460.431M452.394 539.93H444.356M436.319 539.93H428.281M420.244 539.93H412.206M404.169 539.93H396.131M388.094 539.93H380.056" strokeWidth="3" stroke="#015DFF" strokeOpacity="0.24" className="tc_level" style={v(1040,806)}/>
            <path d="M1086.5 574.43L1086.5 570.08M1086.5 487.43L1086.5 491.78M1086.5 561.38L1086.5 552.68M1086.5 543.98L1086.5 535.28M1086.5 526.58L1086.5 517.88M1086.5 509.18L1086.5 500.48" strokeWidth="3" stroke="#015DFF" className="tc_stem" style={v(3408)}/>
            <path d="M594.5 604.43L594.5 600.38M594.5 523.43L594.5 527.48M594.5 592.28L594.5 584.18M594.5 576.08L594.5 567.98M594.5 559.88L594.5 551.78M594.5 543.68L594.5 535.58" strokeWidth="3" stroke="#015DFF" className="tc_stem" style={v(4158)}/>
            <path d="M902.585 446.43V433.339H907.162C908.074 433.339 908.826 433.496 909.418 433.812C910.011 434.123 910.452 434.543 910.741 435.071C911.031 435.595 911.176 436.177 911.176 436.816C911.176 437.379 911.076 437.843 910.876 438.21C910.68 438.576 910.42 438.866 910.096 439.079C909.776 439.292 909.429 439.45 909.054 439.552V439.68C909.455 439.705 909.857 439.846 910.262 440.102C910.667 440.357 911.006 440.724 911.278 441.201C911.551 441.678 911.688 442.262 911.688 442.952C911.688 443.609 911.538 444.199 911.24 444.723C910.942 445.247 910.471 445.663 909.827 445.969C909.184 446.276 908.347 446.43 907.315 446.43H902.585ZM904.17 445.023H907.315C908.351 445.023 909.086 444.823 909.521 444.423C909.96 444.018 910.179 443.528 910.179 442.952C910.179 442.509 910.066 442.1 909.84 441.725C909.614 441.346 909.293 441.043 908.875 440.817C908.457 440.587 907.963 440.472 907.392 440.472H904.17V445.023ZM904.17 439.092H907.111C907.588 439.092 908.018 438.998 908.402 438.81C908.79 438.623 909.097 438.359 909.322 438.018C909.553 437.677 909.668 437.276 909.668 436.816C909.668 436.241 909.467 435.753 909.067 435.352C908.666 434.947 908.031 434.745 907.162 434.745H904.17V439.092ZM913.908 446.43V436.612H915.365V438.094H915.467C915.646 437.609 915.97 437.214 916.439 436.912C916.908 436.609 917.436 436.458 918.024 436.458C918.135 436.458 918.273 436.46 918.44 436.464C918.606 436.469 918.732 436.475 918.817 436.484V438.018C918.766 438.005 918.648 437.986 918.465 437.96C918.286 437.93 918.097 437.915 917.896 437.915C917.419 437.915 916.993 438.016 916.618 438.216C916.247 438.412 915.953 438.685 915.736 439.034C915.523 439.379 915.416 439.773 915.416 440.217V446.43H913.908ZM924.243 446.634C923.297 446.634 922.481 446.425 921.794 446.008C921.113 445.586 920.586 444.998 920.216 444.244C919.849 443.485 919.666 442.603 919.666 441.597C919.666 440.592 919.849 439.705 920.216 438.938C920.586 438.167 921.102 437.566 921.763 437.136C922.427 436.701 923.203 436.484 924.089 436.484C924.601 436.484 925.106 436.569 925.604 436.739C926.103 436.91 926.557 437.187 926.966 437.57C927.375 437.95 927.701 438.452 927.944 439.079C928.187 439.705 928.308 440.477 928.308 441.393V442.032H920.74V440.728H926.774C926.774 440.174 926.663 439.68 926.441 439.245C926.224 438.81 925.913 438.467 925.508 438.216C925.108 437.964 924.635 437.839 924.089 437.839C923.488 437.839 922.968 437.988 922.53 438.286C922.095 438.58 921.76 438.964 921.526 439.437C921.292 439.91 921.174 440.417 921.174 440.958V441.827C921.174 442.569 921.302 443.197 921.558 443.713C921.818 444.224 922.178 444.614 922.638 444.883C923.098 445.147 923.633 445.279 924.243 445.279C924.639 445.279 924.997 445.224 925.316 445.113C925.64 444.998 925.919 444.827 926.154 444.602C926.388 444.371 926.569 444.086 926.697 443.745L928.155 444.154C928.001 444.648 927.743 445.083 927.381 445.458C927.019 445.829 926.571 446.119 926.039 446.327C925.506 446.532 924.907 446.634 924.243 446.634ZM933.312 446.66C932.69 446.66 932.125 446.543 931.618 446.308C931.111 446.07 930.708 445.727 930.41 445.279C930.112 444.827 929.962 444.282 929.962 443.643C929.962 443.08 930.073 442.624 930.295 442.275C930.516 441.921 930.813 441.644 931.183 441.444C931.554 441.244 931.963 441.094 932.411 440.996C932.862 440.894 933.316 440.813 933.772 440.754C934.369 440.677 934.852 440.619 935.223 440.581C935.598 440.538 935.871 440.468 936.041 440.37C936.216 440.272 936.303 440.102 936.303 439.859V439.808C936.303 439.177 936.131 438.687 935.786 438.337C935.445 437.988 934.927 437.813 934.232 437.813C933.512 437.813 932.948 437.971 932.538 438.286C932.129 438.602 931.842 438.938 931.676 439.296L930.244 438.785C930.499 438.188 930.84 437.724 931.266 437.391C931.697 437.055 932.166 436.82 932.673 436.688C933.184 436.552 933.687 436.484 934.181 436.484C934.497 436.484 934.859 436.522 935.268 436.599C935.681 436.671 936.08 436.822 936.463 437.053C936.851 437.283 937.173 437.63 937.428 438.094C937.684 438.559 937.812 439.181 937.812 439.961V446.43H936.303V445.1H936.227C936.124 445.313 935.954 445.541 935.715 445.784C935.477 446.027 935.159 446.234 934.763 446.404C934.367 446.575 933.883 446.66 933.312 446.66ZM933.542 445.305C934.139 445.305 934.641 445.188 935.051 444.953C935.464 444.719 935.775 444.416 935.984 444.045C936.197 443.675 936.303 443.285 936.303 442.876V441.495C936.239 441.572 936.099 441.642 935.882 441.706C935.668 441.766 935.421 441.819 935.14 441.866C934.863 441.908 934.592 441.947 934.328 441.981C934.068 442.011 933.857 442.036 933.695 442.058C933.303 442.109 932.937 442.192 932.596 442.307C932.259 442.418 931.987 442.586 931.778 442.812C931.573 443.033 931.471 443.336 931.471 443.719C931.471 444.244 931.665 444.64 932.053 444.908C932.445 445.173 932.941 445.305 933.542 445.305ZM941.792 442.85L941.766 440.984H942.073L946.368 436.612H948.235L943.658 441.239H943.53L941.792 442.85ZM940.385 446.43V433.339H941.894V446.43H940.385ZM946.624 446.43L942.789 441.572L943.863 440.523L948.542 446.43H946.624ZM953.581 446.634C952.694 446.634 951.917 446.423 951.248 446.001C950.583 445.58 950.063 444.989 949.688 444.231C949.317 443.472 949.132 442.586 949.132 441.572C949.132 440.549 949.317 439.656 949.688 438.893C950.063 438.131 950.583 437.538 951.248 437.116C951.917 436.695 952.694 436.484 953.581 436.484C954.467 436.484 955.243 436.695 955.907 437.116C956.576 437.538 957.096 438.131 957.467 438.893C957.842 439.656 958.03 440.549 958.03 441.572C958.03 442.586 957.842 443.472 957.467 444.231C957.096 444.989 956.576 445.58 955.907 446.001C955.243 446.423 954.467 446.634 953.581 446.634ZM953.581 445.279C954.254 445.279 954.808 445.107 955.243 444.761C955.677 444.416 955.999 443.962 956.208 443.4C956.417 442.837 956.521 442.228 956.521 441.572C956.521 440.915 956.417 440.304 956.208 439.737C955.999 439.17 955.677 438.712 955.243 438.363C954.808 438.013 954.254 437.839 953.581 437.839C952.907 437.839 952.353 438.013 951.919 438.363C951.484 438.712 951.162 439.17 950.954 439.737C950.745 440.304 950.64 440.915 950.64 441.572C950.64 442.228 950.745 442.837 950.954 443.4C951.162 443.962 951.484 444.416 951.919 444.761C952.353 445.107 952.907 445.279 953.581 445.279ZM966.34 442.415V436.612H967.848V446.43H966.34V444.768H966.237C966.007 445.266 965.649 445.69 965.164 446.04C964.678 446.385 964.064 446.558 963.323 446.558C962.709 446.558 962.164 446.423 961.686 446.155C961.209 445.882 960.834 445.473 960.561 444.928C960.289 444.378 960.152 443.685 960.152 442.85V436.612H961.661V442.748C961.661 443.464 961.861 444.035 962.262 444.461C962.666 444.887 963.182 445.1 963.808 445.1C964.183 445.1 964.565 445.004 964.953 444.812C965.345 444.621 965.673 444.327 965.937 443.93C966.206 443.534 966.34 443.029 966.34 442.415ZM974.701 436.612V437.89H969.613V436.612H974.701ZM971.096 434.259H972.605V443.617C972.605 444.043 972.666 444.363 972.79 444.576C972.918 444.785 973.08 444.925 973.276 444.998C973.476 445.066 973.687 445.1 973.909 445.1C974.075 445.1 974.211 445.092 974.318 445.075C974.424 445.053 974.509 445.036 974.573 445.023L974.88 446.379C974.778 446.417 974.635 446.455 974.452 446.494C974.269 446.536 974.036 446.558 973.755 446.558C973.329 446.558 972.911 446.466 972.502 446.283C972.097 446.099 971.761 445.82 971.492 445.445C971.228 445.07 971.096 444.597 971.096 444.026V434.259Z" fill="#171717" className="tc_label" style={v(3138,undefined,undefined,10)}/>
            <path d="M1122.59 458.43V445.339H1127.01C1128.03 445.339 1128.87 445.513 1129.53 445.863C1130.18 446.208 1130.67 446.683 1130.98 447.288C1131.3 447.893 1131.46 448.582 1131.46 449.353C1131.46 450.124 1131.3 450.808 1130.98 451.405C1130.67 452.001 1130.19 452.47 1129.53 452.811C1128.88 453.148 1128.05 453.316 1127.03 453.316H1123.45V451.884H1126.98C1127.68 451.884 1128.24 451.782 1128.67 451.577C1129.1 451.373 1129.41 451.083 1129.6 450.708C1129.8 450.329 1129.9 449.877 1129.9 449.353C1129.9 448.829 1129.8 448.371 1129.6 447.979C1129.41 447.587 1129.09 447.284 1128.66 447.071C1128.23 446.854 1127.66 446.745 1126.96 446.745H1124.17V458.43H1122.59ZM1128.75 452.549L1131.97 458.43H1130.13L1126.96 452.549H1128.75ZM1137.73 458.634C1136.78 458.634 1135.96 458.425 1135.28 458.008C1134.6 457.586 1134.07 456.998 1133.7 456.244C1133.33 455.485 1133.15 454.603 1133.15 453.597C1133.15 452.592 1133.33 451.705 1133.7 450.938C1134.07 450.167 1134.58 449.566 1135.25 449.136C1135.91 448.701 1136.69 448.484 1137.57 448.484C1138.08 448.484 1138.59 448.569 1139.09 448.739C1139.59 448.91 1140.04 449.187 1140.45 449.57C1140.86 449.95 1141.18 450.452 1141.43 451.079C1141.67 451.705 1141.79 452.477 1141.79 453.393V454.032H1134.22V452.728H1140.26C1140.26 452.174 1140.15 451.68 1139.92 451.245C1139.71 450.81 1139.4 450.467 1138.99 450.216C1138.59 449.964 1138.12 449.839 1137.57 449.839C1136.97 449.839 1136.45 449.988 1136.01 450.286C1135.58 450.58 1135.24 450.964 1135.01 451.437C1134.77 451.91 1134.66 452.417 1134.66 452.958V453.827C1134.66 454.569 1134.79 455.197 1135.04 455.713C1135.3 456.224 1135.66 456.614 1136.12 456.883C1136.58 457.147 1137.12 457.279 1137.73 457.279C1138.12 457.279 1138.48 457.224 1138.8 457.113C1139.12 456.998 1139.4 456.827 1139.64 456.602C1139.87 456.371 1140.05 456.086 1140.18 455.745L1141.64 456.154C1141.48 456.648 1141.23 457.083 1140.86 457.458C1140.5 457.829 1140.05 458.119 1139.52 458.327C1138.99 458.532 1138.39 458.634 1137.73 458.634ZM1148.18 448.612V449.89H1143.09V448.612H1148.18ZM1144.57 446.259H1146.08V455.617C1146.08 456.043 1146.14 456.363 1146.26 456.576C1146.39 456.785 1146.55 456.925 1146.75 456.998C1146.95 457.066 1147.16 457.1 1147.38 457.1C1147.55 457.1 1147.69 457.092 1147.79 457.075C1147.9 457.053 1147.98 457.036 1148.05 457.023L1148.35 458.379C1148.25 458.417 1148.11 458.455 1147.93 458.494C1147.74 458.536 1147.51 458.558 1147.23 458.558C1146.8 458.558 1146.39 458.466 1145.98 458.283C1145.57 458.099 1145.23 457.82 1144.97 457.445C1144.7 457.07 1144.57 456.597 1144.57 456.026V446.259ZM1154.28 458.634C1153.33 458.634 1152.51 458.425 1151.83 458.008C1151.15 457.586 1150.62 456.998 1150.25 456.244C1149.88 455.485 1149.7 454.603 1149.7 453.597C1149.7 452.592 1149.88 451.705 1150.25 450.938C1150.62 450.167 1151.13 449.566 1151.8 449.136C1152.46 448.701 1153.24 448.484 1154.12 448.484C1154.63 448.484 1155.14 448.569 1155.64 448.739C1156.14 448.91 1156.59 449.187 1157 449.57C1157.41 449.95 1157.73 450.452 1157.98 451.079C1158.22 451.705 1158.34 452.477 1158.34 453.393V454.032H1150.77V452.728H1156.81C1156.81 452.174 1156.7 451.68 1156.47 451.245C1156.26 450.81 1155.95 450.467 1155.54 450.216C1155.14 449.964 1154.67 449.839 1154.12 449.839C1153.52 449.839 1153 449.988 1152.56 450.286C1152.13 450.58 1151.79 450.964 1151.56 451.437C1151.32 451.91 1151.21 452.417 1151.21 452.958V453.827C1151.21 454.569 1151.34 455.197 1151.59 455.713C1151.85 456.224 1152.21 456.614 1152.67 456.883C1153.13 457.147 1153.67 457.279 1154.28 457.279C1154.67 457.279 1155.03 457.224 1155.35 457.113C1155.67 456.998 1155.95 456.827 1156.19 456.602C1156.42 456.371 1156.6 456.086 1156.73 455.745L1158.19 456.154C1158.03 456.648 1157.78 457.083 1157.41 457.458C1157.05 457.829 1156.6 458.119 1156.07 458.327C1155.54 458.532 1154.94 458.634 1154.28 458.634ZM1167.41 450.81L1166.06 451.194C1165.97 450.968 1165.84 450.749 1165.68 450.536C1165.52 450.318 1165.29 450.139 1165.01 449.999C1164.73 449.858 1164.37 449.788 1163.93 449.788C1163.33 449.788 1162.83 449.926 1162.43 450.203C1162.03 450.476 1161.84 450.823 1161.84 451.245C1161.84 451.62 1161.97 451.916 1162.25 452.134C1162.52 452.351 1162.94 452.532 1163.52 452.677L1164.98 453.035C1165.86 453.248 1166.51 453.574 1166.94 454.013C1167.37 454.447 1167.59 455.008 1167.59 455.694C1167.59 456.256 1167.43 456.759 1167.1 457.202C1166.78 457.646 1166.34 457.995 1165.76 458.251C1165.19 458.506 1164.52 458.634 1163.75 458.634C1162.75 458.634 1161.92 458.417 1161.27 457.982C1160.61 457.548 1160.2 456.913 1160.02 456.077L1161.45 455.719C1161.59 456.248 1161.85 456.644 1162.23 456.908C1162.61 457.173 1163.11 457.305 1163.73 457.305C1164.43 457.305 1164.99 457.156 1165.4 456.857C1165.82 456.555 1166.03 456.192 1166.03 455.771C1166.03 455.43 1165.91 455.144 1165.67 454.914C1165.43 454.68 1165.07 454.505 1164.57 454.39L1162.94 454.006C1162.04 453.793 1161.38 453.463 1160.95 453.016C1160.54 452.564 1160.33 451.999 1160.33 451.322C1160.33 450.768 1160.48 450.278 1160.79 449.852C1161.11 449.425 1161.54 449.091 1162.08 448.848C1162.62 448.605 1163.24 448.484 1163.93 448.484C1164.9 448.484 1165.67 448.697 1166.22 449.123C1166.78 449.549 1167.18 450.112 1167.41 450.81ZM1173.95 448.612V449.89H1168.86V448.612H1173.95ZM1170.34 446.259H1171.85V455.617C1171.85 456.043 1171.91 456.363 1172.04 456.576C1172.17 456.785 1172.33 456.925 1172.52 456.998C1172.72 457.066 1172.94 457.1 1173.16 457.1C1173.32 457.1 1173.46 457.092 1173.57 457.075C1173.67 457.053 1173.76 457.036 1173.82 457.023L1174.13 458.379C1174.03 458.417 1173.88 458.455 1173.7 458.494C1173.52 458.536 1173.29 458.558 1173 458.558C1172.58 458.558 1172.16 458.466 1171.75 458.283C1171.35 458.099 1171.01 457.82 1170.74 457.445C1170.48 457.07 1170.34 456.597 1170.34 456.026V446.259Z" fill="#171717" className="tc_label" style={v(3888,undefined,undefined,-10)}/>
            <path d="M1122.92 470.907C1122.92 469.296 1123.13 467.815 1123.54 466.464C1123.97 465.109 1124.57 463.863 1125.35 462.725H1126.68C1126.37 463.147 1126.08 463.667 1125.81 464.285C1125.55 464.898 1125.32 465.574 1125.12 466.311C1124.92 467.044 1124.76 467.803 1124.64 468.587C1124.53 469.371 1124.48 470.144 1124.48 470.907C1124.48 471.921 1124.58 472.95 1124.77 473.994C1124.97 475.038 1125.23 476.008 1125.56 476.903C1125.9 477.798 1126.27 478.526 1126.68 479.089H1125.35C1124.57 477.951 1123.97 476.707 1123.54 475.356C1123.13 474.001 1122.92 472.518 1122.92 470.907ZM1130.23 463.339V476.43H1128.72V463.339H1130.23ZM1132.81 476.43V466.612H1134.32V476.43H1132.81ZM1133.58 464.975C1133.29 464.975 1133.03 464.875 1132.82 464.675C1132.61 464.474 1132.51 464.234 1132.51 463.952C1132.51 463.671 1132.61 463.43 1132.82 463.23C1133.03 463.03 1133.29 462.93 1133.58 462.93C1133.87 462.93 1134.13 463.03 1134.33 463.23C1134.55 463.43 1134.65 463.671 1134.65 463.952C1134.65 464.234 1134.55 464.474 1134.33 464.675C1134.13 464.875 1133.87 464.975 1133.58 464.975ZM1136.91 476.43V466.612H1138.36V468.146H1138.49C1138.69 467.621 1139.03 467.214 1139.48 466.925C1139.94 466.631 1140.48 466.484 1141.12 466.484C1141.77 466.484 1142.31 466.631 1142.74 466.925C1143.18 467.214 1143.51 467.621 1143.76 468.146H1143.86C1144.11 467.638 1144.49 467.236 1144.99 466.938C1145.49 466.635 1146.1 466.484 1146.8 466.484C1147.68 466.484 1148.4 466.759 1148.95 467.308C1149.51 467.854 1149.79 468.704 1149.79 469.859V476.43H1148.28V469.859C1148.28 469.134 1148.08 468.616 1147.69 468.305C1147.29 467.994 1146.83 467.839 1146.29 467.839C1145.6 467.839 1145.06 468.048 1144.68 468.465C1144.3 468.879 1144.12 469.403 1144.12 470.038V476.43H1142.58V469.705C1142.58 469.147 1142.4 468.697 1142.04 468.357C1141.68 468.011 1141.21 467.839 1140.64 467.839C1140.25 467.839 1139.88 467.943 1139.54 468.152C1139.2 468.361 1138.93 468.651 1138.72 469.021C1138.52 469.388 1138.41 469.812 1138.41 470.293V476.43H1136.91ZM1152.37 476.43V466.612H1153.88V476.43H1152.37ZM1153.14 464.975C1152.84 464.975 1152.59 464.875 1152.38 464.675C1152.17 464.474 1152.06 464.234 1152.06 463.952C1152.06 463.671 1152.17 463.43 1152.38 463.23C1152.59 463.03 1152.84 462.93 1153.14 462.93C1153.43 462.93 1153.68 463.03 1153.89 463.23C1154.1 463.43 1154.21 463.671 1154.21 463.952C1154.21 464.234 1154.1 464.474 1153.89 464.675C1153.68 464.875 1153.43 464.975 1153.14 464.975ZM1160.73 466.612V467.89H1155.64V466.612H1160.73ZM1157.13 464.259H1158.63V473.617C1158.63 474.043 1158.7 474.363 1158.82 474.576C1158.95 474.785 1159.11 474.925 1159.31 474.998C1159.51 475.066 1159.72 475.1 1159.94 475.1C1160.1 475.1 1160.24 475.092 1160.35 475.075C1160.45 475.053 1160.54 475.036 1160.6 475.023L1160.91 476.379C1160.81 476.417 1160.66 476.455 1160.48 476.494C1160.3 476.536 1160.07 476.558 1159.79 476.558C1159.36 476.558 1158.94 476.466 1158.53 476.283C1158.13 476.099 1157.79 475.82 1157.52 475.445C1157.26 475.07 1157.13 474.597 1157.13 474.026V464.259ZM1171.69 476.634C1170.8 476.634 1170.03 476.423 1169.36 476.001C1168.69 475.58 1168.17 474.989 1167.8 474.231C1167.43 473.472 1167.24 472.586 1167.24 471.572C1167.24 470.549 1167.43 469.656 1167.8 468.893C1168.17 468.131 1168.69 467.538 1169.36 467.116C1170.03 466.695 1170.8 466.484 1171.69 466.484C1172.58 466.484 1173.35 466.695 1174.02 467.116C1174.69 467.538 1175.21 468.131 1175.58 468.893C1175.95 469.656 1176.14 470.549 1176.14 471.572C1176.14 472.586 1175.95 473.472 1175.58 474.231C1175.21 474.989 1174.69 475.58 1174.02 476.001C1173.35 476.423 1172.58 476.634 1171.69 476.634ZM1171.69 475.279C1172.36 475.279 1172.92 475.107 1173.35 474.761C1173.79 474.416 1174.11 473.962 1174.32 473.4C1174.53 472.837 1174.63 472.228 1174.63 471.572C1174.63 470.915 1174.53 470.304 1174.32 469.737C1174.11 469.17 1173.79 468.712 1173.35 468.363C1172.92 468.013 1172.36 467.839 1171.69 467.839C1171.02 467.839 1170.46 468.013 1170.03 468.363C1169.59 468.712 1169.27 469.17 1169.06 469.737C1168.86 470.304 1168.75 470.915 1168.75 471.572C1168.75 472.228 1168.86 472.837 1169.06 473.4C1169.27 473.962 1169.59 474.416 1170.03 474.761C1170.46 475.107 1171.02 475.279 1171.69 475.279ZM1178.26 476.43V466.612H1179.72V468.094H1179.82C1180 467.609 1180.33 467.214 1180.79 466.912C1181.26 466.609 1181.79 466.458 1182.38 466.458C1182.49 466.458 1182.63 466.46 1182.79 466.464C1182.96 466.469 1183.09 466.475 1183.17 466.484V468.018C1183.12 468.005 1183 467.986 1182.82 467.96C1182.64 467.93 1182.45 467.915 1182.25 467.915C1181.77 467.915 1181.35 468.016 1180.97 468.216C1180.6 468.412 1180.31 468.685 1180.09 469.034C1179.88 469.379 1179.77 469.773 1179.77 470.217V476.43H1178.26ZM1188.19 476.634C1187.37 476.634 1186.65 476.428 1186.02 476.014C1185.4 475.597 1184.91 475.009 1184.55 474.25C1184.2 473.487 1184.02 472.586 1184.02 471.546C1184.02 470.515 1184.2 469.62 1184.55 468.862C1184.91 468.103 1185.4 467.517 1186.03 467.104C1186.66 466.69 1187.39 466.484 1188.21 466.484C1188.85 466.484 1189.36 466.59 1189.73 466.803C1190.1 467.012 1190.39 467.251 1190.59 467.519C1190.79 467.783 1190.94 468.001 1191.05 468.171H1191.18V463.339H1192.69V476.43H1191.23V474.921H1191.05C1190.94 475.1 1190.78 475.326 1190.58 475.599C1190.37 475.867 1190.08 476.108 1189.7 476.321C1189.32 476.53 1188.82 476.634 1188.19 476.634ZM1188.39 475.279C1189 475.279 1189.51 475.121 1189.93 474.806C1190.35 474.487 1190.66 474.045 1190.88 473.483C1191.1 472.916 1191.21 472.262 1191.21 471.521C1191.21 470.788 1191.1 470.146 1190.89 469.597C1190.67 469.043 1190.36 468.612 1189.94 468.305C1189.52 467.994 1189.01 467.839 1188.39 467.839C1187.75 467.839 1187.22 468.003 1186.8 468.331C1186.37 468.655 1186.06 469.096 1185.84 469.654C1185.63 470.208 1185.53 470.83 1185.53 471.521C1185.53 472.219 1185.64 472.854 1185.85 473.425C1186.07 473.992 1186.39 474.444 1186.81 474.781C1187.23 475.113 1187.76 475.279 1188.39 475.279ZM1199.6 476.634C1198.65 476.634 1197.84 476.425 1197.15 476.008C1196.47 475.586 1195.94 474.998 1195.57 474.244C1195.2 473.485 1195.02 472.603 1195.02 471.597C1195.02 470.592 1195.2 469.705 1195.57 468.938C1195.94 468.167 1196.46 467.566 1197.12 467.136C1197.78 466.701 1198.56 466.484 1199.44 466.484C1199.96 466.484 1200.46 466.569 1200.96 466.739C1201.46 466.91 1201.91 467.187 1202.32 467.57C1202.73 467.95 1203.06 468.452 1203.3 469.079C1203.54 469.705 1203.66 470.477 1203.66 471.393V472.032H1196.09V470.728H1202.13C1202.13 470.174 1202.02 469.68 1201.8 469.245C1201.58 468.81 1201.27 468.467 1200.86 468.216C1200.46 467.964 1199.99 467.839 1199.44 467.839C1198.84 467.839 1198.32 467.988 1197.88 468.286C1197.45 468.58 1197.12 468.964 1196.88 469.437C1196.65 469.91 1196.53 470.417 1196.53 470.958V471.827C1196.53 472.569 1196.66 473.197 1196.91 473.713C1197.17 474.224 1197.53 474.614 1197.99 474.883C1198.45 475.147 1198.99 475.279 1199.6 475.279C1199.99 475.279 1200.35 475.224 1200.67 475.113C1201 474.998 1201.27 474.827 1201.51 474.602C1201.74 474.371 1201.92 474.086 1202.05 473.745L1203.51 474.154C1203.36 474.648 1203.1 475.083 1202.74 475.458C1202.37 475.829 1201.93 476.119 1201.39 476.327C1200.86 476.532 1200.26 476.634 1199.6 476.634ZM1205.78 476.43V466.612H1207.24V468.094H1207.34C1207.52 467.609 1207.84 467.214 1208.31 466.912C1208.78 466.609 1209.31 466.458 1209.89 466.458C1210 466.458 1210.14 466.46 1210.31 466.464C1210.48 466.469 1210.6 466.475 1210.69 466.484V468.018C1210.64 468.005 1210.52 467.986 1210.34 467.96C1210.16 467.93 1209.97 467.915 1209.77 467.915C1209.29 467.915 1208.86 468.016 1208.49 468.216C1208.12 468.412 1207.82 468.685 1207.61 469.034C1207.39 469.379 1207.29 469.773 1207.29 470.217V476.43H1205.78ZM1215.52 470.907C1215.52 472.518 1215.31 474.001 1214.88 475.356C1214.47 476.707 1213.87 477.951 1213.09 479.089H1211.76C1212.06 478.667 1212.35 478.147 1212.61 477.529C1212.88 476.915 1213.12 476.242 1213.32 475.509C1213.52 474.772 1213.67 474.011 1213.78 473.227C1213.9 472.439 1213.96 471.665 1213.96 470.907C1213.96 469.893 1213.86 468.864 1213.66 467.82C1213.47 466.776 1213.2 465.806 1212.87 464.911C1212.54 464.016 1212.17 463.288 1211.76 462.725H1213.09C1213.87 463.863 1214.47 465.109 1214.88 466.464C1215.31 467.815 1215.52 469.296 1215.52 470.907Z" fill="#171717" fillOpacity="0.5" className="tc_label" style={v(3978,undefined,undefined,-10)}/>
            <path d="M585.204 436.612C585.127 435.964 584.816 435.461 584.271 435.103C583.725 434.745 583.056 434.566 582.263 434.566C581.684 434.566 581.177 434.66 580.742 434.847C580.312 435.035 579.975 435.293 579.732 435.621C579.494 435.949 579.374 436.322 579.374 436.739C579.374 437.089 579.457 437.389 579.624 437.641C579.794 437.888 580.011 438.094 580.276 438.261C580.54 438.423 580.817 438.557 581.106 438.663C581.396 438.766 581.663 438.849 581.905 438.913L583.235 439.271C583.576 439.36 583.955 439.484 584.373 439.641C584.795 439.799 585.197 440.014 585.581 440.287C585.969 440.555 586.288 440.901 586.54 441.322C586.791 441.744 586.917 442.262 586.917 442.876C586.917 443.583 586.731 444.222 586.361 444.793C585.994 445.364 585.457 445.818 584.75 446.155C584.047 446.491 583.192 446.66 582.187 446.66C581.249 446.66 580.437 446.509 579.751 446.206C579.07 445.903 578.533 445.482 578.141 444.94C577.753 444.399 577.533 443.771 577.482 443.055H579.119C579.161 443.549 579.327 443.958 579.617 444.282C579.911 444.602 580.282 444.84 580.729 444.998C581.181 445.151 581.667 445.228 582.187 445.228C582.792 445.228 583.335 445.13 583.817 444.934C584.298 444.734 584.68 444.457 584.961 444.103C585.242 443.745 585.383 443.327 585.383 442.85C585.383 442.415 585.261 442.062 585.018 441.789C584.776 441.516 584.456 441.295 584.06 441.124C583.663 440.954 583.235 440.805 582.775 440.677L581.164 440.217C580.141 439.923 579.332 439.503 578.735 438.957C578.138 438.412 577.84 437.698 577.84 436.816C577.84 436.083 578.038 435.444 578.435 434.898C578.835 434.349 579.372 433.923 580.045 433.62C580.723 433.313 581.479 433.16 582.315 433.16C583.158 433.16 583.908 433.311 584.565 433.614C585.221 433.912 585.741 434.321 586.124 434.841C586.512 435.361 586.717 435.951 586.738 436.612H585.204ZM593.409 436.612V437.89H588.32V436.612H593.409ZM589.803 434.259H591.312V443.617C591.312 444.043 591.374 444.363 591.497 444.576C591.625 444.785 591.787 444.925 591.983 444.998C592.183 445.066 592.394 445.1 592.616 445.1C592.782 445.1 592.918 445.092 593.025 445.075C593.132 445.053 593.217 445.036 593.281 445.023L593.588 446.379C593.485 446.417 593.342 446.455 593.159 446.494C592.976 446.536 592.744 446.558 592.463 446.558C592.036 446.558 591.619 446.466 591.21 446.283C590.805 446.099 590.468 445.82 590.2 445.445C589.936 445.07 589.803 444.597 589.803 444.026V434.259ZM599.381 446.634C598.495 446.634 597.717 446.423 597.048 446.001C596.383 445.58 595.863 444.989 595.488 444.231C595.117 443.472 594.932 442.586 594.932 441.572C594.932 440.549 595.117 439.656 595.488 438.893C595.863 438.131 596.383 437.538 597.048 437.116C597.717 436.695 598.495 436.484 599.381 436.484C600.267 436.484 601.043 436.695 601.708 437.116C602.377 437.538 602.897 438.131 603.267 438.893C603.642 439.656 603.83 440.549 603.83 441.572C603.83 442.586 603.642 443.472 603.267 444.231C602.897 444.989 602.377 445.58 601.708 446.001C601.043 446.423 600.267 446.634 599.381 446.634ZM599.381 445.279C600.054 445.279 600.608 445.107 601.043 444.761C601.477 444.416 601.799 443.962 602.008 443.4C602.217 442.837 602.321 442.228 602.321 441.572C602.321 440.915 602.217 440.304 602.008 439.737C601.799 439.17 601.477 438.712 601.043 438.363C600.608 438.013 600.054 437.839 599.381 437.839C598.708 437.839 598.154 438.013 597.719 438.363C597.284 438.712 596.963 439.17 596.754 439.737C596.545 440.304 596.441 440.915 596.441 441.572C596.441 442.228 596.545 442.837 596.754 443.4C596.963 443.962 597.284 444.416 597.719 444.761C598.154 445.107 598.708 445.279 599.381 445.279ZM605.952 450.112V436.612H607.41V438.171H607.589C607.7 438.001 607.853 437.783 608.049 437.519C608.249 437.251 608.535 437.012 608.906 436.803C609.281 436.59 609.788 436.484 610.427 436.484C611.254 436.484 611.982 436.69 612.613 437.104C613.244 437.517 613.736 438.103 614.09 438.862C614.443 439.62 614.62 440.515 614.62 441.546C614.62 442.586 614.443 443.487 614.09 444.25C613.736 445.009 613.246 445.597 612.619 446.014C611.993 446.428 611.271 446.634 610.452 446.634C609.822 446.634 609.317 446.53 608.938 446.321C608.558 446.108 608.266 445.867 608.062 445.599C607.857 445.326 607.7 445.1 607.589 444.921H607.461V450.112H605.952ZM607.435 441.521C607.435 442.262 607.544 442.916 607.761 443.483C607.979 444.045 608.296 444.487 608.714 444.806C609.131 445.121 609.643 445.279 610.248 445.279C610.879 445.279 611.405 445.113 611.827 444.781C612.253 444.444 612.573 443.992 612.786 443.425C613.003 442.854 613.112 442.219 613.112 441.521C613.112 440.83 613.005 440.208 612.792 439.654C612.583 439.096 612.266 438.655 611.84 438.331C611.418 438.003 610.887 437.839 610.248 437.839C609.634 437.839 609.119 437.994 608.701 438.305C608.283 438.612 607.968 439.043 607.755 439.597C607.542 440.146 607.435 440.788 607.435 441.521Z" fill="#171717" className="tc_label" style={v(4638,undefined,undefined,-10)}/>
            <path d="M545.116 457.884C545.116 456.273 545.325 454.793 545.743 453.442C546.165 452.087 546.766 450.84 547.545 449.702H548.875C548.568 450.124 548.281 450.644 548.012 451.262C547.748 451.876 547.516 452.551 547.315 453.288C547.115 454.021 546.957 454.78 546.842 455.564C546.732 456.348 546.676 457.121 546.676 457.884C546.676 458.898 546.774 459.928 546.97 460.972C547.166 462.016 547.43 462.985 547.763 463.88C548.095 464.775 548.466 465.504 548.875 466.066H547.545C546.766 464.928 546.165 463.684 545.743 462.333C545.325 460.978 545.116 459.495 545.116 457.884ZM551.662 464.43H550.001L554.807 451.339H556.444L561.251 464.43H559.589L555.677 453.41H555.574L551.662 464.43ZM552.276 459.316H558.975V460.722H552.276V459.316ZM560.864 452.745V451.339H570.683V452.745H566.566V464.43H564.981V452.745H560.864ZM572.949 464.43V451.339H577.372C578.395 451.339 579.235 451.513 579.891 451.863C580.547 452.208 581.033 452.683 581.348 453.288C581.664 453.893 581.821 454.582 581.821 455.353C581.821 456.124 581.664 456.808 581.348 457.405C581.033 458.001 580.549 458.47 579.897 458.811C579.245 459.148 578.412 459.316 577.398 459.316H573.818V457.884H577.347C578.046 457.884 578.608 457.782 579.034 457.577C579.465 457.373 579.776 457.083 579.968 456.708C580.164 456.329 580.262 455.877 580.262 455.353C580.262 454.829 580.164 454.371 579.968 453.979C579.772 453.587 579.458 453.284 579.028 453.071C578.598 452.854 578.029 452.745 577.321 452.745H574.534V464.43H572.949ZM579.111 458.549L582.333 464.43H580.492L577.321 458.549H579.111ZM589.703 458.114V459.521H583.976V458.114H589.703ZM592.382 464.43V451.339H593.891V456.171H594.018C594.129 456.001 594.283 455.783 594.479 455.519C594.679 455.251 594.964 455.012 595.335 454.803C595.71 454.59 596.217 454.484 596.857 454.484C597.683 454.484 598.412 454.69 599.043 455.104C599.673 455.517 600.165 456.103 600.519 456.862C600.873 457.62 601.05 458.515 601.05 459.546C601.05 460.586 600.873 461.487 600.519 462.25C600.165 463.009 599.675 463.597 599.049 464.014C598.423 464.428 597.7 464.634 596.882 464.634C596.251 464.634 595.746 464.53 595.367 464.321C594.988 464.108 594.696 463.867 594.491 463.599C594.287 463.326 594.129 463.1 594.018 462.921H593.839V464.43H592.382ZM593.865 459.521C593.865 460.262 593.974 460.916 594.191 461.483C594.408 462.045 594.726 462.487 595.143 462.806C595.561 463.121 596.072 463.279 596.678 463.279C597.308 463.279 597.835 463.113 598.256 462.781C598.683 462.444 599.002 461.992 599.215 461.425C599.433 460.854 599.541 460.219 599.541 459.521C599.541 458.83 599.435 458.208 599.222 457.654C599.013 457.096 598.695 456.655 598.269 456.331C597.847 456.003 597.317 455.839 596.678 455.839C596.064 455.839 595.548 455.994 595.131 456.305C594.713 456.612 594.398 457.043 594.185 457.597C593.972 458.146 593.865 458.788 593.865 459.521ZM606.066 464.66C605.444 464.66 604.88 464.543 604.373 464.308C603.865 464.07 603.463 463.727 603.164 463.279C602.866 462.827 602.717 462.282 602.717 461.643C602.717 461.08 602.828 460.624 603.049 460.275C603.271 459.921 603.567 459.644 603.938 459.444C604.309 459.244 604.718 459.094 605.165 458.996C605.617 458.894 606.071 458.813 606.527 458.754C607.123 458.677 607.607 458.619 607.978 458.581C608.353 458.538 608.625 458.468 608.796 458.37C608.971 458.272 609.058 458.102 609.058 457.859V457.808C609.058 457.177 608.885 456.687 608.54 456.337C608.199 455.988 607.682 455.813 606.987 455.813C606.267 455.813 605.702 455.971 605.293 456.286C604.884 456.602 604.596 456.938 604.43 457.296L602.998 456.785C603.254 456.188 603.595 455.724 604.021 455.391C604.451 455.055 604.92 454.82 605.427 454.688C605.939 454.552 606.441 454.484 606.936 454.484C607.251 454.484 607.613 454.522 608.022 454.599C608.436 454.671 608.834 454.822 609.218 455.053C609.606 455.283 609.927 455.63 610.183 456.094C610.439 456.559 610.566 457.181 610.566 457.961V464.43H609.058V463.1H608.981C608.879 463.313 608.708 463.541 608.47 463.784C608.231 464.027 607.914 464.234 607.517 464.404C607.121 464.575 606.637 464.66 606.066 464.66ZM606.297 463.305C606.893 463.305 607.396 463.188 607.805 462.953C608.218 462.719 608.53 462.416 608.738 462.045C608.951 461.675 609.058 461.285 609.058 460.876V459.495C608.994 459.572 608.853 459.642 608.636 459.706C608.423 459.766 608.176 459.819 607.895 459.866C607.618 459.908 607.347 459.947 607.083 459.981C606.823 460.011 606.612 460.036 606.45 460.058C606.058 460.109 605.691 460.192 605.351 460.307C605.014 460.418 604.741 460.586 604.532 460.812C604.328 461.033 604.226 461.336 604.226 461.719C604.226 462.244 604.419 462.64 604.807 462.908C605.199 463.173 605.696 463.305 606.297 463.305ZM620.094 456.81L618.739 457.194C618.654 456.968 618.528 456.749 618.362 456.536C618.2 456.318 617.979 456.139 617.697 455.999C617.416 455.858 617.056 455.788 616.617 455.788C616.016 455.788 615.516 455.926 615.115 456.203C614.719 456.476 614.521 456.823 614.521 457.245C614.521 457.62 614.657 457.916 614.93 458.134C615.202 458.351 615.628 458.532 616.208 458.677L617.665 459.035C618.543 459.248 619.197 459.574 619.628 460.013C620.058 460.447 620.273 461.008 620.273 461.694C620.273 462.256 620.111 462.759 619.788 463.202C619.468 463.646 619.021 463.995 618.445 464.251C617.87 464.506 617.201 464.634 616.438 464.634C615.437 464.634 614.608 464.417 613.952 463.982C613.295 463.548 612.88 462.913 612.705 462.077L614.137 461.719C614.273 462.248 614.531 462.644 614.91 462.908C615.294 463.173 615.795 463.305 616.413 463.305C617.116 463.305 617.674 463.156 618.087 462.857C618.505 462.555 618.714 462.192 618.714 461.771C618.714 461.43 618.594 461.144 618.356 460.914C618.117 460.68 617.751 460.505 617.256 460.39L615.62 460.006C614.721 459.793 614.06 459.463 613.638 459.016C613.221 458.564 613.012 457.999 613.012 457.322C613.012 456.768 613.168 456.278 613.479 455.852C613.794 455.425 614.222 455.091 614.763 454.848C615.309 454.605 615.927 454.484 616.617 454.484C617.589 454.484 618.351 454.697 618.905 455.123C619.464 455.549 619.86 456.112 620.094 456.81ZM626.481 464.634C625.535 464.634 624.719 464.425 624.032 464.008C623.351 463.586 622.824 462.998 622.454 462.244C622.087 461.485 621.904 460.603 621.904 459.597C621.904 458.592 622.087 457.705 622.454 456.938C622.824 456.167 623.34 455.566 624 455.136C624.665 454.701 625.441 454.484 626.327 454.484C626.839 454.484 627.344 454.569 627.842 454.739C628.341 454.91 628.795 455.187 629.204 455.57C629.613 455.95 629.939 456.452 630.182 457.079C630.424 457.705 630.546 458.477 630.546 459.393V460.032H622.978V458.728H629.012C629.012 458.174 628.901 457.68 628.679 457.245C628.462 456.81 628.151 456.467 627.746 456.216C627.346 455.964 626.873 455.839 626.327 455.839C625.726 455.839 625.206 455.988 624.768 456.286C624.333 456.58 623.998 456.964 623.764 457.437C623.53 457.91 623.412 458.417 623.412 458.958V459.827C623.412 460.569 623.54 461.197 623.796 461.713C624.056 462.224 624.416 462.614 624.876 462.883C625.336 463.147 625.871 463.279 626.481 463.279C626.877 463.279 627.235 463.224 627.554 463.113C627.878 462.998 628.157 462.827 628.392 462.602C628.626 462.371 628.807 462.086 628.935 461.745L630.393 462.154C630.239 462.648 629.981 463.083 629.619 463.458C629.257 463.829 628.809 464.119 628.277 464.327C627.744 464.532 627.145 464.634 626.481 464.634ZM636.368 464.634C635.55 464.634 634.828 464.428 634.201 464.014C633.575 463.597 633.085 463.009 632.731 462.25C632.377 461.487 632.2 460.586 632.2 459.546C632.2 458.515 632.377 457.62 632.731 456.862C633.085 456.103 633.577 455.517 634.208 455.104C634.838 454.69 635.567 454.484 636.394 454.484C637.033 454.484 637.538 454.59 637.909 454.803C638.284 455.012 638.569 455.251 638.765 455.519C638.965 455.783 639.121 456.001 639.232 456.171H639.36V451.339H640.868V464.43H639.411V462.921H639.232C639.121 463.1 638.963 463.326 638.759 463.599C638.554 463.867 638.262 464.108 637.883 464.321C637.504 464.53 636.999 464.634 636.368 464.634ZM636.573 463.279C637.178 463.279 637.689 463.121 638.107 462.806C638.524 462.487 638.842 462.045 639.059 461.483C639.276 460.916 639.385 460.262 639.385 459.521C639.385 458.788 639.279 458.146 639.066 457.597C638.852 457.043 638.537 456.612 638.119 456.305C637.702 455.994 637.186 455.839 636.573 455.839C635.933 455.839 635.401 456.003 634.975 456.331C634.553 456.655 634.235 457.096 634.022 457.654C633.813 458.208 633.709 458.83 633.709 459.521C633.709 460.219 633.816 460.854 634.029 461.425C634.246 461.992 634.566 462.444 634.987 462.781C635.414 463.113 635.942 463.279 636.573 463.279ZM646.882 458.907C646.882 460.518 646.671 462.001 646.249 463.356C645.832 464.707 645.233 465.951 644.453 467.089H643.123C643.43 466.667 643.716 466.147 643.98 465.529C644.248 464.915 644.483 464.242 644.683 463.509C644.883 462.772 645.039 462.011 645.15 461.227C645.265 460.439 645.322 459.665 645.322 458.907C645.322 457.893 645.224 456.864 645.028 455.82C644.832 454.776 644.568 453.806 644.236 452.911C643.903 452.016 643.533 451.288 643.123 450.725H644.453C645.233 451.863 645.832 453.109 646.249 454.464C646.671 455.815 646.882 457.296 646.882 458.907Z" fill="#171717" fillOpacity="0.5" className="tc_label" style={v(4728,undefined,undefined,-10)}/>
            <g className="tc_bubble" style={v(2998)}>
                <rect x="986.5" y="415.93" width="47" height="47" rx="23.5" fill="#015DFF" fillOpacity="0.24"/>
                <rect x="986.5" y="415.93" width="47" height="47" rx="23.5" stroke="#015DFF"/>
                <path d="M1005.19 446.717C1004.09 446.713 1003.15 446.442 1002.36 445.906C1001.57 445.369 1000.96 444.591 1000.53 443.572C1000.11 442.554 999.903 441.329 999.908 439.897C999.908 438.469 1000.12 437.253 1000.54 436.247C1000.97 435.241 1001.57 434.477 1002.36 433.952C1003.15 433.424 1004.1 433.16 1005.19 433.16C1006.29 433.16 1007.23 433.424 1008.02 433.952C1008.81 434.481 1009.42 435.248 1009.85 436.254C1010.27 437.255 1010.48 438.469 1010.48 439.897C1010.48 441.333 1010.27 442.56 1009.84 443.579C1009.42 444.597 1008.81 445.375 1008.03 445.912C1007.24 446.449 1006.29 446.717 1005.19 446.717ZM1005.19 444.423C1005.94 444.423 1006.54 444.045 1006.99 443.291C1007.44 442.537 1007.66 441.406 1007.65 439.897C1007.65 438.904 1007.55 438.077 1007.35 437.417C1007.15 436.756 1006.86 436.26 1006.49 435.928C1006.12 435.595 1005.69 435.429 1005.19 435.429C1004.45 435.429 1003.85 435.802 1003.4 436.548C1002.96 437.293 1002.73 438.41 1002.73 439.897C1002.73 440.903 1002.83 441.742 1003.03 442.415C1003.23 443.085 1003.52 443.587 1003.89 443.924C1004.26 444.256 1004.7 444.423 1005.19 444.423ZM1017.97 433.339V446.43H1015.2V435.966H1015.12L1012.13 437.845V435.391L1015.37 433.339H1017.97Z" fill="#015DFF"/>
            </g>
            <g className="tc_bubble" style={v(3748)}>
                <rect x="1063.5" y="439.93" width="47" height="47" rx="23.5" fill="#015DFF" fillOpacity="0.24"/>
                <rect x="1063.5" y="439.93" width="47" height="47" rx="23.5" stroke="#015DFF"/>
                <path d="M1081.19 470.717C1080.09 470.713 1079.15 470.442 1078.36 469.906C1077.57 469.369 1076.96 468.591 1076.53 467.572C1076.11 466.554 1075.9 465.329 1075.91 463.897C1075.91 462.469 1076.12 461.253 1076.54 460.247C1076.97 459.241 1077.57 458.477 1078.36 457.952C1079.15 457.424 1080.1 457.16 1081.19 457.16C1082.29 457.16 1083.23 457.424 1084.02 457.952C1084.81 458.481 1085.42 459.248 1085.85 460.254C1086.27 461.255 1086.48 462.469 1086.48 463.897C1086.48 465.333 1086.27 466.56 1085.84 467.579C1085.42 468.597 1084.81 469.375 1084.03 469.912C1083.24 470.449 1082.29 470.717 1081.19 470.717ZM1081.19 468.423C1081.94 468.423 1082.54 468.045 1082.99 467.291C1083.44 466.537 1083.66 465.406 1083.65 463.897C1083.65 462.904 1083.55 462.077 1083.35 461.417C1083.15 460.756 1082.86 460.26 1082.49 459.928C1082.12 459.595 1081.69 459.429 1081.19 459.429C1080.45 459.429 1079.85 459.802 1079.4 460.548C1078.96 461.293 1078.73 462.41 1078.73 463.897C1078.73 464.903 1078.83 465.742 1079.03 466.415C1079.23 467.085 1079.52 467.587 1079.89 467.924C1080.26 468.256 1080.7 468.423 1081.19 468.423ZM1088.27 470.43V468.435L1092.93 464.121C1093.33 463.737 1093.66 463.392 1093.93 463.085C1094.2 462.778 1094.41 462.478 1094.55 462.184C1094.69 461.886 1094.76 461.564 1094.76 461.219C1094.76 460.835 1094.67 460.505 1094.5 460.228C1094.32 459.947 1094.09 459.732 1093.78 459.582C1093.48 459.429 1093.14 459.352 1092.75 459.352C1092.35 459.352 1092 459.433 1091.71 459.595C1091.41 459.757 1091.18 459.989 1091.02 460.292C1090.85 460.594 1090.77 460.955 1090.77 461.372H1088.15C1088.15 460.516 1088.34 459.772 1088.73 459.141C1089.12 458.511 1089.66 458.023 1090.36 457.678C1091.06 457.332 1091.86 457.16 1092.77 457.16C1093.71 457.16 1094.53 457.326 1095.22 457.658C1095.92 457.987 1096.46 458.442 1096.85 459.026C1097.24 459.61 1097.43 460.279 1097.43 461.033C1097.43 461.528 1097.34 462.016 1097.14 462.497C1096.95 462.979 1096.6 463.513 1096.11 464.102C1095.62 464.685 1094.92 465.386 1094.02 466.205L1092.11 468.077V468.167H1097.61V470.43H1088.27Z" fill="#015DFF"/>
            </g>
            <g className="tc_bubble" style={v(4498)}>
                <rect x="571.5" y="475.93" width="47" height="47" rx="23.5" fill="#015DFF" fillOpacity="0.24"/>
                <rect x="571.5" y="475.93" width="47" height="47" rx="23.5" stroke="#015DFF"/>
                <path d="M588.694 506.717C587.594 506.713 586.648 506.442 585.856 505.906C585.067 505.369 584.46 504.591 584.034 503.572C583.612 502.554 583.403 501.329 583.408 499.897C583.408 498.469 583.619 497.253 584.04 496.247C584.467 495.241 585.074 494.477 585.862 493.952C586.655 493.424 587.599 493.16 588.694 493.16C589.789 493.16 590.731 493.424 591.519 493.952C592.312 494.481 592.921 495.248 593.347 496.254C593.773 497.255 593.984 498.469 593.98 499.897C593.98 501.333 593.767 502.56 593.341 503.579C592.919 504.597 592.314 505.375 591.526 505.912C590.737 506.449 589.793 506.717 588.694 506.717ZM588.694 504.423C589.444 504.423 590.043 504.045 590.49 503.291C590.938 502.537 591.159 501.406 591.155 499.897C591.155 498.904 591.053 498.077 590.848 497.417C590.648 496.756 590.362 496.26 589.991 495.928C589.625 495.595 589.192 495.429 588.694 495.429C587.948 495.429 587.352 495.802 586.904 496.548C586.457 497.293 586.231 498.41 586.227 499.897C586.227 500.903 586.327 501.742 586.527 502.415C586.732 503.085 587.019 503.587 587.39 503.924C587.761 504.256 588.195 504.423 588.694 504.423ZM600.612 506.609C599.658 506.609 598.808 506.445 598.062 506.116C597.321 505.784 596.735 505.328 596.304 504.749C595.878 504.165 595.659 503.491 595.646 502.729H598.433C598.45 503.048 598.554 503.33 598.746 503.572C598.942 503.811 599.202 503.996 599.526 504.129C599.85 504.261 600.214 504.327 600.619 504.327C601.041 504.327 601.414 504.252 601.737 504.103C602.061 503.954 602.315 503.747 602.498 503.483C602.681 503.219 602.773 502.914 602.773 502.569C602.773 502.219 602.675 501.911 602.479 501.642C602.287 501.369 602.01 501.156 601.648 501.003C601.29 500.849 600.864 500.773 600.37 500.773H599.149V498.74H600.37C600.787 498.74 601.156 498.668 601.475 498.523C601.799 498.378 602.051 498.178 602.23 497.922C602.409 497.662 602.498 497.359 602.498 497.014C602.498 496.686 602.419 496.398 602.262 496.151C602.108 495.9 601.891 495.704 601.61 495.563C601.333 495.423 601.009 495.352 600.638 495.352C600.263 495.352 599.92 495.42 599.609 495.557C599.298 495.689 599.049 495.879 598.861 496.126C598.674 496.373 598.573 496.663 598.561 496.995H595.908C595.921 496.241 596.136 495.576 596.553 495.001C596.971 494.425 597.534 493.976 598.241 493.652C598.953 493.324 599.756 493.16 600.651 493.16C601.554 493.16 602.345 493.324 603.022 493.652C603.7 493.98 604.226 494.423 604.601 494.982C604.98 495.536 605.168 496.158 605.164 496.848C605.168 497.581 604.94 498.192 604.48 498.683C604.024 499.173 603.429 499.484 602.696 499.616V499.718C603.659 499.842 604.392 500.176 604.895 500.722C605.402 501.263 605.654 501.94 605.649 502.754C605.654 503.5 605.438 504.163 605.004 504.742C604.573 505.322 603.979 505.778 603.22 506.11C602.462 506.442 601.593 506.609 600.612 506.609Z" fill="#015DFF"/>
            </g>
            <defs>
                <linearGradient id="tcPaint0" x1="60" y1="612.238" x2="68.9047" y2="630.048" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint1" x1="60" y1="612.238" x2="70.4761" y2="612.238" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint2" x1="80.2539" y1="595.477" x2="89.6349" y2="613.633" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint3" x1="80.2539" y1="595.477" x2="90.73" y2="595.477" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint4" x1="100.507" y1="595.477" x2="105.31" y2="608.115" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint5" x1="100.507" y1="595.477" x2="110.983" y2="595.477" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint6" x1="120.761" y1="594.781" x2="128.259" y2="611.443" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint7" x1="120.761" y1="594.781" x2="131.237" y2="594.781" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint8" x1="141.713" y1="575.926" x2="153.499" y2="595.568" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint9" x1="141.713" y1="575.926" x2="152.189" y2="575.926" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint10" x1="161.967" y1="564.746" x2="168.108" y2="580.099" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint11" x1="161.967" y1="564.746" x2="172.443" y2="564.746" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint12" x1="182.221" y1="566.84" x2="186.673" y2="580.197" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint13" x1="182.221" y1="566.84" x2="192.697" y2="566.84" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint14" x1="202.474" y1="575.926" x2="212.334" y2="594.413" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint15" x1="202.474" y1="575.926" x2="212.95" y2="575.926" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint16" x1="222.728" y1="584.305" x2="228.869" y2="599.658" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint17" x1="222.728" y1="584.305" x2="233.204" y2="584.305" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint18" x1="243.68" y1="568.941" x2="253.54" y2="587.429" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint19" x1="243.68" y1="568.941" x2="254.156" y2="568.941" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint20" x1="263.934" y1="555.668" x2="273.794" y2="574.155" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint21" x1="263.934" y1="555.668" x2="274.41" y2="555.668" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint22" x1="286.981" y1="540.305" x2="297.322" y2="559.105" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint23" x1="286.981" y1="540.305" x2="297.457" y2="540.305" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint24" x1="307.235" y1="549.383" x2="312.943" y2="562.972" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint25" x1="307.235" y1="549.383" x2="317.711" y2="549.383" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint26" x1="327.489" y1="547.289" x2="332.348" y2="561.172" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint27" x1="327.489" y1="547.289" x2="337.965" y2="547.289" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint28" x1="348.441" y1="535.418" x2="356.872" y2="552.862" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint29" x1="348.441" y1="535.418" x2="358.917" y2="535.418" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint30" x1="386.853" y1="546.594" x2="398.639" y2="566.236" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint31" x1="386.853" y1="546.594" x2="397.329" y2="546.594" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint32" x1="407.107" y1="566.84" x2="411.474" y2="578.97" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint33" x1="407.107" y1="566.84" x2="417.583" y2="566.84" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint34" x1="427.361" y1="578.016" x2="439.146" y2="597.658" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint35" x1="427.361" y1="578.016" x2="437.837" y2="578.016" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint36" x1="447.614" y1="594.781" x2="456.046" y2="612.226" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint37" x1="447.614" y1="594.781" x2="458.09" y2="594.781" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint38" x1="467.868" y1="587.797" x2="472.32" y2="601.154" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint39" x1="467.868" y1="587.797" x2="478.344" y2="587.797" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint40" x1="488.121" y1="592.68" x2="491.264" y2="603.156" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint41" x1="488.121" y1="592.68" x2="498.597" y2="592.68" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint42" x1="509.074" y1="580.117" x2="513.526" y2="593.474" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint43" x1="509.074" y1="580.117" x2="519.55" y2="580.117" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint44" x1="529.327" y1="587.098" x2="534.186" y2="600.98" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint45" x1="529.327" y1="587.098" x2="539.803" y2="587.098" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint46" x1="549.581" y1="599.672" x2="556.709" y2="614.521" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint47" x1="549.581" y1="599.672" x2="560.057" y2="599.672" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint48" x1="570.533" y1="611.539" x2="577.119" y2="627.346" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint49" x1="570.533" y1="611.539" x2="581.009" y2="611.539" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint50" x1="590.787" y1="611.539" x2="599.218" y2="628.983" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint51" x1="590.787" y1="611.539" x2="601.263" y2="611.539" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint52" x1="613.136" y1="594.082" x2="622.041" y2="611.891" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint53" x1="613.136" y1="594.082" x2="623.612" y2="594.082" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint54" x1="633.39" y1="587.797" x2="640.887" y2="604.458" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint55" x1="633.39" y1="587.797" x2="643.866" y2="587.797" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint56" x1="655.738" y1="573.824" x2="664.17" y2="591.269" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint57" x1="655.738" y1="573.824" x2="666.214" y2="573.824" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint58" x1="675.992" y1="576.621" x2="678.76" y2="586.504" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint59" x1="675.992" y1="576.621" x2="686.468" y2="576.621" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint60" x1="696.944" y1="581.512" x2="701.311" y2="593.642" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint61" x1="696.944" y1="581.512" x2="707.42" y2="581.512" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint62" x1="717.198" y1="590.59" x2="727.058" y2="609.077" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint63" x1="717.198" y1="590.59" x2="727.674" y2="590.59" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint64" x1="737.451" y1="598.27" x2="742.701" y2="611.395" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint65" x1="737.451" y1="598.27" x2="747.927" y2="598.27" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint66" x1="757.706" y1="584.305" x2="764.292" y2="600.112" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint67" x1="757.706" y1="584.305" x2="768.182" y2="584.305" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint68" x1="777.959" y1="574.527" x2="785.922" y2="591.589" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint69" x1="777.959" y1="574.527" x2="788.436" y2="574.527" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint70" x1="820.562" y1="580.117" x2="829.467" y2="597.926" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint71" x1="820.562" y1="580.117" x2="831.038" y2="580.117" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint72" x1="843.608" y1="594.082" x2="852.513" y2="611.891" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint73" x1="843.608" y1="594.082" x2="854.084" y2="594.082" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint74" x1="866.657" y1="575.926" x2="878.923" y2="595.817" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint75" x1="866.657" y1="575.926" x2="877.133" y2="575.926" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint76" x1="890.402" y1="571.035" x2="897.05" y2="585.486" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint77" x1="890.402" y1="571.035" x2="900.878" y2="571.035" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint78" x1="914.148" y1="561.258" x2="920.734" y2="577.065" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint79" x1="914.148" y1="561.258" x2="924.624" y2="561.258" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint80" x1="934.402" y1="564.746" x2="944.262" y2="583.233" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint81" x1="934.402" y1="564.746" x2="944.878" y2="564.746" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint82" x1="954.656" y1="545.891" x2="964.516" y2="564.378" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint83" x1="954.656" y1="545.891" x2="965.132" y2="545.891" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint84" x1="975.607" y1="539.605" x2="979.974" y2="551.736" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint85" x1="975.607" y1="539.605" x2="986.083" y2="539.605" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint86" x1="1080" y1="573.602" x2="1084.37" y2="585.732" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint87" x1="1080" y1="573.602" x2="1090.48" y2="573.602" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint88" x1="993.068" y1="539.605" x2="997.871" y2="552.244" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint89" x1="993.068" y1="539.605" x2="1003.54" y2="539.605" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint90" x1="1097.46" y1="573.602" x2="1102.26" y2="586.24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint91" x1="1097.46" y1="573.602" x2="1107.94" y2="573.602" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint92" x1="1009.83" y1="530.527" x2="1019.69" y2="549.015" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint93" x1="1009.83" y1="530.527" x2="1020.31" y2="530.527" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint94" x1="1027.08" y1="502.59" x2="1043.11" y2="523.961" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint95" x1="1027.08" y1="502.59" x2="1037.56" y2="502.59" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint96" x1="1045.04" y1="533.508" x2="1054.62" y2="550.027" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint97" x1="1045.04" y1="533.508" x2="1055.51" y2="533.508" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint98" x1="1065" y1="554.508" x2="1074.58" y2="571.027" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint99" x1="1065" y1="554.508" x2="1075.48" y2="554.508" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint100" x1="1112" y1="553.371" x2="1120.43" y2="570.815" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint101" x1="1112" y1="553.371" x2="1122.48" y2="553.371" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint102" x1="1132.95" y1="540.797" x2="1141.38" y2="558.241" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint103" x1="1132.95" y1="540.797" x2="1143.43" y2="540.797" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint104" x1="1153.91" y1="526.133" x2="1167.6" y2="546.682" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint105" x1="1153.91" y1="526.133" x2="1164.38" y2="526.133" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint106" x1="1174.86" y1="521.941" x2="1183.76" y2="539.751" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint107" x1="1174.86" y1="521.941" x2="1185.33" y2="521.941" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint108" x1="1195.81" y1="505.879" x2="1204.24" y2="523.323" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint109" x1="1195.81" y1="505.879" x2="1206.28" y2="505.879" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint110" x1="1215.36" y1="513.559" x2="1222.49" y2="528.408" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint111" x1="1215.36" y1="513.559" x2="1225.84" y2="513.559" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint112" x1="1234.92" y1="501.688" x2="1246.22" y2="521.065" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint113" x1="1234.92" y1="501.688" x2="1245.4" y2="501.688" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint114" x1="1255.17" y1="494.004" x2="1264.08" y2="511.813" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint115" x1="1255.17" y1="494.004" x2="1265.65" y2="494.004" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint116" x1="1276.12" y1="473.754" x2="1290.3" y2="494.494" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint117" x1="1276.12" y1="473.754" x2="1286.6" y2="473.754" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint118" x1="1297.08" y1="469.562" x2="1305.18" y2="485.142" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FBFF"/>
                    <stop offset="1" stopColor="#C5DFFF"/>
                </linearGradient>
                <linearGradient id="tcPaint119" x1="1297.08" y1="469.562" x2="1307.55" y2="469.562" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint120" x1="1318.03" y1="446.512" x2="1332.2" y2="467.252" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint121" x1="1318.03" y1="446.512" x2="1328.5" y2="446.512" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint122" x1="367.996" y1="529.125" x2="376.901" y2="546.934" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint123" x1="367.996" y1="529.125" x2="378.472" y2="529.125" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
                <linearGradient id="tcPaint124" x1="798.911" y1="564.055" x2="808.292" y2="582.212" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A8CFFF"/>
                    <stop offset="0.48" stopColor="#70ACEA"/>
                    <stop offset="1" stopColor="#2581CE"/>
                </linearGradient>
                <linearGradient id="tcPaint125" x1="798.911" y1="564.055" x2="809.387" y2="564.055" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BAD9FF"/>
                    <stop offset="1" stopColor="#8FBCEF"/>
                </linearGradient>
            </defs>
        </svg>
    );
};

type TradeWorkflowVisualProps = {
    hedge: { title: string; description: string };
    /** icon src for the "Optional hedge" title (e.g. refresh_line.src) */
    hedgeIcon: string;
    chartAriaLabel?: string;
};

/** Replaces <Image className="bento_row_image"/> + <motion.div className="optional_hedge_block"/> */
const TradeWorkflowVisual = ({hedge, hedgeIcon, chartAriaLabel}: TradeWorkflowVisualProps) => {
    const [started, setStarted] = useState(false);
    const reduce = useReducedMotion();
    const show = started || !!reduce;

    return (
        <>
            <div className="trade_chart_wrap">
                <TradeChart ariaLabel={chartAriaLabel} onStart={() => setStarted(true)}/>
            </div>

            <motion.div
                className="optional_hedge_block"
                initial={{opacity: 0, y: 16}}
                animate={show ? {opacity: 1, y: 0} : {opacity: 0, y: 16}}
                transition={{
                    duration: reduce ? 0 : 0.7,
                    ease: EASE_OUT,
                    delay: show && !reduce ? TRADE_CHART_HEDGE_DELAY_MS / 1000 : 0,
                }}
            >
                <div className="optional_hedge_main">
                    <img src={hedgeIcon} alt=""/>
                    {hedge.title}
                </div>

                <div className="optional_hedge_info">
                    {hedge.description}
                </div>
            </motion.div>
        </>
    );
};

export default TradeWorkflowVisual;