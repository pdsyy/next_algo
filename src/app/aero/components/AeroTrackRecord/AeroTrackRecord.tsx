'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import './AeroTrackRecord.css';


export type AccountKey = 'legacy' | 'current' | 'darwinex';
export interface GainPoint {
    date: string;
    gain: number;
}
interface AccountData {
    account: AccountKey;
    points: GainPoint[];
}
export interface AeroTrackRecordTranslations {
    aero: {
        statistics: {
            label: ReactNode;
            title: ReactNode;
            description: ReactNode;
            accounts: Record<AccountKey, { title: ReactNode; description: ReactNode }>;
            archivedTitle: ReactNode;
            archivedDescription: ReactNode;
            openMyfxbook: ReactNode;
        };
        portfolio: {
            elements: ReactNode;
            title: ReactNode;
            deposit: ReactNode;
            myfxbook: ReactNode;
        };
    };
}
export interface AeroTrackRecordProps {
    t: AeroTrackRecordTranslations;
    language?: string;
    deposit?: string;
}
function isAccountData(value: unknown): value is AccountData {
    if (typeof value !== 'object' || value === null) return false;
    const data = value as Record<string, unknown>;
    return (data.account === 'legacy' || data.account === 'current' || data.account === 'darwinex')
        && Array.isArray(data.points)
        && data.points.every((point: unknown) => {
            if (typeof point !== 'object' || point === null) return false;
            const p = point as Record<string, unknown>;
            if (typeof p.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)
                || typeof p.gain !== 'number' || !Number.isFinite(p.gain)) return false;
            const date = new Date(`${p.date}T00:00:00Z`);
            return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === p.date;
        });
}

const accounts = [
    { key: 'current', url: 'https://www.myfxbook.com/members/alg0_o/aero-mt5--current-account/12205723' },
    { key: 'darwinex', url: 'https://www.myfxbook.com/members/alg0_o/aero-darwinex-zero--oenc/12209314' },
    { key: 'legacy', url: 'https://www.myfxbook.com/members/alg0_o/aero-mt4--archive-1/12232265' },
] as const;
const messages = {
    en: { gain: 'Gain', loading: 'Loading account data…', error: 'Account data is temporarily unavailable.', empty: 'No chart data is available for this account.', retry: 'Try again', chart: 'Account growth, %', account: 'Account' },
    ru: { gain: 'Доходность', loading: 'Загружаем данные счёта…', error: 'Данные счёта временно недоступны.', empty: 'Для этого счёта пока нет данных графика.', retry: 'Повторить', chart: 'Доходность счёта, %', account: 'Счёт' },
    ua: { gain: 'Дохідність', loading: 'Завантажуємо дані рахунку…', error: 'Дані рахунку тимчасово недоступні.', empty: 'Для цього рахунку поки немає даних графіка.', retry: 'Повторити', chart: 'Дохідність рахунку, %', account: 'Рахунок' },
};
type ChartText = (typeof messages)[keyof typeof messages];
interface GrowthChartProps { points: GainPoint[]; text: ChartText; locale: string; }

const signed = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
const time = (date: string) => Date.parse(`${date}T00:00:00Z`);

