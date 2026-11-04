"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import "./page_loader.css";

export type LoaderStage = "chunk" | "image" | "video";

type PageLoaderProps = {
    /** Этапы, о которых сообщает hero. Шрифты лоадер отслеживает сам. */
    stages: Partial<Record<LoaderStage, boolean>>;
    /** Hero полностью готов и первый кадр уже нарисован. */
    ready: boolean;
    /** Лоадер полностью убран из DOM (удобно для скролла по #hash). */
    onDone?: () => void;
};

const MAX_WAIT = 5000; // страховка: через 5 c убираем лоадер в любом случае
const MIN_SHOW = 1500; // минимальное время показа: чтобы логотип успел собраться из точек

// таймлайн ухода (мс): пауза на 100% → разлёт точек → полный уход
const EXIT_HOLD = 300; // пауза на 100% перед разлётом
const EXIT_UNLOCK = 150; // через сколько после начала разлёта разблокируем скролл
const EXIT_TOTAL = 1000; // разлёт закончен, лоадер убираем
const SAFETY_AFTER_DONE = 5000; // если rAF стоит (вкладка в фоне) — убираем принудительно

const TOTAL_STAGES = 4; // fonts + chunk + image + video
const STEP_SIZE = 100 / TOTAL_STAGES;
const CAP_BEFORE_READY = 92; // пока не ready, прогресс не уходит выше

/*
 * Сглаживание прогресса: вместо «прыжков» цели и жёстких лимитов скорости
 * прогресс едет за целью как критически демпфированная пружина (скорость меняется плавно).
 * Чем больше SMOOTH_TIME, тем мягче разгон/торможение (сек).
 */
const SMOOTH_TIME = 0.7; // пока грузимся
const SMOOTH_TIME_DONE = 0.45; // финальный рывок к 100%: чуть бодрее
const CREEP_MAX = STEP_SIZE * 0.15; // сколько «подползаем» вперёд, пока ждём следующий этап
const CREEP_TAU = 2.5; // за сколько секунд подползание почти выбирается
const FINISH_AT = 99.5; // дальше пружина почти стоит, достраиваем до 100 незаметно
const START_VELOCITY = 35; // %/с: начальный толчок, чтобы полоса сразу поехала, а не «раскачивалась» с нуля

