"use client";

import Image from "next/image";
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

type DynamicLinesMaskProps = {
    src: string;
    className?: string;
};

const TARGETS = [
    {
        selector: ".algo_label",
        padding: 0,
        rounded: true,
    },
    {
        selector: ".main_block_theme",
        padding: 3,
        rounded: false,
    },
    {
        selector: ".main_block_description",
        padding: 3,
        rounded: false,
    },
    {
        selector: ".main_block_button",
        padding: 0,
        rounded: true,
    },
];

const DynamicLinesMask = ({
                              src,
                              className = "top_lines_images",
                          }: DynamicLinesMaskProps) => {
    const imageRef = useRef<HTMLImageElement>(null);

    const [maskUrl, setMaskUrl] =
        useState<string>("");

    const rebuildMask =
        useCallback(() => {
            const image =
                imageRef.current;

            if (!image) {
                return;
            }

            const hero =
                image.closest(
                    ".main_block_new"
                ) as HTMLElement | null;

            if (!hero) {
                return;
            }

            const imageRect =
                image.getBoundingClientRect();

            if (
                !imageRect.width ||
                !imageRect.height
            ) {
                return;
            }

            const dpr =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );

            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width =
                Math.max(
                    1,
                    Math.round(
                        imageRect.width * dpr
                    )
                );

            canvas.height =
                Math.max(
                    1,
                    Math.round(
                        imageRect.height * dpr
                    )
                );

            const ctx =
                canvas.getContext("2d");

            if (!ctx) {
                return;
            }

            ctx.scale(
                dpr,
                dpr
            );

            /*
                Белая область mask =
                картинка линий видна.
            */
            ctx.fillStyle =
                "#FFFFFF";

            ctx.fillRect(
                0,
                0,
                imageRect.width,
                imageRect.height
            );

            TARGETS.forEach(
                ({
                     selector,
                     padding,
                     rounded,
                 }) => {
                    const target =
                        hero.querySelector(
                            selector
                        ) as HTMLElement | null;

                    if (!target) {
                        return;
                    }

                    const rect =
                        target
                            .getBoundingClientRect();

                    /*
                        Берём пересечение
                        UI-элемента и картинки линий.
                    */
                    const left =
                        Math.max(
                            imageRect.left,
                            rect.left -
                            padding
                        );

                    const top =
                        Math.max(
                            imageRect.top,
                            rect.top -
                            padding
                        );

                    const right =
                        Math.min(
                            imageRect.right,
                            rect.right +
                            padding
                        );

                    const bottom =
                        Math.min(
                            imageRect.bottom,
                            rect.bottom +
                            padding
                        );

                    if (
                        right <= left ||
                        bottom <= top
                    ) {
                        return;
                    }

                    const x =
                        left -
                        imageRect.left;

                    const y =
                        top -
                        imageRect.top;

                    const width =
                        right -
                        left;

                    const height =
                        bottom -
                        top;

                    /*
                        Для плашки и кнопки
                        вырезаем rounded rect.
                    */
                    if (rounded) {
                        const styles =
                            window
                                .getComputedStyle(
                                    target
                                );

                        const cssRadius =
                            parseFloat(
                                styles
                                    .borderTopLeftRadius
                            ) || 0;

                        const radius =
                            Math.min(
                                cssRadius,
                                height / 2,
                                width / 2
                            );

                        ctx.save();

                        ctx.globalCompositeOperation =
                            "destination-out";

                        ctx.beginPath();

                        ctx.roundRect(
                            x,
                            y,
                            width,
                            height,
                            radius
                        );

                        ctx.fill();

                        ctx.restore();
                    } else {
                        /*
                            Для обычного текста
                            прямоугольная зона.
                        */
                        ctx.clearRect(
                            x,
                            y,
                            width,
                            height
                        );
                    }
                }
            );

            const url =
                canvas.toDataURL(
                    "image/png"
                );

            setMaskUrl(
                url
            );

        }, []);

    useEffect(() => {
        const image =
            imageRef.current;

        if (!image) {
            return;
        }

        const hero =
            image.closest(
                ".main_block_new"
            ) as HTMLElement | null;

        if (!hero) {
            return;
        }

        let raf = 0;

        const scheduleRebuild =
            () => {
                cancelAnimationFrame(
                    raf
                );

                raf =
                    requestAnimationFrame(
                        () => {
                            rebuildMask();
                        }
                    );
            };

        const resizeObserver =
            new ResizeObserver(
                scheduleRebuild
            );

        /*
            Следим за hero.
        */
        resizeObserver.observe(
            hero
        );

        /*
            Следим за самой картинкой.
        */
        resizeObserver.observe(
            image
        );

        /*
            Следим за UI-элементами.

            Если кнопка увеличилась на hover
            или изменился размер текста —
            mask пересчитывается автоматически.
        */
        TARGETS.forEach(
            ({ selector }) => {
                const target =
                    hero.querySelector(
                        selector
                    );

                if (target) {
                    resizeObserver.observe(
                        target
                    );
                }
            }
        );

        window.addEventListener(
            "resize",
            scheduleRebuild,
            {
                passive: true,
            }
        );

        image.addEventListener(
            "load",
            scheduleRebuild
        );

        /*
            Первый расчёт.
        */
        scheduleRebuild();

        /*
            После загрузки шрифтов
            текст может поменять размер.
        */
        if (document.fonts?.ready) {
            document.fonts
                .ready
                .then(
                    scheduleRebuild
                )
                .catch(
                    () => {}
                );
        }

        return () => {
            cancelAnimationFrame(
                raf
            );

            resizeObserver
                .disconnect();

            window.removeEventListener(
                "resize",
                scheduleRebuild
            );

            image.removeEventListener(
                "load",
                scheduleRebuild
            );
        };
    }, [rebuildMask]);

    const maskStyle =
        maskUrl
            ? ({
                WebkitMaskImage:
                    `url("${maskUrl}")`,

                maskImage:
                    `url("${maskUrl}")`,

                WebkitMaskRepeat:
                    "no-repeat",

                maskRepeat:
                    "no-repeat",

                WebkitMaskSize:
                    "100% 100%",

                maskSize:
                    "100% 100%",

                WebkitMaskPosition:
                    "center",

                maskPosition:
                    "center",

            } as React.CSSProperties)

            : undefined;

    return (
        <Image
            ref={imageRef}
            src={src}
            alt=""
            draggable={false}
            className={className}
            style={maskStyle}
        />
    );
};

export default DynamicLinesMask;