function niceTicks(lo: number, hi: number, count: number) {
    const raw = (hi - lo) / count || 1;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
    const ticks: number[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push(Number(v.toFixed(10)));
    return { ticks, decimals: step >= 1 ? 0 : Math.min(2, Math.ceil(-Math.log10(step))) };
}

const DURATION = 1100;
const ease = (p: number) => 1 - Math.pow(1 - p, 3);

function GrowthChart({ points, text, locale }: GrowthChartProps) {
    const gradient = useId().replace(/:/g, '');
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [hover, setHover] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    // Реальные размеры в пикселях: viewBox = размер блока, поэтому текст не растягивается
    const [size, setSize] = useState({ w: 0, h: 0 });
    const width = size.w || 600, height = size.h || 270;
    const compact = width < 500;
    const left = 20, right = width - (compact ? 56 : 64), top = compact ? 72 : 85, bottom = height - (compact ? 34 : 40);
    const fontSize = compact ? 11 : 12;
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const measure = () => setSize(prev => {
            const w = svg.clientWidth, h = svg.clientHeight;
            return prev.w === w && prev.h === h ? prev : { w, h };
        });
        measure();
        if (typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(measure);
        observer.observe(svg);
        return () => observer.disconnect();
    }, []);
    const geometry = useMemo(() => {
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        if (!firstPoint || !lastPoint) return null;
        let lo = 0, hi = 0;
        for (const point of points) { lo = Math.min(lo, point.gain); hi = Math.max(hi, point.gain); }
        const span = hi - lo || 1;
        lo -= span * .06; hi += span * .1;
        const first = time(firstPoint.date), last = time(lastPoint.date);
        const xt = (t: number) => first === last ? (left + right) / 2 : left + (t - first) / (last - first) * (right - left);
        const x = (date: string) => xt(time(date));
        const y = (gain: number) => bottom - (gain - lo) / (hi - lo) * (bottom - top);
        return { x, xt, y, lo, hi, first, last };
    }, [points, left, right, top, bottom]);

    // Анимация: стартует, когда график появился в окне (или сразу без IntersectionObserver).
    // График перемонтируется при смене счёта (key), поэтому при переключении запускается заново.
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setProgress(1); return; }
        let raf = 0;
        let observer: IntersectionObserver | null = null;
        const run = () => {
            const t0 = performance.now();
            const step = (now: number) => {
                const p = Math.min(1, (now - t0) / DURATION);
                setProgress(p);
                if (p < 1) raf = requestAnimationFrame(step);
            };
            raf = requestAnimationFrame(step);
        };
        if (typeof IntersectionObserver === 'undefined') run();
        else {
            observer = new IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting)) { observer?.disconnect(); run(); }
            }, { threshold: .35 });
            observer.observe(svg);
        }
        return () => { cancelAnimationFrame(raf); observer?.disconnect(); };
    }, []);

    const firstPoint = points[0];
    const end = points[points.length - 1];
    if (!geometry || !firstPoint || !end) return null;
    const { x, xt, y, lo, hi, first, last } = geometry;
    const { ticks, decimals } = niceTicks(lo, hi, 6);
    const done = progress >= 1;

    // Точки, нарисованные к текущему моменту (последняя интерполируется для плавности)
    const cutoff = first + (last - first) * ease(progress);
    const drawn: Array<{ t: number; gain: number }> = [];
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (!p) continue;
        const t = time(p.date);
        if (i === 0 || t <= cutoff) { drawn.push({ t, gain: p.gain }); continue; }
        const prev = points[i - 1];
        if (prev) {
            const pt = time(prev.date);
            const k = t === pt ? 1 : (cutoff - pt) / (t - pt);
            drawn.push({ t: cutoff, gain: prev.gain + (p.gain - prev.gain) * k });
        }
        break;
    }
    const head = drawn[drawn.length - 1] ?? { t: first, gain: firstPoint.gain };
    const path = drawn.map((p, i) => `${i ? 'L' : 'M'}${xt(p.t)},${y(p.gain)}`).join(' ');

    const dateLabel = (date: string) => new Date(time(date)).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
    const active = hover === null || !done ? null : points[hover];
    const labelCount = compact ? 4 : 5;
    const monthLabel = (date: string) => new Date(time(date)).toLocaleDateString(locale, { month: 'short', year: '2-digit', timeZone: 'UTC' });
    const indexes = [...new Set(Array.from({ length: labelCount }, (_, i) => Math.round(i * (points.length - 1) / (labelCount - 1))))]
        .filter((i, k, arr) => { const pt = points[i], prev = points[arr[k - 1] ?? -1]; return !!pt && (!prev || monthLabel(pt.date) !== monthLabel(prev.date)); });
    function pointer(event: ReactPointerEvent<SVGSVGElement>) {
        if (!done) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.width) return;
        const px = (event.clientX - rect.left) / rect.width * width;
        let closest = 0;
        for (let i = 1; i < points.length; i++) {
            const candidate = points[i], current = points[closest];
            if (candidate && current && Math.abs(x(candidate.date) - px) < Math.abs(x(current.date) - px)) closest = i;
        }
        setHover(closest);
    }
    return <>
        <div className="stat"><small>{text.gain}</small><strong>{signed(head.gain)}</strong></div>
        <svg ref={svgRef} className="atr-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={text.chart}
             tabIndex={0} onPointerMove={pointer} onPointerLeave={() => setHover(null)} onBlur={() => setHover(null)}
             onKeyDown={event => {
                 if (!done || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                 event.preventDefault();
                 setHover(i => event.key === 'Home' ? 0 : event.key === 'End' ? points.length - 1 : Math.max(0, Math.min(points.length - 1, (i ?? points.length - 1) + (event.key === 'ArrowRight' ? 1 : -1))));
             }}>
            <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2f66f0" stopOpacity=".22"/><stop offset="100%" stopColor="#2f66f0" stopOpacity="0"/></linearGradient></defs>
            {ticks.map(value => <g key={value}><line x1={left} x2={right} y1={y(value)} y2={y(value)} stroke="#dedee2" strokeDasharray="3 4"/><text x={right + 10} y={y(value) + 4} fill="#858891" fontSize={fontSize}>{value.toFixed(decimals)}%</text></g>)}
            <path d={`${path} L${xt(head.t)},${bottom} L${xt(first)},${bottom} Z`} fill={`url(#${gradient})`}/>
            <path className="atr-line" d={path} fill="none" stroke="#2f66f0" strokeWidth="2.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
            <circle cx={xt(head.t)} cy={y(head.gain)} r="9" fill="#2f66f0" opacity=".16"/><circle cx={xt(head.t)} cy={y(head.gain)} r="4" fill="#2f66f0"/>
            {indexes.map(i => { const point = points[i]; return point ? <text key={i} x={x(point.date)} y={height - 12} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} fill="#858891" fontSize={fontSize}>{monthLabel(point.date)}</text> : null; })}
            {active && <g><line x1={x(active.date)} x2={x(active.date)} y1={70} y2={bottom} stroke="#c9cbd0"/><circle cx={x(active.date)} cy={y(active.gain)} r="5" fill="white" stroke="#2f66f0" strokeWidth="2"/></g>}
        </svg>
        {active && <div className="atr-tooltip" role="status" style={{ left: `clamp(80px, ${x(active.date) / width * 100}%, calc(100% - 80px))` }}>{dateLabel(active.date)} · {signed(active.gain)}</div>}
    </>;
}

