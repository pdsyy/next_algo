'use client';

import { useEffect, useRef, useState } from 'react';
import './OurApproach.css';
import {useLanguage} from "@/context/LanguageProvider";


interface Candle { o: number; c: number; h: number; l: number }
interface Leg { a: number; b: number; g: number }
interface Gain { a: number; b: number; base: number; peak: number }

const MONO = '600 12px "Inter","Helvetica Neue",Arial,sans-serif';
const STEPS = 3;
const COLORS = { bull: '#1d1e21', bear: '#c6c8cd', bearEdge: '#9a9ca2', wick: '#55575d', grid: '#dcdde0' };

const LEGS: ReadonlyArray<readonly [number, number, number]> = [[0, .12, .09], [.2, .56, .15], [.64, 1, .21]];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function at<T>(arr: readonly T[], i: number): T { return arr[i] as T; }

function legBounds(n: number): Leg[] {
    return LEGS.map(([a, b, g]) => ({ a: Math.round(a * n), b: Math.min(n - 1, Math.round(b * n) - 1), g }));
}

function makeData(n: number, seed: number): Candle[] {
    let s = seed;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const legs = legBounds(n);
    const c: number[] = [];
    let price = 100;
    for (let i = 0; i < n; i++) {
        const inLeg = legs.some(L => i >= L.a && i <= L.b);
        price += (inLeg ? .9 : -1.6) + (r() - .47) * 2.6;
        c.push(price);
    }
    legs.forEach((L, k) => {
        const base = k ? at(c, at(legs, k - 1).b) : 100;
        const want = base * (1 + L.g), e = want - at(c, L.b), len = L.b - L.a + 1;
        for (let j = L.a; j < n; j++) c[j] = at(c, j) + (j <= L.b ? e * (j - L.a + 1) / len : e);
    });
    return c.map((cl, i) => {
        const o = i ? at(c, i - 1) : 100;
        return { o, c: cl, h: Math.max(o, cl) + r() * 1.6 + .3, l: Math.min(o, cl) - r() * 1.6 - .3 };
    });
}

/* ────────────────────────────── canvas helpers ────────────────────────────── */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

const PILL: Record<'dark' | 'light' | 'blue', [string, string, string | null]> = {
    dark: ['#1d1e21', '#ffffff', null],
    light: ['#f7f7f8', '#1d1e21', '#d6d7db'],
    blue: ['rgba(47,102,240,.12)', '#2f66f0', null],
};

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, txt: string, kind: 'dark' | 'light' | 'blue') {
    ctx.font = MONO; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const tw = ctx.measureText(txt).width + 18;
    const [bg, fg, stroke] = PILL[kind];
    ctx.fillStyle = bg; roundRect(ctx, x, y - 12, tw, 24, 12); ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.fillStyle = fg; ctx.fillText(txt, x + 9, y + .5);
    return tw;
}

/* ────────────────────────────── component ────────────────────────────── */

