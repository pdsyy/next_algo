"use client";

import "./style.css";

import React, {
    type PointerEvent,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

type ImageMagnifierProps = {
    src: string;
    alt?: string;
    zoom?: number;
    lensSize?: number;
    activeMagnifierItem?: number;
};

type LensPosition = {
    /*
     * Относительные координаты от 0 до 1.
     *
     * x: 0   — левый край
     * x: 0.5 — центр
     * x: 1   — правый край
     *
     * y работает аналогично.
     */
    x: number;
    y: number;
};

type ContainerSize = {
    width: number;
    height: number;
};

/*
 * Эти координаты нужно настроить только один раз.
 * Они будут одинаково работать на компьютере и телефоне.
 */
const LENS_POSITIONS: Record<number, LensPosition> = {
    0: { x: 0.223, y: 0.439 },
    1: { x: 0.225, y: 0.598 },
    2: { x: 0.079, y: 0.048 },
};

/*
 * Сколько миллисекунд курсор «не мешает» анимации после смены карточки.
 * Должно быть не меньше, чем длительность transition линзы в style.css.
 */
const LENS_ANIMATION_MS = 700;

const clamp = (
    value: number,
    minimum: number,
    maximum: number,
) => {
    return Math.max(minimum, Math.min(value, maximum));
};

const ImageMagnifier = ({src, alt = "", zoom = 1.6, lensSize = 160, activeMagnifierItem = 0}: ImageMagnifierProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const moveFrameRef = useRef<number | null>(null);
    const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [containerSize, setContainerSize] =
        useState<ContainerSize>({
            width: 1,
            height: 1,
        });

    const [lensPosition, setLensPosition] =
        useState<LensPosition>(
            LENS_POSITIONS[activeMagnifierItem] ??
            LENS_POSITIONS[0],
        );

    const [isPointerActive, setIsPointerActive] =
        useState(false);

    /*
     * Идёт анимация перехода к карточке.
     * Пока она идёт, курсор не двигает линзу,
     * а CSS-transition остаётся включённым.
     */
    const [isAnimating, setIsAnimating] =
        useState(false);

    const stopAnimation = () => {
        if (animationTimerRef.current !== null) {
            clearTimeout(animationTimerRef.current);
            animationTimerRef.current = null;
        }

        setIsAnimating(false);
    };

    /*
     * Меняем положение линзы при выборе карточки.
     * Анимация проигрывается, даже если курсор сейчас над картинкой.
     */
    useEffect(() => {
        const nextPosition =
            LENS_POSITIONS[activeMagnifierItem] ??
            LENS_POSITIONS[0];

        // отменяем отложенное обновление от курсора, чтобы оно не перебило анимацию
        if (moveFrameRef.current !== null) {
            cancelAnimationFrame(moveFrameRef.current);
            moveFrameRef.current = null;
        }

        if (animationTimerRef.current !== null) {
            clearTimeout(animationTimerRef.current);
        }

        setIsAnimating(true);
        setLensPosition(nextPosition);

        animationTimerRef.current = setTimeout(() => {
            animationTimerRef.current = null;
            setIsAnimating(false);
        }, LENS_ANIMATION_MS);
    }, [activeMagnifierItem]);

    /*
     * Отслеживаем реальный размер изображения.
     * ResizeObserver сработает и при переходе
     * с компьютерной версии на мобильную.
     */
    useLayoutEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const updateContainerSize = () => {
            const rect = container.getBoundingClientRect();

            setContainerSize((currentSize) => {
                if (
                    currentSize.width === rect.width &&
                    currentSize.height === rect.height
                ) {
                    return currentSize;
                }

                return {
                    width: rect.width,
                    height: rect.height,
                };
            });
        };

        updateContainerSize();

        const resizeObserver = new ResizeObserver(
            updateContainerSize,
        );

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    /*
     * Очищаем запланированное обновление позиции и таймер анимации.
     */
    useEffect(() => {
        return () => {
            if (moveFrameRef.current !== null) {
                cancelAnimationFrame(moveFrameRef.current);
            }

            if (animationTimerRef.current !== null) {
                clearTimeout(animationTimerRef.current);
            }
        };
    }, []);

    const updateLensPosition = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const rect = container.getBoundingClientRect();

        /*
         * Координаты сохраняются не в пикселях,
         * а относительно ширины и высоты контейнера.
         */
        const relativeX = clamp(
            (event.clientX - rect.left) / rect.width,
            0,
            1,
        );

        const relativeY = clamp(
            (event.clientY - rect.top) / rect.height,
            0,
            1,
        );

        if (moveFrameRef.current !== null) {
            cancelAnimationFrame(moveFrameRef.current);
        }

        moveFrameRef.current = requestAnimationFrame(() => {
            setLensPosition({
                x: relativeX,
                y: relativeY,
            });

            moveFrameRef.current = null;
        });
    };

    const handlePointerDown = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        event.currentTarget.setPointerCapture(
            event.pointerId,
        );

        // явное нажатие прерывает анимацию и отдаёт управление пользователю
        stopAnimation();

        setIsPointerActive(true);
        updateLensPosition(event);
    };

    const handlePointerMove = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        // во время анимации движение курсора не должно перебивать её
        if (isAnimating) {
            return;
        }

        updateLensPosition(event);
    };

    const handlePointerUp = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId,
            )
        ) {
            event.currentTarget.releasePointerCapture(
                event.pointerId,
            );
        }

        setIsPointerActive(
            event.pointerType === "mouse" &&
            event.currentTarget.matches(":hover"),
        );
    };

    /*
     * Переводим относительные координаты
     * в пиксели текущего контейнера.
     */
    const lensX =
        lensPosition.x * containerSize.width;

    const lensY =
        lensPosition.y * containerSize.height;

    const backgroundWidth =
        containerSize.width * zoom;

    const backgroundHeight =
        containerSize.height * zoom;

    const backgroundX =
        lensSize / 2 - lensX * zoom;

    const backgroundY =
        lensSize / 2 - lensY * zoom;

    /*
     * Класс "pointer" (без transition, линза мгновенно следует за курсором)
     * включаем только когда анимация не идёт.
     */
    const isFollowingPointer =
        isPointerActive && !isAnimating;

    return (
        <div
            ref={containerRef}
            className="image_magnifier"
            onPointerEnter={() => {
                setIsPointerActive(true);
            }}
            onPointerLeave={(event) => {
                if (
                    !event.currentTarget.hasPointerCapture(
                        event.pointerId,
                    )
                ) {
                    setIsPointerActive(false);
                }
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
                setIsPointerActive(false);
            }}
        >
            <img
                src={src}
                alt={alt}
                draggable={false}
                className="image_magnifier_source"
            />

            <div
                className={`image_magnifier_lens ${
                    isFollowingPointer
                        ? "image_magnifier_lens_pointer"
                        : ""
                }`}
                style={{
                    width: lensSize,
                    height: lensSize,

                    left: lensX,
                    top: lensY,

                    backgroundImage: `url("${src}")`,

                    backgroundSize:
                        `${backgroundWidth}px ${backgroundHeight}px`,

                    backgroundPosition:
                        `${backgroundX}px ${backgroundY}px`,
                }}
            >
                <span className="image_magnifier_glare" />
            </div>
        </div>
    );
};

export default ImageMagnifier;