export default function AeroTrackRecord({ t, language = 'en', deposit = '$160,000' }: AeroTrackRecordProps) {
    const [selected, setSelected] = useState(0);
    const [result, setResult] = useState<AccountData | null>(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);
    const root = useRef<HTMLElement | null>(null);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const uid = useId();
    const account = accounts[selected] ?? accounts[1];
    const text = language === 'ru' ? messages.ru : language === 'ua' || language === 'uk' ? messages.ua : messages.en;
    const locale = language === 'ru' ? 'ru-RU' : ['ua', 'uk'].includes(language) ? 'uk-UA' : 'en-US';
    const statistics = t.aero.statistics, portfolio = t.aero.portfolio;
    const points = result?.account === account.key ? result.points : [];
    const showChart = !loading && !failed && points.length > 0;

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setFailed(false); setResult(null);
        fetch(`/api/myfxbook?account=${account.key}`, { signal: controller.signal })
            .then(async response => {
                if (!response.ok) throw new Error('Request failed');
                const data: unknown = await response.json();
                if (!isAccountData(data) || data.account !== account.key) throw new Error('Invalid response');
                if (!controller.signal.aborted) setResult(data);
            }).catch(() => { if (!controller.signal.aborted) setFailed(true); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [account.key, retry]);

    useEffect(() => {
        const section = root.current;
        if (!section) return;
        const media = matchMedia('(prefers-reduced-motion: reduce)');
        const reset = () => section?.querySelectorAll<HTMLElement>('.tilt').forEach(el => { el.style.transform = ''; });
        const move = (event: PointerEvent) => {
            if (media.matches || event.pointerType === 'touch') return;
            section.querySelectorAll('.coin').forEach(coin => {
                const rect = coin.getBoundingClientRect();
                const dx = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (innerWidth * .45)));
                const dy = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (innerHeight * .6)));
                const tilt = coin.querySelector<HTMLElement>('.tilt');
                if (tilt) tilt.style.transform = `rotateX(${-dy * 22}deg) rotateY(${dx * 22}deg)`;
            });
        };
        section.addEventListener('pointermove', move, { passive: true });
        section.addEventListener('pointerleave', reset);
        media.addEventListener('change', reset);
        return () => { section.removeEventListener('pointermove', move); section.removeEventListener('pointerleave', reset); media.removeEventListener('change', reset); };
    }, []);

    return <section className="atr" ref={root}>
        <div className="sec"><div className="fit">
            <div className="top"><div className="eyebrow">{statistics.label}</div><h2>{statistics.title}</h2><p className="sub">{statistics.description}</p></div>
            <div className="stack">
                {['l', 'r'].map(side => <div className={`coin ${side}`} aria-hidden="true" key={side}><div className="tilt"><div className="face"/><div className="glare"/></div></div>)}
                <div className="card">
                    <div className="tabs" role="tablist" aria-label={text.account}>
                        <span className="pill" aria-hidden="true" style={{ transform: `translateX(${selected * 100}%)` }}/>
                        {accounts.map((item, i) => <button type="button" key={item.key} className="tab" role="tab" ref={el => { tabRefs.current[i] = el; }}
                                                           id={`${uid}-tab-${i}`} aria-controls={`${uid}-panel`} aria-selected={selected === i} tabIndex={selected === i ? 0 : -1}
                                                           onClick={() => setSelected(i)} onKeyDown={event => {
                            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                            event.preventDefault();
                            const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (i + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
                            setSelected(next); tabRefs.current[next]?.focus();
                        }}><b>{statistics.accounts[item.key].title}</b><span>{statistics.accounts[item.key].description}</span></button>)}
                    </div>
                    <div className="note-wrap" data-open={account.key === 'legacy'} aria-hidden={account.key !== 'legacy'}><div className="note-clip"><div className="note"><div className="note-head"><span className="ic" aria-hidden="true">ⓘ</span><b>{statistics.archivedTitle}</b></div><p>{statistics.archivedDescription}</p></div></div></div>
                    <div className="frame" role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${selected}`} aria-busy={loading} tabIndex={0}>
                        <div className="well" id="view-live-performance">
                            {!showChart && <div className="stat"><small>{text.gain}</small><strong>—</strong></div>}
                            <a className="open" href={account.url} target="_blank" rel="noopener noreferrer">{statistics.openMyfxbook}</a>
                            {loading ? <div className="atr-state" role="status">{text.loading}</div> : failed ? <div className="atr-state" role="alert">{text.error}<button type="button" onClick={() => setRetry(value => value + 1)}>{text.retry}</button></div> : points.length ? <GrowthChart key={account.key} points={points} text={text} locale={locale}/> : <div className="atr-state" role="status">{text.empty}</div>}
                        </div>
                    </div>
                </div>
                <div className="bottom"><div><div className="k">{portfolio.elements}</div><div className="t">{portfolio.title}</div></div><div className="dep"><div className="k">{portfolio.deposit}</div><div className="v">{deposit}</div></div><a className="btn" href="https://www.myfxbook.com/members/alg0_o/portfolio-trading-elements/12203984" target="_blank" rel="noopener noreferrer">{portfolio.myfxbook}</a></div>
            </div>
        </div></div>
    </section>;
}