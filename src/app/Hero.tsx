"use client";

import Image from "next/image";
import {
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { useLanguage } from "@/context/LanguageProvider";
import AlgoRevealDynamic from "@/app/AlgoRevealDynamic";

import mobileHeroImage from "@/app/images/Gemini_Generated_Image_ufalucufalucufal 3 (1).png";

type MainHeroProps = {
    linesTopSrc: string;
    avatarsSrc: any;
    scrollToSection: (id: string) => void;
};

type AvatarPosition = {
    left: number;
    top: number;
    width: number;
    height: number;
};

const MOBILE_MEDIA_QUERY = "(max-width: 768px)";

const MainHero = ({
                      linesTopSrc,
                      avatarsSrc,
                      scrollToSection,
                  }: MainHeroProps) => {
    const { t } = useLanguage()!;

    const heroRef = useRef<HTMLDivElement>(null);
    const avatarsSlotRef = useRef<HTMLSpanElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    /*
     * Начальное значение true важно:
     * сервер сначала отдаёт статичную картинку.
     * Поэтому на мобильном анимация и видео не успеют загрузиться.
     */
    const [isMobile, setIsMobile] = useState(true);

    const [avatarPosition, setAvatarPosition] =
        useState<AvatarPosition | null>(null);

    useLayoutEffect(() => {
        const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

        const updateDeviceType = () => {
            setIsMobile(mediaQuery.matches);
        };

        updateDeviceType();

        mediaQuery.addEventListener("change", updateDeviceType);

        return () => {
            mediaQuery.removeEventListener("change", updateDeviceType);
        };
    }, []);

    const updateAvatarPosition = useCallback(() => {
        const hero = heroRef.current;
        const slot = avatarsSlotRef.current;

        if (!hero || !slot) {
            return;
        }

        const heroRect = hero.getBoundingClientRect();
        const slotRect = slot.getBoundingClientRect();

        setAvatarPosition({
            left: slotRect.left - heroRect.left,
            top: slotRect.top - heroRect.top,
            width: slotRect.width,
            height: slotRect.height,
        });
    }, []);

    useLayoutEffect(() => {
        /*
         * На мобильном не запускаем ResizeObserver,
         * requestAnimationFrame и расчёты позиции аватаров.
         */
        if (isMobile) {
            return;
        }

        const hero = heroRef.current;
        const slot = avatarsSlotRef.current;
        const button = buttonRef.current;

        if (!hero || !slot || !button) {
            return;
        }

        let raf = 0;
        let disposed = false;

        const scheduleUpdate = () => {
            if (disposed) {
                return;
            }

            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(updateAvatarPosition);
        };

        const resizeObserver = new ResizeObserver(scheduleUpdate);

        resizeObserver.observe(hero);
        resizeObserver.observe(slot);
        resizeObserver.observe(button);

        window.addEventListener("resize", scheduleUpdate, {
            passive: true,
        });

        if (document.fonts?.ready) {
            document.fonts.ready
                .then(scheduleUpdate)
                .catch(() => {});
        }

        scheduleUpdate();

        return () => {
            disposed = true;

            cancelAnimationFrame(raf);
            resizeObserver.disconnect();

            window.removeEventListener("resize", scheduleUpdate);
        };
    }, [isMobile, updateAvatarPosition]);

    return (
        <div
            ref={heroRef}
            className="main_block_new"
        >
            {/* Анимация загружается только на планшете/компьютере */}
            {!isMobile && <AlgoRevealDynamic />}

            <div className="hero_blend_layer">
                <Image
                    src={linesTopSrc}
                    alt=""
                    draggable={false}
                    className="top_lines_images"
                />

                <div className="main_block_info">
                    <div className="algo_label">
                        <span className="algo_label_text">
                            ALGO
                        </span>
                    </div>

                    <div
                        className="main_block_theme"
                        dangerouslySetInnerHTML={{
                            __html: t.automaticTrade,
                        }}
                    />

                    <div
                        className="main_block_description"
                        dangerouslySetInnerHTML={{
                            __html: t.heroDescription,
                        }}
                    />

                    <button
                        ref={buttonRef}
                        type="button"
                        className="main_block_button"
                        onClick={() => scrollToSection("catalog")}
                    >
                        <span className="main_button_text">
                            {t.buttons.selectBot}
                        </span>

                        <span
                            ref={avatarsSlotRef}
                            className="avatars_slot"
                        >
                            <Image
                                src={avatarsSrc}
                                alt=""
                                className="avatars_measure"
                            />
                        </span>

                        <span className="main_button_text">
                            {t.qWithUs}
                        </span>
                    </button>
                </div>
            </div>

            {/* На мобильном вместо видео выводится обычная картинка */}
            {isMobile && (
                <div
                    className="mobile_hero_static"
                    aria-hidden="true"
                >
                    <Image
                        src={mobileHeroImage}
                        alt=""
                        draggable={false}
                        priority
                        sizes="100vw"
                        className="mobile_hero_static_image"
                    />
                </div>
            )}

            {/* Позиционируемый слой аватаров нужен только на компьютере */}
            {!isMobile && avatarPosition && (
                <Image
                    src={avatarsSrc}
                    alt=""
                    className="avatars_overlay"
                    style={{
                        left: avatarPosition.left,
                        top: avatarPosition.top,
                        width: avatarPosition.width,
                        height: avatarPosition.height,
                    }}
                />
            )}
        </div>
    );
};

export default MainHero;