/* логотип ALGO (тот же, что logo.svg): из него нарезаются частицы */
const LOGO_W = 1595;
const LOGO_H = 466;
const LOGO_PATH =
    "M412.847 463.962C412.351 462.646 412.161 358.147 412.428 231.733L412.924 1.90727L428.659 1.35414L444.393 0.801078V217.333V433.865L545.956 434.361L647.518 434.857V450.115V465.373L530.64 465.869C438.157 466.251 413.572 465.85 412.847 463.962ZM868.761 464.305C747.401 447.788 659.61 342.755 666.361 222.197C671.053 138.277 718.716 64.3894 792.413 26.7781C828.574 8.33478 855.581 2.19338 900.231 2.23153C931.472 2.26967 935.076 2.67017 956.495 8.27754C995.499 18.5005 1034.64 40.2433 1062.98 67.4601C1073.52 77.5686 1090.96 98.8156 1090.96 101.562C1090.96 102.573 1086.19 107.913 1080.35 113.425L1069.75 123.457L1052.6 105.186C1025.56 76.3861 995.918 55.7495 967.08 45.6791C940.741 36.467 929.641 34.7123 898.323 34.7695C872.804 34.8077 866.224 35.4752 850.241 39.6902C777.593 58.8201 723.255 113.177 703.381 186.569C699.758 199.958 699.166 206.881 699.243 235.548C699.319 266.197 699.758 270.336 704.488 286.09C715.245 321.832 732.029 350.213 756.937 374.816C783.696 401.232 812.305 417.749 848.734 427.8C864.87 432.263 870.286 432.816 898.323 432.835C924.491 432.854 932.597 432.149 946.406 428.678C991.722 417.234 1028.78 395.567 1054.13 365.7L1064.26 353.76V318.514V283.267L964.601 282.772L864.946 282.276V268.925V255.574H979.382H1093.82L1094.33 309.626L1094.83 363.678L1085.18 375.808C1051.57 418.035 996.681 451.794 945.833 461.502C925.96 465.297 886.555 466.728 868.761 464.305ZM1330.32 464.153C1296.66 459.861 1256.51 444.298 1226.87 424.043C1196.18 403.082 1167.55 369.152 1151.02 334.211C1135.63 301.673 1129.1 271.5 1129.1 232.801C1129.1 125.861 1200.09 34.6551 1303.66 8.48737C1358.6 -5.37847 1415.02 0.591238 1465.58 25.6718C1501.76 43.6192 1531.17 68.2992 1552.67 98.7392C1580.8 138.601 1594.48 183.021 1594.48 234.594C1594.48 299.765 1572.75 352.825 1527.72 397.742C1501.73 423.68 1472.07 441.742 1435.24 454.063C1402.8 464.916 1364.94 468.559 1330.32 464.153ZM1394.21 431.252C1470.2 418.874 1534.17 362.896 1555.19 290.362C1571.04 235.681 1563.1 177.548 1533.12 128.721C1521.68 110.107 1492.78 79.9908 1475.69 68.8714C1375.98 4.02431 1249.49 32.0993 1188.67 132.555C1170.43 162.671 1160.95 198.07 1161.09 235.548C1161.26 287.12 1180.29 333.829 1216.4 371.269C1263.76 420.4 1327.92 442.047 1394.21 431.252ZM0 462.493C0 460.701 13.7133 422.689 124.85 116.343L167.058 0H183.956H200.854L205.127 12.3972C207.473 19.2253 229.311 81.4403 253.648 150.674C277.984 219.908 303.771 293.3 310.942 313.746C318.094 334.191 332.265 374.549 342.412 403.387C352.559 432.225 361.313 457.802 361.866 460.205C362.839 464.534 362.705 464.572 345.978 464.019L329.099 463.466L321.108 440.579C316.721 427.991 298.793 377.353 281.284 328.05C263.775 278.747 246.629 230.264 243.177 220.289C239.725 210.314 227.709 176.422 216.475 144.952C205.241 113.482 193.244 79.5903 189.792 69.6153C183.594 51.6679 183.517 51.5535 181.229 57.218C178.368 64.2749 146.612 150.712 116.382 233.64C103.965 267.742 79.9908 333.295 63.1115 379.337C46.2322 425.378 32.4236 463.371 32.4236 463.733C32.4236 464.115 25.1378 464.42 16.2118 464.42C6.561 464.42 0 463.638 0 462.493Z";

/* оттенки точек: от светло-серого (верх) до почти чёрного (низ) */
const SHADES = ["#c9cace", "#a2a4a9", "#7d7f85", "#56585d", "#323336", "#1c1d1f"];

