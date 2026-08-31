"use client";
import "./style.css"

import React, {
    PointerEvent,
    useRef,
    useState,
} from "react";

type ImageMagnifierProps = {
    src: string;
    alt?: string;
    zoom?: number;
    lensSize?: number;
};

type LensPosition = {
    x: number;
    y: number;
};

const ImageMagnifier = ({
                            src,
                            alt = "",
                            zoom = 1.8,
                            lensSize = 160,
                        }: ImageMagnifierProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [lensPosition, setLensPosition] =
        useState<LensPosition>({
            x: 70,
            y: 106,
        });

    const [isMoving, setIsMoving] =
        useState(false);

    const updateLensPosition = (
        event: PointerEvent<HTMLDivElement>
    ) => {
        const container =
            containerRef.current;

        if (!container) {
            return;
        }

        const rect =
            container.getBoundingClientRect();

        const rawX =
            event.clientX - rect.left;

        const rawY =
            event.clientY - rect.top;

        /*
            Центр линзы теперь может доходить
            непосредственно до краёв изображения.
        */
        const x =
            Math.max(
                0,
                Math.min(rawX, rect.width)
            );

        const y =
            Math.max(
                0,
                Math.min(rawY, rect.height)
            );

        setLensPosition({
            x,
            y,
        });
    };

    const handlePointerDown = (
        event: PointerEvent<HTMLDivElement>
    ) => {
        event.currentTarget.setPointerCapture(
            event.pointerId
        );

        setIsMoving(true);
        updateLensPosition(event);
    };

    const handlePointerMove = (
        event: PointerEvent<HTMLDivElement>
    ) => {


        updateLensPosition(event);
    };

    const handlePointerUp = (
        event: PointerEvent<HTMLDivElement>
    ) => {
        event.currentTarget.releasePointerCapture(
            event.pointerId
        );

        setIsMoving(false);
    };

    const container =
        containerRef.current;

    const containerWidth =
        container?.clientWidth ?? 1;

    const containerHeight =
        container?.clientHeight ?? 1;

    const backgroundWidth =
        containerWidth * zoom;

    const backgroundHeight =
        containerHeight * zoom;

    const backgroundX =
        lensSize / 2 -
        lensPosition.x * zoom;

    const backgroundY =
        lensSize / 2 -
        lensPosition.y * zoom;

    return (
        <div
            ref={containerRef}
            className="image_magnifier"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() =>
                setIsMoving(false)
            }
        >
            <img
                src={src}
                alt={alt}
                draggable={false}
                className="image_magnifier_source"
            />

            <div
                className="image_magnifier_lens"
                style={{
                    width: lensSize,
                    height: lensSize,

                    left: lensPosition.x,
                    top: lensPosition.y,

                    backgroundImage:
                        `url("${src}")`,

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