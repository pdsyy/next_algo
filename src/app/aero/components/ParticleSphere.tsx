"use client";

import { useEffect, useRef } from "react";

interface ParticleSphereProps {
    color?: string;
    hoverRadius?: number;
    pushStrength?: number;
    radiusScale?: number;
    count?: number;
}

type Coordinate = [number, number];

interface SpherePoint {
    x: number;
    y: number;
    z: number;
    size: number;
    opacity: number;
    phase: number;
    speed: number;
}

// Упрощённые контуры: долгота, широта.
const LAND: Coordinate[][] = [
    // Северная Америка
    [
        [-168, 66], [-150, 72], [-125, 72], [-110, 80],
        [-85, 73], [-60, 53], [-53, 47], [-65, 44],
        [-80, 25], [-88, 18], [-100, 17], [-115, 30],
        [-125, 49], [-145, 58], [-168, 60],
    ],
    // Центральная Америка
    [
        [-100, 22], [-88, 21], [-84, 15], [-77, 8],
        [-82, 7], [-90, 15],
    ],
    // Южная Америка
    [
        [-81, 12], [-70, 12], [-60, 8], [-50, 3],
        [-35, -6], [-40, -22], [-52, -35], [-66, -55],
        [-74, -48], [-73, -25], [-81, -5],
    ],
    // Гренландия
    [
        [-60, 60], [-44, 59], [-20, 70],
        [-25, 82], [-48, 84], [-65, 75],
    ],
    // Европа и Азия
    [
        [-10, 36], [-10, 44], [-5, 49], [8, 55],
        [5, 62], [20, 71], [40, 68], [65, 73],
        [100, 77], [140, 72], [178, 66], [178, 55],
        [155, 50], [145, 43], [132, 42], [125, 32],
        [120, 23], [108, 18], [108, 10], [100, 1],
        [95, 6], [92, 22], [80, 8], [73, 20],
        [65, 25], [56, 25], [50, 15], [43, 13],
        [35, 30], [28, 40], [20, 39], [15, 36],
        [10, 44], [2, 42],
    ],
    // Африка
    [
        [-17, 36], [0, 37], [12, 33], [25, 32],
        [35, 30], [43, 12], [51, 11], [42, -5],
        [35, -20], [28, -34], [18, -35], [12, -18],
        [8, -4], [-2, 5], [-14, 7], [-17, 20],
    ],
    // Австралия
    [
        [113, -22], [122, -14], [136, -12], [143, -11],
        [153, -25], [150, -37], [135, -35],
        [124, -34], [114, -27],
    ],
    // Мадагаскар
    [
        [48, -13], [51, -16], [47, -26], [44, -24],
    ],
    // Япония
    [
        [130, 31], [135, 34], [141, 41],
        [145, 44], [143, 36], [136, 32],
    ],
    // Индонезия
    [
        [95, 5], [108, -3], [119, -4], [130, -3],
        [141, -6], [141, -10], [120, -10], [105, -7],
    ],
    // Новая Зеландия
    [
        [166, -46], [172, -41], [178, -35],
        [178, -40], [170, -47],
    ],
];

function insidePolygon(
    longitude: number,
    latitude: number,
    polygon: Coordinate[]
) {
    let inside = false;

    for (
        let i = 0, j = polygon.length - 1;
        i < polygon.length;
        j = i++
    ) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];

        const intersects =
            yi > latitude !== yj > latitude &&
            longitude <
            ((xj - xi) * (latitude - yi)) / (yj - yi) + xi;

        if (intersects) inside = !inside;
    }

    return inside;
}