type Particle = {
    tx: number; ty: number; // итоговая позиция (в логотипе)
    sx: number; sy: number; // стартовая позиция (за пределами логотипа)
    th: number; // порог прогресса, с которого частица начинает лететь
    r: number; // радиус
    c: string; // цвет
    x: number; y: number;
    vx: number; vy: number;
    a: number; // «собранность» 0..1
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function PageLoader({ stages, ready, onDone }: PageLoaderProps) {
    const [removed, setRemoved] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const [fontsReady, setFontsReady] = useState(false);
    const [minPassed, setMinPassed] = useState(false);
    const [timedOut, setTimedOut] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const percentRef = useRef<HTMLSpanElement>(null);

    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    /* лоадер убираем ровно один раз, откуда бы ни пришёл сигнал */
    const completedRef = useRef(false);
    const finish = useCallback(() => {
        if (completedRef.current) return;
        completedRef.current = true;
        setRemoved(true);
        onDoneRef.current?.();
    }, []);

    /* ---------- таймеры ---------- */
    useEffect(() => {
        const t1 = window.setTimeout(() => setTimedOut(true), MAX_WAIT);
        const t2 = window.setTimeout(() => setMinPassed(true), MIN_SHOW);

        return () => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, []);

    /* ---------- шрифты ---------- */
    useEffect(() => {
        if (!document.fonts?.ready) {
            setFontsReady(true);
            return;
        }

        document.fonts.ready
            .then(() => setFontsReady(true))
            .catch(() => setFontsReady(true));
    }, []);

    /* ---------- блокировка скролла ---------- */
    const locked = !removed && !leaving;

    useEffect(() => {
        if (!locked) return;

        const html = document.documentElement;
        html.style.overflow = "hidden";

        return () => {
            html.style.removeProperty("overflow");
        };
    }, [locked]);

    /* ---------- цель прогресса ---------- */
    const done = (ready && minPassed) || timedOut;

    const stagesDone =
        Number(fontsReady) +
        Number(!!stages.chunk) +
        Number(!!stages.image) +
        Number(!!stages.video);

    const stateRef = useRef({ stagesDone: 0, done: false });
    stateRef.current.stagesDone = stagesDone;
    stateRef.current.done = done;

    /* ---------- страховка: если анимация не дошла до конца (вкладка в фоне и т.п.) ---------- */
    useEffect(() => {
        if (!done) return;
        const t = window.setTimeout(finish, SAFETY_AFTER_DONE);
        return () => window.clearTimeout(t);
    }, [done, finish]);

    /* ---------- частицы + прогресс (один rAF, без ре-рендеров) ---------- */
    useEffect(() => {
        const root = rootRef.current;
        const cv = canvasRef.current;
        if (!root || !cv) return;

        const ctx = cv.getContext("2d");
        if (!ctx) return;

        const logoPath = new Path2D(LOGO_PATH);
        const bg =
            getComputedStyle(root).getPropertyValue("--page-loader-bg").trim() || "246,246,247";

        let W = 0, H = 0, cx = 0, cy = 0;
        let P: Particle[] = [];

        /* раскладываем логотип на частицы */
        const build = () => {
            const DPR = Math.min(2, window.devicePixelRatio || 1);
            W = window.innerWidth;
            H = window.innerHeight;
            cv.width = W * DPR;
            cv.height = H * DPR;
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

            cx = W / 2;
            cy = H / 2 - 20;

            const lw = Math.min(560, W * 0.66);
            const s = lw / LOGO_W;
            const lh = LOGO_H * s;

            const off = document.createElement("canvas");
            off.width = Math.ceil(lw);
            off.height = Math.ceil(lh);

            const o = off.getContext("2d");
            if (!o) return;

            o.scale(s, s);
            o.fill(logoPath);

            const data = o.getImageData(0, 0, off.width, off.height).data;
            const step = W < 600 ? 3 : 4;
            const next: Particle[] = [];

            for (let y = 0; y < off.height; y += step) {
                for (let x = 0; x < off.width; x += step) {
                    if (data[(y * off.width + x) * 4 + 3] < 128) continue;

                    const a = Math.random() * 6.283;
                    const r = Math.max(W, H) * (0.35 + Math.random() * 0.5);

                    next.push({
                        tx: cx - lw / 2 + x + Math.random() * 1.5,
                        ty: cy - lh / 2 + y + Math.random() * 1.5,
                        sx: cx + Math.cos(a) * r,
                        sy: cy + Math.sin(a) * r,
                        th: Math.random() * 0.86,
                        r: (W < 600 ? 0.9 : 1.1) + Math.random() * 1.2,
                        c: SHADES[Math.min(5, Math.floor((y / off.height) * 2.5 + Math.random() * 3.5))],
                        x: 0, y: 0, vx: 0, vy: 0, a: 0,
                    });
                }
            }

            P = next;
        };

        let resizeTimer = 0;
        const onResize = () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(build, 120);
        };
        window.addEventListener("resize", onResize);

        build();

        let raf = 0;
        let current = 0;
        let velocity = START_VELOCITY; // %/с, меняется плавно
        let lastStages = 0;
        let sinceStage = 0; // сек с момента последнего завершённого этапа
        let lastInt = -1;
        let last = performance.now();
        let exitAt = 0;
        let unlocked = false;

        const tick = (now: number) => {
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;

            /* --- прогресс: цель по этапам, движение за ней — плавная пружина --- */
            const { stagesDone, done } = stateRef.current;

            if (stagesDone !== lastStages) {
                lastStages = stagesDone;
                sinceStage = 0;
            }
            sinceStage += dt;

            // пока ждём следующий этап, цель медленно ползёт вперёд — полоса не «замирает»
            const creep = CREEP_MAX * (1 - Math.exp(-sinceStage / CREEP_TAU));

            const goal = done
                ? 100
                : Math.min(stagesDone * STEP_SIZE + STEP_SIZE * 0.8 + creep, CAP_BEFORE_READY);

            // критически демпфированная пружина (SmoothDamp): без рывков и без перелёта
            const smoothTime = done ? SMOOTH_TIME_DONE : SMOOTH_TIME;
            const omega = 2 / smoothTime;
            const x = omega * dt;
            const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
            const change = current - goal;
            const temp = (velocity + omega * change) * dt;

            velocity = (velocity - omega * temp) * decay;
            current = goal + (change + temp) * decay;

            // прогресс не откатывается назад
            if (velocity < 0) velocity = 0;
            current = clamp(current, 0, 100);

            // хвост пружины тянется бесконечно долго — в самом конце просто достраиваем до 100
            if (done && current >= FINISH_AT) current = 100;

            /* --- выход: пауза на 100%, потом разлёт --- */
            let exit = false;
            let et = 0;

            if (current >= 100) {
                if (!exitAt) exitAt = now + EXIT_HOLD;
                if (now >= exitAt) {
                    exit = true;
                    et = now - exitAt;
                }
            }

            /* --- рисуем частицы --- */
            const q = current / 100;
            const groups: Record<string, Particle[]> = {};

            ctx.clearRect(0, 0, W, H);

            for (let i = 0; i < P.length; i++) {
                const d = P[i];

                if (!exit) {
                    const k = easeOut(clamp((q - d.th) / 0.14, 0, 1));
                    if (k <= 0) continue;

                    const w = Math.sin(k * Math.PI) * 24;
                    d.x = lerp(d.sx, d.tx, k) + w * Math.cos(d.th * 40);
                    d.y = lerp(d.sy, d.ty, k) + w * Math.sin(d.th * 40);
                    d.a = k;

                    if (k >= 1) {
                        d.x = d.tx;
                        d.y = d.ty;
                    }
                } else {
                    if (!d.vx && !d.vy) {
                        const dx = d.tx - cx;
                        const dy = d.ty - cy;
                        const l = Math.hypot(dx, dy) || 1;
                        const v = 6 + Math.random() * 16;
                        d.vx = (dx / l) * v + (Math.random() - 0.5) * 6;
                        d.vy = (dy / l) * v + (Math.random() - 0.5) * 6;
                    }

                    const t = clamp(et / 900, 0, 1);
                    d.x = d.tx + d.vx * et * 0.06 * (1 + t * 2);
                    d.y = d.ty + d.vy * et * 0.06 * (1 + t * 2);
                }

                (groups[d.c] || (groups[d.c] = [])).push(d);
            }

            ctx.globalAlpha = exit ? Math.max(0, 1 - et / 900) : 1;

            for (const c in groups) {
                ctx.fillStyle = c;
                ctx.beginPath();
                for (const d of groups[c]) {
                    const r = d.r * (exit ? 1 : 0.4 + 0.6 * d.a);
                    ctx.moveTo(d.x + r, d.y);
                    ctx.arc(d.x, d.y, r, 0, 6.283);
                }
                ctx.fill();
            }

            ctx.globalAlpha = 1;

            /* --- проценты --- */
            const int = Math.floor(current);
            if (int !== lastInt) {
                lastInt = int;
                if (percentRef.current) percentRef.current.textContent = String(int).padStart(3, "0");
                root.setAttribute("aria-valuenow", String(int));
            }

            /* --- уход: фон и проценты гаснут, скролл разблокируется, потом убираем из DOM --- */
            if (exit) {
                const pctBox = percentRef.current?.parentElement;
                if (pctBox) pctBox.style.opacity = String(Math.max(0, 1 - et / 300));

                root.style.background = `rgba(${bg},${Math.max(0, 1 - Math.max(0, et - 150) / 650)})`;

                if (et > EXIT_UNLOCK && !unlocked) {
                    unlocked = true;
                    setLeaving(true);
                }

                if (et > EXIT_TOTAL) {
                    finish();
                    return;
                }
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(resizeTimer);
            window.removeEventListener("resize", onResize);
        };
    }, [finish]);

    if (removed) return null;

    return (
        <div
            ref={rootRef}
            className={`page_loader ${leaving ? "page_loader--out" : ""}`}
            role="progressbar"
            aria-label="Loading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
        >
            <canvas ref={canvasRef} className="page_loader_canvas" aria-hidden="true" />

            <div className="page_loader_pct" aria-hidden="true">
                <span ref={percentRef}>000</span>%
            </div>

            <noscript>
                <style>{`.page_loader{display:none!important}`}</style>
            </noscript>
        </div>
    );
}