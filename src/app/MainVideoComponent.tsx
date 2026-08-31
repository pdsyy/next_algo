"use client";

import React, {useEffect, useRef, useState} from "react";
import Image from "next/image";
import top_lines from "./images/video_block_top_lines.svg";
import bottom_lines from "./images/bottom_lines_video_block.svg";
import {HTMLMotionProps, motion} from "framer-motion";

const MainVideoComponent = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        const container = containerRef.current;
        const video = videoRef.current;

        if (!container || !video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    video
                        .play()
                        .then(() => setIsPlaying(true))
                        .catch(() => setIsPlaying(false));
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

        return () => observer.disconnect();
    }, []);

    const togglePlay = () => {
        const video = videoRef.current;

        if (!video) return;

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

    const toggleMute = () => {
        const video = videoRef.current;

        if (!video) return;

        video.muted = !video.muted;
        setIsMuted(video.muted);
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

            <motion.div className="main_container_video_block" {...fadeUp}>

                <video
                    ref={videoRef}
                    src="/Algo%20World%20—%20Official%20Teaser%20Trailer.mp4"
                    muted
                    playsInline
                    preload="auto"
                    className="main_video"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
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
                        // SOUND ON
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