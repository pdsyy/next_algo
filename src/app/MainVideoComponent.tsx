"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import top_lines from "./images/video_block_top_lines.svg";
import bottom_lines from "./images/bottom_lines_video_block.svg";
import {HTMLMotionProps, motion} from "framer-motion";
import {useLanguage} from "@/context/LanguageProvider";

const VIDEO_POSTER = "/algo-video-about-company-poster.webp";


const VIDEOS: Record<string, string> = {
    EN: "/videos/home_en_fast.mp4",
    RU: "/videos/home_ru_fast.mp4",
    UA: "/videos/home_ru_fast.mp4",
};

const DEFAULT_LANGUAGE = "EN";

/** Шаг перемотки с клавиатуры (стрелки влево/вправо), сек. */
const KEYBOARD_SEEK_STEP = 5;

const MainVideoComponent = () => {
    const {language} = useLanguage()!;

    const videoSrc = VIDEOS[language] ?? VIDEOS[DEFAULT_LANGUAGE];

    const containerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    /* Полноэкранным делаем весь блок (а не <video>), чтобы наши кнопки и прогресс остались поверх видео */
    const blockRef = useRef<HTMLDivElement | null>(null);

    /* Прогресс-бар: сам трек (для расчёта позиции клика) и заполнение */
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const progressFillRef = useRef<HTMLDivElement | null>(null);
    const isScrubbingRef = useRef(false);

    /* Автоплей: виден ли блок сейчас и заблокировал ли браузер (Low Power Mode, Data Saver и т.п.) */
    const inViewRef = useRef(false);
    const autoplayBlockedRef = useRef(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    /*
     * Обновляем заполнение напрямую через style, без setState:
     * так не будет ререндера компонента на каждый кадр.
     */
    const updateProgress = useCallback(() => {
        const video = videoRef.current;
        const fill = progressFillRef.current;
        const bar = progressBarRef.current;

        if (!video || !fill) return;

        const duration = video.duration;
        const ratio =
            duration && isFinite(duration)
                ? Math.min(1, Math.max(0, video.currentTime / duration))
                : 0;

        fill.style.transform = `scaleX(${ratio})`;
        bar?.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    }, []);

    /*
     * При смене языка <video> пересоздаётся (key ниже),
     * поэтому состояние кнопок и прогресс сбрасываем в исходное.
     */
    useEffect(() => {
        setIsPlaying(false);
        setIsMuted(true);
        updateProgress();
    }, [language, updateProgress]);

    /* Плавное обновление прогресса, пока видео играет */
    useEffect(() => {
        if (!isPlaying) {
            updateProgress();
            return;
        }

        let raf = 0;

        const tick = () => {
            updateProgress();
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, [isPlaying, updateProgress]);

    /* Автовоспроизведение, когда блок в зоне видимости */
    useEffect(() => {
        const container = containerRef.current;
        const video = videoRef.current;

        if (!container || !video) return;

        /* состояние кнопок при смене языка сбрасывается в muted, поэтому гарантируем это и на самом элементе */
        video.muted = true;

        const tryAutoplay = () => {
            video
                .play()
                .then(() => {
                    autoplayBlockedRef.current = false;
                    setIsPlaying(true);
                })
                .catch((error) => {
                    setIsPlaying(false);

                    /* браузер запретил автоплей: повторим при первом жесте пользователя */
                    if (error?.name === "NotAllowedError") {
                        autoplayBlockedRef.current = true;
                    }
                });
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                inViewRef.current = entry.isIntersecting;

                if (entry.isIntersecting) {
                    tryAutoplay();
                } else {
                    video.pause();
                    setIsPlaying(false);
                }
            },
            {
                threshold: 0.35,
            }
        );

        observer.observe(container);

        /*
         * Если автоплей заблокирован, любое касание страницы (жест пользователя)
         * разрешает воспроизведение — пробуем ещё раз, пока блок на экране.
         * Касания внутри самого блока (кнопки, прогресс) не трогаем:
         * там пользователь управляет видео сам.
         */
        const onGesture = (e: Event) => {
            if (!autoplayBlockedRef.current || !inViewRef.current || !video.paused) return;
            if (container.contains(e.target as Node)) return;

            tryAutoplay();
        };

        window.addEventListener("touchend", onGesture, {passive: true});
        window.addEventListener("pointerup", onGesture, {passive: true});

        return () => {
            observer.disconnect();
            window.removeEventListener("touchend", onGesture);
            window.removeEventListener("pointerup", onGesture);
            inViewRef.current = false;
            autoplayBlockedRef.current = false;
        };
    }, [language]);

    /* Прогрев: начинаем подгружать видео заранее, когда блок близко */
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const warm = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (video.paused && video.readyState === 0) {
                        video.preload = "metadata";
                        video.load();
                    }
                    warm.disconnect();
                }
            },
            {rootMargin: "600px 0px"}
        );

        warm.observe(video);
        return () => warm.disconnect();
    }, [language]);

    const togglePlay = () => {
        const video = videoRef.current;

        if (!video) return;

        autoplayBlockedRef.current = false;

        if (video.paused) {
            video
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    /* Следим за выходом из полноэкранного режима (в т.ч. по Esc) */
    useEffect(() => {
        const onChange = () => {
            const doc = document as any;
            setIsFullscreen(Boolean(doc.fullscreenElement || doc.webkitFullscreenElement));
        };

        document.addEventListener("fullscreenchange", onChange);
        document.addEventListener("webkitfullscreenchange", onChange);

        return () => {
            document.removeEventListener("fullscreenchange", onChange);
            document.removeEventListener("webkitfullscreenchange", onChange);
        };
    }, []);

    const toggleFullscreen = () => {
        const doc = document as any;
        const block = blockRef.current as any;
        const video = videoRef.current as any;

        if (!block || !video) return;

        /* выход */
        if (doc.fullscreenElement || doc.webkitFullscreenElement) {
            (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
            return;
        }

        /* вход: стандартный API / Safari */
        if (block.requestFullscreen) {
            block.requestFullscreen().catch(() => {});
        } else if (block.webkitRequestFullscreen) {
            block.webkitRequestFullscreen();
        } else if (video.webkitEnterFullscreen) {
            /* iPhone: Fullscreen API для произвольных элементов недоступен, открываем нативный плеер */
            video.webkitEnterFullscreen();
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;

        if (!video) return;

        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    /* ---------- перемотка по прогресс-бару ---------- */

    const seekFromPointer = (clientX: number) => {
        const video = videoRef.current;
        const bar = progressBarRef.current;

        if (!video || !bar || !isFinite(video.duration)) return;

        /* ширина и отступы задаются у .video_progress, трек занимает 100% — они всегда совпадают */
        const rect = bar.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));

        video.currentTime = ratio * video.duration;
        updateProgress();
    };

    const handleProgressPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        isScrubbingRef.current = true;
        setIsScrubbing(true);
        seekFromPointer(e.clientX);
    };

    const handleProgressPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isScrubbingRef.current) return;
        seekFromPointer(e.clientX);
    };

    const handleProgressPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        isScrubbingRef.current = false;
        setIsScrubbing(false);
    };

    const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const video = videoRef.current;

        if (!video || !isFinite(video.duration)) return;

        if (e.key === "ArrowRight") {
            e.preventDefault();
            video.currentTime = Math.min(video.duration, video.currentTime + KEYBOARD_SEEK_STEP);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            video.currentTime = Math.max(0, video.currentTime - KEYBOARD_SEEK_STEP);
        }

        updateProgress();
    };

    const fastEase = [0.25, 0.1, 0.25, 1.0];

    const baseTransition: any = {duration: 0.7, ease: fastEase};
    const baseViewport = {once: true, amount: 0.1};

    const fadeUp: HTMLMotionProps<any> = {
        initial: {opacity: 0, y: 0, translateZ: 0},
        whileInView: {opacity: 1, y: 0, translateZ: 0},
        viewport: baseViewport,
        transition: baseTransition
    };

    return (
        <div
            className="main_video_container"
            ref={containerRef}
        >
            <div className="top_lines_wrapper">
                <img
                    src={top_lines.src}
                    alt=""
                    className="top_lines_video_block"
                />
            </div>

            <motion.div className="main_container_video_block" ref={blockRef} {...fadeUp}>

                <video
                    key={language}
                    ref={videoRef}
                    src={videoSrc}
                    poster={VIDEO_POSTER}
                    muted
                    playsInline
                    preload="none"
                    className="main_video"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedMetadata={updateProgress}
                    onTimeUpdate={updateProgress}
                    onSeeked={updateProgress}
                    onEnded={updateProgress}
                    onVolumeChange={(e) =>
                        setIsMuted(e.currentTarget.muted)
                    }
                />

                {/* PLAY / PAUSE */}
                <button
                    type="button"
                    className="video_button video_play_button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                    {isPlaying ? (
                        // PAUSE
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <rect
                                x="6.5"
                                y="5"
                                width="4"
                                height="14"
                                rx="1"
                                fill="currentColor"
                            />

                            <rect
                                x="13.5"
                                y="5"
                                width="4"
                                height="14"
                                rx="1"
                                fill="currentColor"
                            />
                        </svg>
                    ) : (
                        // PLAY
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M8 5.5L18 12L8 18.5V5.5Z"
                                fill="currentColor"
                            />
                        </svg>
                    )}
                </button>


                {/* MUTE / UNMUTE */}
                <button
                    type="button"
                    className="video_button video_sound_button"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                    {isMuted ? (
                        // MUTED
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M4 9V15H8L13 19V5L8 9H4Z"
                                fill="currentColor"
                            />

                            <path
                                d="M17 9L21 13M21 9L17 13"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                    ) : (

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M4 9V15H8L13 19V5L8 9H4Z"
                                fill="currentColor"
                            />

                            <path
                                d="M16 9C17.2 10.2 17.2 13.8 16 15"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                            />

                            <path
                                d="M18.5 6.5C21.5 9.5 21.5 14.5 18.5 17.5"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                            />
                        </svg>
                    )}
                </button>

                {/* FULLSCREEN */}
                <button
                    type="button"
                    className="video_button video_fullscreen_button"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
                >
                    {isFullscreen ? (
                        // EXIT FULLSCREEN
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M9 4V8C9 8.55 8.55 9 8 9H4M15 4V8C15 8.55 15.45 9 16 9H20M9 20V16C9 15.45 8.55 15 8 15H4M15 20V16C15 15.45 15.45 15 16 15H20"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    ) : (
                        // ENTER FULLSCREEN
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M4 9V5C4 4.45 4.45 4 5 4H9M15 4H19C19.55 4 20 4.45 20 5V9M20 15V19C20 19.55 19.55 20 19 20H15M9 20H5C4.45 20 4 19.55 4 19V15"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </button>

                {/* PROGRESS */}
                <div
                    ref={progressBarRef}
                    className={`video_progress${isScrubbing ? " is_scrubbing" : ""}`}
                    role="slider"
                    tabIndex={0}
                    aria-label="Video progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={0}
                    onPointerDown={handleProgressPointerDown}
                    onPointerMove={handleProgressPointerMove}
                    onPointerUp={handleProgressPointerUp}
                    onPointerCancel={handleProgressPointerUp}
                    onKeyDown={handleProgressKeyDown}
                >
                    <div className="video_progress_track">
                        <div ref={progressFillRef} className="video_progress_fill"/>
                    </div>
                </div>

            </motion.div>
            <div className="bottom_lines_wrapper">
                <img
                    src={bottom_lines.src}
                    alt=""
                    className="bottom_lines_video_block"
                />
            </div>
        </div>
    );
};

export default MainVideoComponent;