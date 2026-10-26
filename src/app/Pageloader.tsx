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
const STORAGE_KEY = "algo_loader_seen";
const TOTAL_STAGES = 4; // fonts + chunk + image + video
const CAP_BEFORE_READY = 92; // пока не ready, прогресс не уходит выше

export default function PageLoader({ stages, ready, onDone }: PageLoaderProps) {
    const [skip, setSkip] = useState(false);
    const [removed, setRemoved] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const [fontsReady, setFontsReady] = useState(false);
    const [minPassed, setMinPassed] = useState(false);
    const [timedOut, setTimedOut] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);
    const fillRef = useRef<HTMLDivElement>(null);
    const percentRef = useRef<HTMLDivElement>(null);
    const [finished, setFinished] = useState(false);

    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    /* ---------- повторный визит в этой сессии: лоадер не показываем ---------- */
    useEffect(() => {
        let seen = false;
        try {
            seen = sessionStorage.getItem(STORAGE_KEY) === "1";
        } catch {}

       /* if (seen) {
            setSkip(true);
            setRemoved(true);
            onDoneRef.current?.();
        }*/
    }, []);

    /* ---------- таймеры ---------- */
    useEffect(() => {
        if (skip) return;

        const t1 = window.setTimeout(() => setTimedOut(true), MAX_WAIT);
        const t2 = window.setTimeout(() => setMinPassed(true), MIN_SHOW);

        return () => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, [skip]);

    /* ---------- шрифты ---------- */
    useEffect(() => {
        if (skip) return;

        if (!document.fonts?.ready) {
            setFontsReady(true);
            return;
        }

        document.fonts.ready
            .then(() => setFontsReady(true))
            .catch(() => setFontsReady(true));
    }, [skip]);

    /* ---------- блокировка скролла ---------- */
    const locked = !removed && !leaving;

    useEffect(() => {
        if (!locked) return;
        if (document.documentElement.classList.contains("loader-seen")) return;

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

    const stepSize = 100 / TOTAL_STAGES;

    const stateRef = useRef({ stagesDone: 0, done: false });
    stateRef.current.stagesDone = stagesDone;
    stateRef.current.done = done;

    /* ---------- плавное движение: по времени, без ре-рендеров ---------- */
    useEffect(() => {
        if (skip) return;

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
                : Math.min(stagesDone * stepSize + stepSize * 0.8, CAP_BEFORE_READY);

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
    }, [skip, stepSize]);

    /* ---------- уход: только когда полоса дошла до 100 ---------- */
    useEffect(() => {
        if (skip || leaving || !finished) return;

        setLeaving(true);

        try {
            sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {}

        const t = window.setTimeout(() => {
            setRemoved(true);
            onDoneRef.current?.();
        }, EXIT_MS + 50);

        return () => window.clearTimeout(t);
    }, [finished, leaving, skip]);

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
                <div className="page_loader_logo"><img src={logo.src} alt="Logo" className="logo_img"/></div>

                <div className="page_loader_bar">
                    <div ref={fillRef} className="page_loader_bar_fill" />
                </div>

                <div ref={percentRef} className="page_loader_percent">0%</div>
            </div>

            <noscript>
                <style>{`.page_loader{display:none!important}`}</style>
            </noscript>
        </div>
    );
}