const ParticleSphere = ({
                            color = "#858585",
                            hoverRadius = 80,
                            pushStrength = 20,
                            radiusScale = 0.46,
                            count = 18000,
                        }: ParticleSphereProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Одинаковое распределение при повторном монтировании.
        let seed = 73921;

        const random = () => {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            return seed / 4294967296;
        };

        const points: SpherePoint[] = [];
        const candidates = Math.max(1, Math.floor(count));

        for (let i = 0; i < candidates; i++) {
            const longitude = random() * 360 - 180;
            const latitude =
                (Math.asin(random() * 2 - 1) * 180) / Math.PI;

            const isLand =
                latitude < -72 ||
                LAND.some((polygon) =>
                    insidePolygon(longitude, latitude, polygon)
                );

            const lon = (longitude * Math.PI) / 180;
            const lat = (latitude * Math.PI) / 180;
            const cosLat = Math.cos(lat);

            const x = cosLat * Math.sin(lon);
            const y = Math.sin(lat);
            const z = cosLat * Math.cos(lon);

            const pattern =
                Math.sin(x * 11 + Math.sin(z * 7) * 1.2) +
                Math.sin(y * 13 + Math.sin(x * 6) * 1.1) * 0.65 +
                Math.sin(z * 9 + y * 5) * 0.35;

            const isGap = Math.abs(pattern) < 0.075;

            if (random() > (isGap ? 0.08 : 0.94)) continue;

            points.push({
                x,
                y,
                z,
                size: 1 + random() * 0.85,
                opacity: isGap
                    ? 0.2 + random() * 0.15
                    : 0.6 + random() * 0.4,
                phase: random() * Math.PI * 2,
                speed: 0.3 + random() * 0.7,
            });
        }

        let width = 0;
        let height = 0;
        let frameId = 0;
        let lastTime = 0;
        let lastDrawTime = 0;
        let running = false;
        let inViewport = false;

        const frameInterval = 1000 / 30;
        let elapsed = 0;

        // Начальный вид: Европа, Африка и Азия.
        let angle = -0.45;
        let mouseX = -9999;
        let mouseY = -9999;

        const tilt = -0.25;
        const tiltCos = Math.cos(tilt);
        const tiltSin = Math.sin(tilt);

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

            width = rect.width;
            height = rect.height;

            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const move = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();

            mouseX = event.clientX - rect.left;
            mouseY = event.clientY - rect.top;
        };

        const leave = () => {
            mouseX = -9999;
            mouseY = -9999;
        };

        const draw = (timestamp: number) => {
            if (!running) return;

            frameId = requestAnimationFrame(draw);

            if (timestamp - lastDrawTime < frameInterval) return;

            lastDrawTime =
                timestamp - ((timestamp - lastDrawTime) % frameInterval);

            const dt = lastTime
                ? Math.min((timestamp - lastTime) / 1000, 0.1)
                : 0;

            lastTime = timestamp;
            elapsed += dt;
            angle += dt * 0.048;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = color;


            const radius = width * radiusScale;
            const centerX = width / 2;
            const centerY = radius + 35;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            for (const point of points) {
                const rotatedX = point.x * cos + point.z * sin;
                const rotatedZ = -point.x * sin + point.z * cos;

                const y = point.y * tiltCos - rotatedZ * tiltSin;
                const z = point.y * tiltSin + rotatedZ * tiltCos;

                // Показываем переднюю поверхность,
                // чтобы задние материки не просвечивали.
                if (z <= 0) continue;

                let screenX = centerX + rotatedX * radius;
                let screenY = centerY - y * radius;

                const dx = screenX - mouseX;
                const dy = screenY - mouseY;
                const distance = Math.hypot(dx, dy);

                if (distance > 0 && distance < hoverRadius) {
                    const push =
                        (1 - distance / hoverRadius) * pushStrength;

                    screenX += (dx / distance) * push;
                    screenY += (dy / distance) * push;
                }

                if (
                    screenX < -5 ||
                    screenX > width + 5 ||
                    screenY < -5 ||
                    screenY > height + 5
                ) {
                    continue;
                }

                const shimmer =
                    0.95 +
                    0.05 *
                    Math.sin(elapsed * point.speed + point.phase);

                const edgeFade = Math.min(1, z / 0.025);

                ctx.globalAlpha =
                    point.opacity *
                    (0.75 + z * 0.25) *
                    edgeFade *
                    shimmer;

                ctx.beginPath();
                ctx.arc(
                    screenX,
                    screenY,
                    point.size * 1.25 * (0.75 + z * 0.25),
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            ctx.globalAlpha = 1;
        };

        const stop = () => {
            running = false;
            cancelAnimationFrame(frameId);
            lastTime = 0;
            lastDrawTime = 0;
            leave();
        };

        const updateAnimation = () => {
            const shouldRun =
                inViewport &&
                !document.hidden &&
                width > 0 &&
                height > 0;

            if (!shouldRun) {
                stop();
                return;
            }

            if (running) return;

            running = true;
            lastTime = 0;
            lastDrawTime = 0;
            frameId = requestAnimationFrame(draw);
        };

        const resizeObserver = new ResizeObserver(() => {
            resize();
            updateAnimation();
        });

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                inViewport = entry.isIntersecting;
                updateAnimation();
            },
            { threshold: 0 }
        );

        const handleMove = (event: MouseEvent) => {
            if (running) move(event);
        };

        resize();
        resizeObserver.observe(canvas);
        intersectionObserver.observe(canvas);

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("blur", leave);
        document.documentElement.addEventListener("mouseleave", leave);
        document.addEventListener("visibilitychange", updateAnimation);

        return () => {
            stop();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();

            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("blur", leave);
            document.documentElement.removeEventListener(
                "mouseleave",
                leave
            );
            document.removeEventListener(
                "visibilitychange",
                updateAnimation
            );
        };
    }, [color, hoverRadius, pushStrength, radiusScale, count]);

    return (
        <canvas
            ref={canvasRef}
            className="particle_sphere_canvas"
            aria-hidden="true"
        />
    );
};

export default ParticleSphere;