export default function OurApproach() {

    const {t, language} = useLanguage();
    const { title, items, chart } = t.approach;
    const [step, setStep] = useState(0);
    const rootRef = useRef<HTMLElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    // подписи читаются внутри rAF-цикла; ref позволяет менять язык без перезапуска canvas
    const labels = useRef(chart);
    labels.current = chart;

    useEffect(() => {
        const scroller = rootRef.current;
        const canvas = canvasRef.current;
        if (!scroller || !canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const smooth = reduce ? 1 : .1;

        // состояние графика
        const st = {
            W: 0, H: 0, N: 0, lo: 0, hi: 0, cw: 0, shown: 0, full: 0,
            pad: { l: 0, r: 0, t: 0, b: 0 },
            data: [] as Candle[],
        };
        let gains: Gain[] = [];
        let mddAll: number[] = [];
        let entries: number[] = [];
        let exits: number[] = [];
        let ma: number[] = [];

        const X = (i: number) => st.pad.l + st.cw * (i + .5);
        const Y = (v: number) => st.pad.t + (1 - (v - st.lo) / (st.hi - st.lo)) * (st.H - st.pad.t - st.pad.b);

        function resize() {
            if (!canvas || !ctx) return;
            const DPR = Math.min(2, devicePixelRatio || 1);
            st.W = canvas.clientWidth; st.H = canvas.clientHeight;
            if (!st.W || !st.H) return;
            canvas.width = st.W * DPR; canvas.height = st.H * DPR;
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

            const small = st.W < 600;
            st.N = st.W < 600 ? 28 : st.W < 900 ? 44 : 64;
            st.data = makeData(st.N, 7);
            st.lo = Math.min(...st.data.map(d => d.l));
            st.hi = Math.max(...st.data.map(d => d.h));
            const range = st.hi - st.lo; st.lo -= range * .04; st.hi += range * .06;
            st.pad = { l: small ? 2 : 16, r: small ? 74 : 88, t: small ? 34 : 40, b: small ? 6 : 12 };
            st.cw = (st.W - st.pad.l - st.pad.r) / st.N;

            // производные данные: зоны прибыли, просадка, точки входа/выхода, тренд
            const d = st.data;
            const legs = legBounds(d.length);
            gains = legs.map((L, k) => {
                if (!k) return { a: 0, b: L.b, base: at(d, 0).o, peak: -1 };
                const pk = at(legs, k - 1).b, base = at(d, pk).c;
                let bo = L.a;
                while (bo < L.b && at(d, bo).c <= base) bo++; // первая свеча выше прошлого максимума
                return { a: bo, b: L.b, base, peak: pk };
            });
            let peak = at(d, 0).c;
            mddAll = d.map(q => { peak = Math.max(peak, q.c); return 1 - q.c / peak; });
            entries = []; exits = [];
            for (let i = 3; i < d.length - 3; i++) {
                const w = d.slice(i - 3, i + 4);
                if (at(d, i).l === Math.min(...w.map(q => q.l))) entries.push(i);
                if (at(d, i).h === Math.max(...w.map(q => q.h))) exits.push(i);
            }
            ma = d.map((_, i) => {
                const sl = d.slice(Math.max(0, i - 7), i + 1);
                return sl.reduce((sum, q) => sum + q.c, 0) / sl.length;
            });
        }

        // scroll → число свечей: шаг 01 растит первую волну, шаги 02 и 03 начинаются с пробоя
        function candlesAt(p: number) {
            const N = st.N || 1;
            const g1 = gains[1], g2 = gains[2];
            const b1 = (g1 ? g1.a : N * .33) + 1, b2 = (g2 ? g2.a : N * .66) + 1;
            const P: Array<[number, number]> = [[0, 1], [1 / 3, b1], [2 / 3, b2], [.95, N]];
            for (let k = 1; k < P.length; k++) {
                const [p1, v1] = at(P, k);
                if (p <= p1) {
                    const [p0, v0] = at(P, k - 1);
                    return v0 + (v1 - v0) * (p - p0) / (p1 - p0);
                }
            }
            return N;
        }

        let idx = -1;
        const al = [0, 0, 0]; // прозрачность слоёв: 01 зоны / 02 входы-выходы / 03 тренд
        const za = [0, 0, 0]; // прозрачность зон прибыли
        let sum = 0;          // итоговая сводка

        function drawUnder(c: CanvasRenderingContext2D) {
            gains.forEach((z, k) => {
                const a = at(za, k);
                if (a < .02) return;
                if (Math.min(z.b, st.full) - z.a < 1) return; // зона начинается со свечи пробоя
                const b = Math.min(z.b, st.full), x0 = X(z.a) - st.cw / 2, x1 = X(b) + st.cw / 2;
                const g = c.createLinearGradient(0, st.pad.t, 0, st.H - st.pad.b);
                g.addColorStop(0, 'rgba(47,102,240,.10)'); g.addColorStop(1, 'rgba(47,102,240,.02)');
                c.globalAlpha = a; c.fillStyle = g; c.fillRect(x0, st.pad.t, x1 - x0, st.H - st.pad.t - st.pad.b);
                c.globalAlpha = 1;
            });
        }

        function drawOver(c: CanvasRenderingContext2D) {
            const L = labels.current;
            const d = st.data, upto = Math.min(st.full, st.N - 1), small = st.W < 600;
            gains.forEach((z, k) => {
                const a = at(za, k);
                if (a < .02) return;
                const b = Math.min(z.b, upto);
                if (b - z.a < (small ? 1 : 2)) return;
                const pct = (at(d, b).c / z.base - 1) * 100;
                c.globalAlpha = a;
                pill(c, X(z.a) - st.cw / 2 + (small ? 3 : 6), st.pad.t + 16, small ? `+${pct.toFixed(0)}%` : `${L.profit} +${pct.toFixed(1)}%`, 'blue');
                c.globalAlpha = 1;
            });
            // 02 — входы и выходы
            if (at(al, 1) > .02) {
                c.globalAlpha = at(al, 1);
                entries.forEach(i => {
                    if (i > st.full) return;
                    const x = X(i), y = Y(at(d, i).l) + 9;
                    c.fillStyle = '#1d1e21'; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 8); c.lineTo(x + 5, y + 8); c.closePath(); c.fill();
                });
                exits.forEach(i => {
                    if (i > st.full) return;
                    const x = X(i), y = Y(at(d, i).h) - 9;
                    c.strokeStyle = '#1d1e21'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y - 8); c.lineTo(x + 5, y - 8); c.closePath(); c.stroke();
                });
                c.globalAlpha = 1;
            }
            // 03 — линия тренда
            if (at(al, 2) > .02) {
                c.globalAlpha = at(al, 2); c.lineJoin = 'round'; c.lineCap = 'round';
                const path = () => {
                    c.beginPath();
                    for (let i = 0; i <= upto; i++) { const x = X(i), y = Y(at(ma, i)); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
                };
                c.strokeStyle = COLORS.bull; c.lineWidth = 2.2; path(); c.stroke();
                c.globalAlpha = 1;
            }
            // сводка — когда график вырос полностью
            if (sum > .02) {
                const prof = (at(d, upto).c / at(d, 0).o - 1) * 100;
                const mdd = Math.max(0, ...mddAll.slice(0, upto + 1)) * 100;
                c.globalAlpha = sum;
                const t1 = `${L.profit} +${prof.toFixed(1)}%`, t2 = `${L.maxDrawdown} ${mdd.toFixed(1)}%`;
                c.font = MONO;
                const w1 = c.measureText(t1).width + 18, w2 = c.measureText(t2).width + 18;
                const yb = st.H - st.pad.b - 18, xr = st.W - st.pad.r;
                if (small) { pill(c, xr - w1, yb - 30, t1, 'dark'); pill(c, xr - w2, yb, t2, 'light'); }
                else { pill(c, xr - w2 - w1 - 8, yb, t1, 'dark'); pill(c, xr - w2, yb, t2, 'light'); }
                c.globalAlpha = 1;
            }
        }

        function draw(target: number) {
            if (!ctx || !st.W) return;
            st.shown += (target - st.shown) * (reduce ? 1 : .09);
            ctx.clearRect(0, 0, st.W, st.H);

            // сетка
            ctx.strokeStyle = COLORS.grid; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
            for (let k = 0; k <= 4; k++) {
                const y = Math.round(st.pad.t + (st.H - st.pad.t - st.pad.b) * k / 4) + .5;
                ctx.beginPath(); ctx.moveTo(st.pad.l, y); ctx.lineTo(st.W - st.pad.r + 6, y); ctx.stroke();
            }
            ctx.setLineDash([]);

            const f = st.shown * st.N, full = Math.floor(f), part = f - full;
            st.full = full;
            drawUnder(ctx);

            // свечи
            const bw = Math.max(2, st.cw * .62);
            let last: number | null = null, lastX = 0;
            for (let i = 0; i < Math.min(st.N, full + 1); i++) {
                const d = at(st.data, i), g = i < full ? 1 : easeOut(part);
                if (g <= .001) continue;
                const c = d.o + (d.c - d.o) * g;
                const h = Math.max(d.o, c) + (d.h - Math.max(d.o, d.c)) * g;
                const l = Math.min(d.o, c) - (Math.min(d.o, d.c) - d.l) * g;
                const x = X(i), up = c >= d.o;
                ctx.globalAlpha = i < full ? 1 : .4 + .6 * g;
                ctx.strokeStyle = COLORS.wick; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(Math.round(x) + .5, Y(h)); ctx.lineTo(Math.round(x) + .5, Y(l)); ctx.stroke();
                const y1 = Y(Math.max(d.o, c)), bh = Math.max(1.5, Y(Math.min(d.o, c)) - y1);
                if (up) { ctx.fillStyle = COLORS.bull; ctx.fillRect(x - bw / 2, y1, bw, bh); }
                else {
                    ctx.fillStyle = COLORS.bear; ctx.fillRect(x - bw / 2, y1, bw, bh);
                    ctx.strokeStyle = COLORS.bearEdge; ctx.strokeRect(x - bw / 2 + .5, y1 + .5, bw - 1, bh - 1);
                }
                last = c; lastX = x;
            }
            ctx.globalAlpha = 1;

            // ценник последней свечи
            if (last !== null) {
                const y = Y(last);
                ctx.font = MONO; ctx.textBaseline = 'middle';
                ctx.strokeStyle = COLORS.bull; ctx.globalAlpha = .45; ctx.setLineDash([3, 3]);
                ctx.beginPath(); ctx.moveTo(lastX + bw, y); ctx.lineTo(st.W - st.pad.r + 4, y); ctx.stroke();
                ctx.setLineDash([]); ctx.globalAlpha = 1;
                const pct = (last / at(st.data, 0).o - 1) * 100;
                const txt = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
                const tw = ctx.measureText(txt).width + 14;
                ctx.fillStyle = COLORS.bull; roundRect(ctx, st.W - st.pad.r + 6, y - 11, tw, 22, 5); ctx.fill();
                ctx.fillStyle = '#ededee'; ctx.textAlign = 'left'; ctx.fillText(txt, st.W - st.pad.r + 13, y + .5);
            }
            drawOver(ctx);
        }

        // рисуем только когда блок рядом с экраном
        let visible = true;
        const io = typeof IntersectionObserver === 'undefined' ? null
            : new IntersectionObserver(entries => { visible = entries.some(e => e.isIntersecting); }, { rootMargin: '200px 0px' });
        io?.observe(scroller);

        let raf = 0;
        const frame = () => {
            raf = requestAnimationFrame(frame);
            if (!visible) return;
            const rect = scroller.getBoundingClientRect();
            const p = clamp(-rect.top / Math.max(1, rect.height - innerHeight), 0, 1);
            const s = Math.min(STEPS - 1, Math.floor(p * STEPS * .999));
            if (s !== idx) { idx = s; setStep(s); }
            for (let k = 0; k < STEPS; k++) al[k] = at(al, k) + ((k === idx ? 1 : k < idx ? .4 : 0) - at(al, k)) * smooth;
            for (let k = 0; k < 3; k++) za[k] = at(za, k) + ((k < idx ? .7 : k === idx ? 1 : 0) - at(za, k)) * smooth; // зона k появляется со слайда k
            sum += ((st.shown > .985 ? 1 : 0) - sum) * smooth;
            draw(clamp(candlesAt(p) / (st.N || 1), 0, 1));
        };

        let rt: ReturnType<typeof setTimeout> | undefined;
        const onResize = () => { clearTimeout(rt); rt = setTimeout(resize, 120); };
        addEventListener('resize', onResize);

        let cancelled = false;
        resize();
        document.fonts?.ready.then(() => { if (!cancelled) resize(); });
        raf = requestAnimationFrame(frame);

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            clearTimeout(rt);
            removeEventListener('resize', onResize);
            io?.disconnect();
        };
    }, []);

    return <section className="apr" ref={rootRef} id="advantages">
        <div className="stage">
            <div className="head">
                <h2><span>{title.line1}</span><span>{title.line2}</span></h2>
                <div className="swap">
                    {items.map((text, i) => <div key={i} className={`it${i === step ? ' on' : i < step ? ' past' : ''}`}>
                        <div className="num">{`0${i + 1}`}</div>
                        <p>{text}</p>
                    </div>)}
                </div>
            </div>
            <div className="chartwrap"><canvas ref={canvasRef} role="img" aria-label={chart.ariaLabel}/></div>
        </div>
    </section>;
}