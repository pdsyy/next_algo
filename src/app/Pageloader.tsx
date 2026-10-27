"use client";

import React, { useEffect, useRef, useState } from "react";
import "./page_loader.css";
import logo from "@/app/images/logo.svg";

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
const MIN_SHOW = 600; // чтобы лоадер не мелькал на быстрой сети
const EXIT_MS = 600; // должно совпадать с transition в css

// быстрый режим (повторный визит в сессии): только логотип, без полосы и процентов
const QUICK_MIN_SHOW = 500; // чтобы логотип не мелькал
const QUICK_MAX_WAIT = 1500;
const QUICK_EXIT_MS = 300; // должно совпадать с transition в css для .loader-seen

const STORAGE_KEY = "algo_loader_seen";
const TOTAL_STAGES = 4; // fonts + chunk + image + video
const STEP_SIZE = 100 / TOTAL_STAGES;
const CAP_BEFORE_READY = 92; // пока не ready, прогресс не уходит выше

/*
 * Класс "loader-seen" на <html> ставит inline-скрипт в layout.tsx
 * ещё до гидрации, если в sessionStorage уже есть ключ.
 * Вызывать только внутри эффектов (на клиенте).
 */
const isQuick = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("loader-seen");

export default function PageLoader({ stages, ready, onDone }: PageLoaderProps) {
    const [removed, setRemoved] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [finished, setFinished] = useState(false);

    const [fontsReady, setFontsReady] = useState(false);
    const [minPassed, setMinPassed] = useState(false);
    const [timedOut, setTimedOut] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);
    const fillRef = useRef<HTMLDivElement>(null);
    const percentRef = useRef<HTMLDivElement>(null);

    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    /* ---------- таймеры ---------- */
    useEffect(() => {
        const quick = isQuick();

        const t1 = window.setTimeout(
            () => setTimedOut(true),
            quick ? QUICK_MAX_WAIT : MAX_WAIT
        );
        const t2 = window.setTimeout(
            () => setMinPassed(true),
            quick ? QUICK_MIN_SHOW : MIN_SHOW
        );

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
        if (!locked || isQuick()) return;

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

    /* ---------- плавное движение: по времени, без ре-рендеров ---------- */
    useEffect(() => {
        // в быстром режиме полосы и процентов нет, анимировать нечего
        if (isQuick()) return;

        let raf = 0;
        let current = 0;
        let lastInt = -1;
        let last = performance.now();

        const tick = (now: number) => {
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;

            const { stagesDone, done } = stateRef.current;

            const goal = done
                ? 100
                : Math.min(stagesDone * STEP_SIZE + STEP_SIZE * 0.8, CAP_BEFORE_READY);

            const dist = goal - current;

            if (dist > 0) {
                // скорость пропорциональна расстоянию, но в жёстких пределах (%/с)
                const maxSpeed = done ? 90 : 30;
                const speed = Math.max(3, Math.min(dist * 2, maxSpeed));
                current = Math.min(goal, current + speed * dt);
            } else if (!done) {
                // дошли до цели этапа: медленно ползём дальше, чтобы не стоять
                current = Math.min(CAP_BEFORE_READY, current + 1 * dt);
            }

            if (fillRef.current) {
                fillRef.current.style.transform = `scaleX(${current / 100})`;
            }

            const int = Math.floor(current);
            if (int !== lastInt) {
                lastInt = int;
                if (percentRef.current) percentRef.current.textContent = `${int}%`;
                rootRef.current?.setAttribute("aria-valuenow", String(int));
            }

            if (current >= 100) {
                setFinished(true);
                return;
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, []);

    /* ---------- быстрый режим: уходим, как только hero готов ---------- */
    useEffect(() => {
        if (isQuick() && done) setFinished(true);
    }, [done]);

    /* ---------- уход ---------- */
    useEffect(() => {
        if (leaving || !finished) return;

        setLeaving(true);

        try {
            sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {}

        const exitMs = isQuick() ? QUICK_EXIT_MS : EXIT_MS;

        // не полагаемся на transitionend: он не срабатывает,
        // если вкладка в фоне или включён reduced-motion
        const t = window.setTimeout(() => {
            setRemoved(true);
            onDoneRef.current?.();
        }, exitMs + 50);

        return () => window.clearTimeout(t);
    }, [finished, leaving]);

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
            <div className="page_loader_inner">
                <div className="page_loader_logo">
                    <img src={logo.src} alt="Logo" className="logo_img" />
                </div>

                <div className="page_loader_bar">
                    <div ref={fillRef} className="page_loader_bar_fill" />
                </div>

                <div ref={percentRef} className="page_loader_percent">
                    0%
                </div>
            </div>

            <noscript>
                <style>{`.page_loader{display:none!important}`}</style>
            </noscript>
        </div>
    );
}