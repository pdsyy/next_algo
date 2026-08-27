"use client";

import Image from "next/image";
import {
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import AlgoReveal from "./AlgoReveal";

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

const MainHero = ({
                      linesTopSrc,
                      avatarsSrc,
                      scrollToSection,
                  }: MainHeroProps) => {

    const heroRef =
        useRef<HTMLDivElement>(null);

    const avatarsSlotRef =
        useRef<HTMLSpanElement>(null);

    const buttonRef =
        useRef<HTMLButtonElement>(null);

    const [avatarPosition, setAvatarPosition] =
        useState<AvatarPosition | null>(null);


    /*
        Настоящие avatars находятся ВНЕ difference-layer.

        Внутри кнопки остаётся только невидимая копия,
        которая резервирует правильное место.

        По её реальному DOM-положению располагаем
        нормальную картинку поверх blend-layer.
    */

    const updateAvatarPosition =
        useCallback(() => {

            const hero =
                heroRef.current;

            const slot =
                avatarsSlotRef.current;

            if (
                !hero ||
                !slot
            ) {
                return;
            }

            const heroRect =
                hero.getBoundingClientRect();

            const slotRect =
                slot.getBoundingClientRect();

            setAvatarPosition({
                left:
                    slotRect.left -
                    heroRect.left,

                top:
                    slotRect.top -
                    heroRect.top,

                width:
                slotRect.width,

                height:
                slotRect.height,
            });

        }, []);


    useLayoutEffect(() => {

        const hero =
            heroRef.current;

        const slot =
            avatarsSlotRef.current;

        const button =
            buttonRef.current;

        if (
            !hero ||
            !slot ||
            !button
        ) {
            return;
        }


        let raf = 0;


        const scheduleUpdate =
            () => {

                cancelAnimationFrame(
                    raf
                );

                raf =
                    requestAnimationFrame(
                        updateAvatarPosition
                    );

            };


        const resizeObserver =
            new ResizeObserver(
                scheduleUpdate
            );


        resizeObserver.observe(
            hero
        );

        resizeObserver.observe(
            slot
        );

        resizeObserver.observe(
            button
        );


        window.addEventListener(
            "resize",
            scheduleUpdate,
            {
                passive: true,
            }
        );


        /*
            После загрузки шрифта размеры текста
            и кнопки могут немного измениться.
        */

        if (
            document.fonts?.ready
        ) {

            document.fonts
                .ready
                .then(
                    scheduleUpdate
                )
                .catch(
                    () => {}
                );
        }


        scheduleUpdate();


        return () => {

            cancelAnimationFrame(
                raf
            );

            resizeObserver.disconnect();

            window.removeEventListener(
                "resize",
                scheduleUpdate
            );

        };

    }, [
        updateAvatarPosition,
    ]);


    return (

        <div
            ref={heroRef}
            className="main_block_new"
        >

            {/* =========================
                FLUID
            ========================== */}

            <AlgoReveal />


            {/* =========================
                ЕДИНЫЙ DIFFERENCE LAYER

                Внутри:
                - реальная картинка сетки
                - ALGO
                - заголовок
                - описание
                - кнопка

                Поэтому сетка больше не прорезает
                текст отдельным blend-слоем.
            ========================== */}

            <div className="hero_blend_layer">

                <Image
                    src={linesTopSrc}
                    alt=""
                    draggable={false}
                    className="top_lines_images"
                />


                <div className="main_block_info">

                    {/* ALGO */}

                    <div className="algo_label">

                        <span className="algo_label_text">
                            ALGO
                        </span>

                    </div>


                    {/* TITLE */}

                    <div className="main_block_theme">

                        Автоматизована

                        <br />

                        торгівля нового рівня

                    </div>


                    {/* DESCRIPTION */}

                    <div className="main_block_description">

                        Торгові боти, які торгують 24/7

                        <br />

                        Чіткі стратегії.
                        Прогнозована дохідність.
                        Роки живої торгівлі.

                    </div>


                    {/* BUTTON */}

                    <button
                        ref={buttonRef}
                        type="button"
                        className="main_block_button"
                        onClick={() =>
                            scrollToSection(
                                "catalog"
                            )
                        }
                    >

                        <span className="main_button_text">
                            Обери бота
                        </span>


                        {/*
                            Невидимая копия только резервирует
                            точный размер твоего изображения.

                            Она находится внутри difference,
                            но opacity:0, поэтому визуально
                            ничего не рисует.
                        */}

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
                            +200 вже з нами
                        </span>

                    </button>

                </div>

            </div>


            {/* =========================
                НАСТОЯЩИЕ AVATARS

                Они находятся ВНЕ hero_blend_layer,
                следовательно difference их вообще
                не касается.
            ========================== */}

            {
                avatarPosition && (

                    <Image
                        src={avatarsSrc}
                        alt=""
                        className="avatars_overlay"

                        style={{
                            left:
                            avatarPosition.left,

                            top:
                            avatarPosition.top,

                            width:
                            avatarPosition.width,

                            height:
                            avatarPosition.height,
                        }}
                    />

                )
            }

        </div>
    );
};


export default MainHero;