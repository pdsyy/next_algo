"use client"
import React, {useEffect, useRef, useState} from 'react';
import lines from "./images/bottom_lines.svg"
import Image from "next/image";
import track_record_main from "./images/track_record_main.png"
import first_step_bg from "./images/first_trade_bg.png"
import first_step_bg_mobile from "./images/first_step_bg_mobile.png"
import clock_icon from "./images/clock_icon.svg"
import market_image1 from "./images/market_image1.png"
import market_image2 from "./images/market_image2.png"
import market_image3 from "./images/market_image3.png"
import market_image4 from "./images/market_image4.png"
import market_image5 from "./images/market_image5.png"
import market_image6 from "./images/market_image6.png"
import market_image7 from "./images/market_image7.png"
import market_image8 from "./images/market_image8.png"
import market_image9 from "./images/market_image9.png"
import market_image10 from "./images/market_image10.png"
import market_image11 from "./images/market_image11.png"
import mql_pl from "./images/mql_pl.svg"
import mql5_2x from "./images/mql_f.png"
import metaTrader_icon from "./images/metaTrader_icon_light.svg"
import mql5_light from "./images/mql5_light.svg"
import users_profit from "./images/users_profit_img.png"
import t_record_image1 from "./images/t_record_image1.svg"
import t_record_image2 from "./images/t_record_image2.svg"
import t_record_image3 from "./images/t_record_image3.svg"
import firstDealItem1 from "./images/firstDealItem1.svg"
import firstDealItem2 from "./images/firstDealImage2.svg"
import firstDealItem3 from "./images/firstDealImage3.svg"
import firstDealItem4 from "./images/firstDealImage4.svg"
import effectiveImage1 from "./images/effectiveImage1.png"
import effectiveImage2 from "./images/effectiveImage2.png"
import effectiveImage3 from "./images/effectiveImage3.png"
import effectiveImage4 from "./images/effectiveImage4.png"

import bot_item2 from "./images/bot_item1_1.png"
import bot_item1 from "./images/bot_item2_1.png"
import bot_item3 from "./images/bot_item3_1.png"
import prev_arrow from "./images/prev-arrow.svg"
import next_arrow from "./images/next-arrow.svg"
import review_image1 from "./images/review_image1.png"
import review_image2 from "./images/review_image2.png"
import review_image3 from "./images/review_image3.png"
import review_image4 from "./images/review_image4.png"
import review_image5 from "./images/review_image5.png"
import review_image6 from "./images/review_image6.png"
import circles_bg from "./images/circles.svg"
import select_bot_img from "./images/algo_p_image.png"
import avatars_icon from "./images/avatars_icon.png"
import select_bot_img_mob from "./images/select_bot_img_mob1.png"
import lines_top from "./images/top_lines.svg"
import algo_main_image from "./images/algo_main_image.png"

import {Swiper, SwiperSlide} from "swiper/react";
import {Pagination} from "swiper/modules";
import 'swiper/css/pagination';

import "swiper/css";
import "swiper/css/navigation";
import {useScroll} from "@/context/ScrollContext";
import {AnimatePresence, HTMLMotionProps, motion, useTransform, useScroll as useCustomScroll} from "framer-motion"
import {useLanguage} from "@/context/LanguageProvider";
import PopupBot from "@/components/PopupBot";
import AnimatedNumber from "@/components/AnimatedNumber";
import logo from "@/app/images/logo.svg";
import tg_icon from "@/app/images/tg_icon.svg";
import youtube_icon from "@/app/images/youtube_icon.svg";
import HeroBlock from "@/app/Hero";
import AlgoReveal from "@/app/AlgoReveal";
import MainVideoComponent from "@/app/MainVideoComponent";
import TestButton from "@/app/TestButton";
import TestPaymentButton from "@/app/TestButton";
import ImageMagnifier from "@/components/lensImage/ImageMagnifier";
import Footer from "@/components/Footer";
import CartExample from "@/components/cartPopup/CartExample";

const MotionImage = motion.create(Image);

const FIRST_DEAL_STEP_TIMES = [0.55, 1.83, 3.54, 4.96] as const;

const MainPage = ({activePopup, setActivePopup}: any) => {

    const [zoom, setZoom] = useState(0)


    const [isMobile, setIsMobile] = useState(false);
    const [activeTrackRecord, setActiveTrackRecord] = useState(0);
    const [visibleFirstDealSteps, setVisibleFirstDealSteps] = useState(0);
    const [isTrackRecordPaused, setIsTrackRecordPaused] =
        useState(false);
    useEffect(() => {
        const updateViewport = () => {
            const mobile = window.innerWidth < 768;

            setIsMobile(mobile);
            setZoom(mobile ? 2.8 : 1.6);
        };

        updateViewport();
        window.addEventListener("resize", updateViewport);

        return () => {
            window.removeEventListener("resize", updateViewport);
        };
    }, []);
    const {t, language, setLanguage} = useLanguage();


    useEffect(() => {
        if (isTrackRecordPaused) return;

        const timer = window.setInterval(() => {
            setActiveTrackRecord(current =>
                (current + 1) % 3
            );
        }, 3000);

        return () => {
            window.clearInterval(timer);
        };
    }, [isTrackRecordPaused]);



    useEffect(() => {
        if (window.location.hash) {
            const id = window.location.hash.replace('#', '');

            window.addEventListener("DOMContentLoaded", () => {
                const element = document.getElementById(id);
                if (element) {
                    const elementHeight = element.offsetHeight;
                    const windowHeight = window.innerHeight;
                    const headerOffset = 80;

                    if (elementHeight > windowHeight * 0.8) {
                        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                        window.scrollTo({
                            top: elementPosition - headerOffset,
                            behavior: 'smooth'
                        });
                    } else {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }
            })
        }
    }, []);

    const {scrollToSection} = useScroll()!;

    const boxRef: any = useRef(null);
    const handleMouseMove = (e: any) => {
        if (!boxRef.current) return;
        const {innerWidth, innerHeight} = window;
        const x = (e.clientX / innerWidth) - 0.5;
        const y = (e.clientY / innerHeight) - 0.5;
        const moveX = x * 60;
        const moveY = y * 60;
        boxRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };


    const bot_images = [bot_item1, bot_item2, bot_item3];

    const botsList = [...t.home.botsList]
        .sort((a, b) => {

            const isAeroA = a.name.toLowerCase().includes('aero ea');
            const isAeroB = b.name.toLowerCase().includes('aero ea');

            if (isAeroA) return -1;
            if (isAeroB) return 1;
            return 0;
        })
        .map((bot: any, index: number) => ({
            ...bot,
            image: bot_images[index]
        }));

    const reviews_images = [review_image1, review_image2, review_image3, review_image4, review_image5, review_image6];

    const reviews = t.home.reviewsList.map((review: any, index: number) => ({
        ...review,
        image: reviews_images[index]
    }));


    const swiperRef: any = useRef(null);

    const [openFaqs, setOpenFaqs]: any = useState([]);

    const faqElements = t.home.faq;


    const fastEase = [0.25, 0.1, 0.25, 1.0] as const;

    const pointVariants: any = {
        hidden: {
            opacity: 0,
            y: 20,
            rotate: 0.001
        },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: fastEase
            }
        })
    };

    const fadeNumeric: HTMLMotionProps<any> = {
        initial: "hidden",
        whileInView: "visible",
        viewport: {once: true, amount: 0.1},
        variants: pointVariants
    };

    const baseTransition: any = {duration: 0.7, ease: fastEase};
    const baseViewport = {once: true, amount: 0.1};

    const fadeUp: HTMLMotionProps<any> = {
        initial: {opacity: 0, y: 30, translateZ: 0},
        whileInView: {opacity: 1, y: 0, translateZ: 0},
        viewport: baseViewport,
        transition: baseTransition
    };


    const fadeLeft: HTMLMotionProps<any> = {
        initial: {opacity: 0, x: -40, translateZ: 0},
        whileInView: {opacity: 1, x: 0, translateZ: 0},
        viewport: baseViewport,
        transition: baseTransition
    };

    const fadeRight: HTMLMotionProps<any> = {
        initial: {opacity: 0, x: 40, translateZ: 0},
        whileInView: {opacity: 1, x: 0, translateZ: 0},
        viewport: baseViewport,
        transition: baseTransition
    };

    const marketImages = [
        market_image1, market_image2, market_image3, market_image4, market_image5, market_image6,
        market_image7, market_image8, market_image9, market_image10, market_image11
    ];

    const [isActive, setIsActive] = useState(false)

    const bot_info_popup = {
        bot_info: t.prop.botInfoPopup.botInfo,
        bot_name: t.prop.botInfoPopup.botName,
        bot_price: t.prop.botInfoPopup.botPrice
    };

    /*const containerRef = useRef<HTMLDivElement>(null);

    const {scrollYProgress} = useCustomScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    } as any);

    const width = useTransform(scrollYProgress, [0, 0.9], ["554px", "1344px"]);

*/


    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMoveAlgo = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        const el = containerRef.current;

        if (!el) return;

        const rect = el.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        el.style.setProperty("--mouse-x", `${x}px`);
        el.style.setProperty("--mouse-y", `${y}px`);
    };


    const videoBgRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoBgRef.current;

        if (!video) return;

        let hasStarted = false;
        let revealedSteps = 0;
        let animationFrameId: number | null = null;

        const syncStepsWithVideo = () => {
            animationFrameId = null;

            const nextRevealedSteps = FIRST_DEAL_STEP_TIMES.reduce(
                (count, time) => count + Number(video.currentTime >= time),
                0,
            );

            if (nextRevealedSteps !== revealedSteps) {
                revealedSteps = nextRevealedSteps;
                setVisibleFirstDealSteps(nextRevealedSteps);
            }

            if (!video.paused && !video.ended) {
                animationFrameId = window.requestAnimationFrame(
                    syncStepsWithVideo,
                );
            }
        };

        const startStepSync = () => {
            if (animationFrameId === null) {
                animationFrameId = window.requestAnimationFrame(
                    syncStepsWithVideo,
                );
            }
        };

        const finishStepSync = () => {
            revealedSteps = FIRST_DEAL_STEP_TIMES.length;
            setVisibleFirstDealSteps(FIRST_DEAL_STEP_TIMES.length);

            if (animationFrameId !== null) {
                window.cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        };

        video.addEventListener("play", startStepSync);
        video.addEventListener("ended", finishStepSync);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    !hasStarted
                ) {
                    hasStarted = true;

                    video.currentTime = 0;
                    revealedSteps = 0;
                    setVisibleFirstDealSteps(0);

                    video.play().catch(error => {
                        console.error(
                            "VIDEO PLAY ERROR:",
                            error,
                        );
                    });

                    observer.unobserve(video);
                }
            },
            {
                threshold: 0.4,
            },
        );

        observer.observe(video);

        return () => {
            observer.disconnect();

            video.removeEventListener("play", startStepSync);
            video.removeEventListener("ended", finishStepSync);

            if (animationFrameId !== null) {
                window.cancelAnimationFrame(animationFrameId);
            }

            video.pause();
        };
    }, []);

    const firstDealStepAnimation = (
        index: number,
    ): HTMLMotionProps<any> => {
        if (isMobile) {
            return {
                initial: false,
                animate: {
                    opacity: 1,
                    y: 0,
                },
                transition: {
                    duration: 0,
                },
            };
        }

        return {
            initial: {
                opacity: 0,
                y: 36,
            },
            animate:
                visibleFirstDealSteps > index
                    ? {
                        opacity: 1,
                        y: 0,
                    }
                    : {
                        opacity: 0,
                        y: 36,
                    },
            transition: {
                duration: 0.45,
                ease: fastEase,
            },
        };
    };


    return (

        <div className="main_page">

            {/* <SEO
            title="ALGO — Алгоритмічна торгівля та торгові боти"
            description="Автоматизовані торгові боти з прозорою статистикою. Пасивний дохід на трейдингу без людського фактора. Оберіть свій алгоритм: Terra, Aero або Hydro EA."
            keywords="трейдинг боти, алгоритмічна торгівля, пасивний дохід, Terra EA, Aero EA, Hydro EA, торгові роботи Україна, автоматизація трейдингу"
            image={preview}
        />*/}
            <PopupBot
                bot _info={bot_info_popup.bot_info}
                bot_name={bot_info_popup.bot_name}
                price={bot_info_popup.bot_price}
                isActive={isActive}
                setIsActive={setIsActive}
                activeThx={activePopup}
                setActiveThx={setActivePopup}
                isDark={true}
            />


            <HeroBlock linesTopSrc={lines_top} avatarsSrc={avatars_icon} scrollToSection={scrollToSection}/>

            <div className="main_page_content">


                <div className="about_us_block">
                    <motion.div className="market_list" {...fadeUp}>
                        <div className="motion_block_anim">


                            {[...Array(12)].map((_, i) => (
                                <img
                                    key={i}
                                    src={marketImages[i % 11].src}
                                    alt={`market-${i}`}
                                    className={`market-${i}`}
                                />
                            ))}
                        </div>
                    </motion.div>

                    <motion.h2 className="our_main_advantages" {...fadeUp}
                               dangerouslySetInnerHTML={{__html: t.home.stats.title}}/>

                    <div className="our_advantages_list">
                        {t.home.stats.items.map((item: any, index: number) => (
                            <motion.div key={index} className="advantages_point" {...fadeNumeric} custom={index + 1}>
                                <div className="advantages_point_number"><AnimatedNumber value={item.num}
                                                                                         duration={index !== 3 ? 1 : 2}
                                                                                         delay={index * 0.1}/></div>
                                <div className="advantages_point_desc">{item.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
                {/*  <CartExample
                    language={language}
                    onCheckout={() => {}}
                />*/}

                <MainVideoComponent/>
                {/*<TestPaymentButton/>*/}


                {/*<div className="money_in_management">
                    <motion.div className="money_in_management_number" {...fadeUp}>
                        {isMobile ? "200 000$" : <AnimatedNumber value="200 000$" duration={2.5}/>}
                    </motion.div>
                    <motion.div className="in_management" {...fadeUp}>
                        {t.home.stats.management}
                    </motion.div>
                </div>

                <div className="video_demonstration">
                    <motion.div className="video_text" {...fadeLeft}>
                        <h2>
                            {t.home.mainVideoText}
                        </h2>
                        <div className="select_bot_desc">
                            {t.home.mainVideoDesc}
                        </div>
                        <a onClick = {() => {
                            scrollToSection("catalog")
                        }}>
                            <div className="consult_button">{t.home.mainVideoButton}</div>
                        </a>
                    </motion.div>
                    <motion.div className="video_block" {...fadeRight}>
                        <iframe
                            key={isPlaying ? "playing" : "stopped"}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                background: isPlaying ? "black" : "",
                                borderRadius: isPlaying ? "24px" : "32px"
                            }}
                            src={isPlaying
                                ? "https://www.youtube.com/embed/zH1KVCrpSm0?autoplay=1&mute=0&si=oCgsWa31-1ZkLTj1"
                                : "about:blank"
                            }
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>

                        <AnimatePresence>
                            {!isPlaying && (
                                <motion.div
                                    key="cover"
                                    initial={{opacity: 1}}
                                    exit={{opacity: 0, scale: 1.05}}
                                    transition={{duration: 0.5, ease: "easeInOut"}}
                                    className="video_cover_wrapper"
                                    onClick={handlePlay}
                                >
                                    <Image src={video_preview_main} priority style={{height: "100%"}} alt="Video Cover"/>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>*/}

                {/*isMobile ?
                    <div className="trailer_main_page">
                        <motion.h2 {...fadeUp}>
                            {t.home.trailer}
                        </motion.h2>

                        <motion.div className="trailer_video_block" {...fadeRight}>

                            <iframe
                                key={isPlaying ? "playing" : "stopped"}
                                style={{width: '100%', height: '100%', border: 'none'}}
                                src={
                                    isPlaying
                                        ? "https://www.youtube.com/embed/zH1KVCrpSm0?autoplay=1&mute=0&si=oCgsWa31-1ZkLTj1"
                                        : "about:blank"
                                }
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />

                            <AnimatePresence>
                                {!isPlaying && (
                                    <motion.div
                                        key="cover"
                                        initial={{opacity: 1}}
                                        exit={{opacity: 0, scale: 1.05}}
                                        transition={{duration: 0.5, ease: "easeInOut"}}
                                        className="video_cover_wrapper"
                                        onClick={handlePlay}
                                    >
                                        <img src={trailer_preview.src} alt="Video Cover" loading="lazy"/>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div> : <div ref={containerRef} className="video_container_main">
                        <div className="sticky_video_block">

                            <motion.h2 {...fadeUp} style={{marginBottom: "20px"}}>
                                {t.home.trailer}
                            </motion.h2>

                            <motion.div
                                className="trailer_video_block"
                                style={{
                                    width,
                                    overflow: "hidden",
                                    aspectRatio: "16/9",
                                    background: isPlaying ? "#000" : "none"
                                }}
                                {...fadeRight}
                            >
                                <iframe
                                    key={isPlaying ? "playing" : "stopped"}
                                    style={{width: '100%', height: '100%', border: 'none'}}
                                    src={
                                        isPlaying
                                            ? "https://www.youtube.com/embed/zH1KVCrpSm0?autoplay=1&mute=0&si=oCgsWa31-1ZkLTj1"
                                            : "about:blank"
                                    }
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />

                                <AnimatePresence>
                                    {!isPlaying && (
                                        <motion.div
                                            key="cover"
                                            initial={{opacity: 1}}
                                            exit={{opacity: 0, scale: 1.05}}
                                            transition={{duration: 0.5, ease: "easeInOut"}}
                                            className="video_cover_wrapper"
                                            onClick={handlePlay}
                                            style={{position: 'absolute', inset: 0, cursor: 'pointer'}}
                                        >
                                            <img src={trailer_preview.src} alt="Video Cover" loading="lazy"
                                                 style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                        </div>
                    </div>*/}


                {/*<motion.div className="main_page_mql5_fs" {...fadeUp}>
                    <div className="main_page_mql5">
                        <div className="mql_info">
                            <div className="meta_trader_badge">
                                <img src={metaTrader_icon.src} alt="Meta Trader Icon"/>
                                Metatrader
                            </div>
                            <div className="mql5_block_title">
                                {t.mql5.title}
                            </div>
                            <div className="mql5_block_description"
                                 dangerouslySetInnerHTML={{__html: t.mql5.description}}/>
                            <a className="open_mql5_black"
                               href="https://www.mql5.com/en/users/ferwer31234/news"
                               target="_blank"
                               rel="noopener noreferrer">
                                {t.buttons.openMql}
                            </a>
                        </div>
                        <Image src={mql5_2x} className="mql5_big_image" alt="mql5_logo"/>
                    </div>
                </motion.div>*/}
                <div className="track_record_container_gradient">
                    <div className="track_record_container"  onMouseEnter={() =>
                        setIsTrackRecordPaused(true)
                    }
                         onMouseLeave={() =>
                             setIsTrackRecordPaused(false)
                         }>
                        <div className="track_record_container_grid">

                            <div className="track_record_info">
                                <div className="track_record_caption">
                                    {t.trackRecord.title}
                                </div>

                                <div className="track_record_desc">
                                    {t.trackRecord.desc}
                                </div>

                                {[
                                    {
                                        id: "consistent-results",
                                        image: t_record_image1,
                                        title: t.trackRecord.consistentResults.title,
                                        description: t.trackRecord.consistentResults.desc,
                                    },
                                    {
                                        id: "low-drawdown",
                                        image: t_record_image2,
                                        title: t.trackRecord.lowDrawdown.title,
                                        description: t.trackRecord.lowDrawdown.desc,
                                    },
                                    {
                                        id: "verified",
                                        image: t_record_image3,
                                        title: t.trackRecord.verified.title,
                                        description: t.trackRecord.verified.desc,
                                    },
                                ].map((item, index) => {
                                    const isActive = activeTrackRecord === index;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`track_record_item ${
                                                isActive ? "magnifier_active" : ""
                                            }`}
                                            onClick={() => setActiveTrackRecord(index)}
                                        >
                                            <div className="track_record_item_name">
                                                <Image src={item.image} alt=""/>
                                                {item.title}
                                            </div>

                                            <div className="track_record_item_desc">
                                                {item.description}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="track_record_image_container">

                                <ImageMagnifier
                                    src={track_record_main.src}
                                    alt="Myfxbook trading statistics"
                                    zoom={zoom}
                                    lensSize={160}
                                    activeMagnifierItem={activeTrackRecord}
                                />
                            </div>

                        </div>

                        <a
                            className="myfxbook_button"
                            href="https://www.myfxbook.com/members/alg0_o"
                            target="_blank"
                        >
                            {t.trackRecord.button}
                        </a>
                    </div>
                </div>

                <div className="effective_algorithm" id="advantages">
                    <motion.h2 {...fadeUp} dangerouslySetInnerHTML={{__html: t.home.effective.title}}/>

                    <div className="effective_points first">
                        {t.home.effective.items.slice(0, 2).map((item: any, index: number) => (
                            <motion.div key={index}
                                        className="effective_point" {...(index === 0 ? fadeLeft : fadeRight)}>
                                <img src={index === 0 ? effectiveImage1.src : effectiveImage2.src} alt=""/>
                                <div className="name">{item.title}</div>
                                <div className="desc">{item.desc}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="effective_points second">
                        {t.home.effective.items.slice(2, 4).map((item: any, index: number) => (
                            <motion.div key={index + 2}
                                        className="effective_point" {...(index === 0 ? fadeLeft : fadeRight)}>
                                <img src={index === 0 ? effectiveImage3.src : effectiveImage4.src} alt=""/>
                                <div className="name">{item.title}</div>
                                <div className="desc">{item.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>


                <div className="first_deal_block" id="how-it-works">
                    <motion.h2 {...fadeUp} dangerouslySetInnerHTML={{__html: t.home.steps.title}}/>
                    <video
                        ref = {videoBgRef}
                        src="/videos/hf_2.mp4"
                        poster = "/journey_video_poster.jpg"
                        muted
                        playsInline
                        preload = "auto"
                        className="first_step_bg mob_none"
                    />

                    <Image src={first_step_bg_mobile} alt="" className="first_step_bg desk_none"/>
                    <motion.div
                        className="step_container choose_algorithm"
                        {...firstDealStepAnimation(0)}
                    >
                        <div className="step_name">
                            {t.steps.chooseAlgorithm.title}
                        </div>

                        <div className="step_desc">
                            {t.steps.chooseAlgorithm.desc}
                        </div>
                    </motion.div>

                    <motion.div
                        className="step_container connect"
                        {...firstDealStepAnimation(1)}
                    >
                        <div className="step_name">
                            {t.steps.connect.title}
                        </div>

                        <div className="step_desc">
                            {t.steps.connect.desc}
                        </div>
                    </motion.div>

                    <motion.div
                        className="step_container autonomous_trading"
                        {...firstDealStepAnimation(2)}
                    >
                        <div className="step_name">
                            {t.steps.autonomousTrading.title}
                        </div>

                        <div className="step_desc">
                            {t.steps.autonomousTrading.desc}
                        </div>
                    </motion.div>

                    <motion.div
                        className="step_container monitoring"
                        {...firstDealStepAnimation(3)}
                    >
                        <div className="step_name">
                            {t.steps.monitoring.title}
                        </div>

                        <div className="step_desc">
                            {t.steps.monitoring.desc}
                        </div>
                    </motion.div>
                    {/*<div className="first_deal_details">
                        <motion.div className="first_deal_image" {...fadeLeft}>
                            <img src={users_profit.src} alt=""/>
                        </motion.div>

                        <motion.div className="first_deal_block_list" {...fadeRight}>
                            {t.home.steps.items.map((step: any, index: number) => (
                                <div className="first_deal_item_gradient" key={index}>
                                    <div className="first_deal_item">
                                        <div className="item_name">
                                            <img
                                                src={index === 0 ? firstDealItem1.src : index === 1 ? firstDealItem2.src : index === 2 ? firstDealItem3.src : firstDealItem4.src}
                                                alt=""/>
                                            {step.title}
                                            <div className="item_number">0{index + 1}</div>
                                        </div>
                                        <div className="item_desc">{step.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>*/}


                </div>

                <div className="bots_catalog" id="catalog">
                    <motion.h2 {...fadeUp}>
                        {t.home.catalog.title}
                    </motion.h2>

                    <div className="bots_list">
                        {botsList.map((el: any, idx: number) => {
                                return !isMobile ?
                                    <motion.div className={`bot_gradient_border ${el.name !== "Aero EA" ? "coming_soon" : ""}`} key={idx} {...fadeNumeric} custom={idx}>
                                        <div className="bot_item">
                                            {/*el.name === "Aero EA" ? <img src={mql_pl.src} alt="" className="mql_pl"/> : ""*/}
                                            <div className="bot_image">
                                                {/*el.prop && <div className="prop_pl">{t.home.catalog.propLabel}</div>*/}
                                                <img src={el.image.src} alt={el.name}/>
                                                {/*{el.paying && <div className="paying_pl">{t.home.catalog.payingLabel}</div>}*/}
                                            </div>
                                            <div className="bot_name">{el.name}</div>
                                            <div className="bot_description">{el.description}</div>
                                            <div className="bot_advantages">
                                                <div className="advantages_item">
                                                    <div className="advantages_name">Year profit</div>
                                                    <div className="advantages_numbers">{el.advantages.yearProfit}</div>
                                                </div>
                                                <div className="advantages_item">
                                                    <div className="advantages_name">Max drawdown</div>
                                                    <div className="advantages_numbers">{el.advantages.maxDrawDown}</div>
                                                </div>
                                                <div className="advantages_item">
                                                    <div className="advantages_name">Winrate</div>
                                                    <div className="advantages_numbers">{el.advantages.winRate}</div>
                                                </div>
                                            </div>

                                            <div className="bot_price_block">
                                                <div className="bot_price_text">{t.terra.buy.price}</div>
                                                <div className="bot_price">

                                                    {el.name !== "Aero EA" ?
                                                        <a className="blur_price">{el.price}</a> : el.price}
                                                    <span>USD</span>
                                                </div>
                                            </div>
                                            {el.name === "Aero EA" ?
                                            <div className="bot_marquee">
                                                <div className="bot_marquee_group">
                                                    <span>One-time payment · Lifetime access · All updates included · One-time payment · Lifetime access · </span>
                                                </div>

                                            </div> : ""}

                                            <a href={el.name === "Aero EA" ? el.href : ""}>
                                                <div className="bot_more_details">
                                                    {el.name === "Aero EA" ? t.home.catalog.moreDetails : t.home.catalog.comingSoon}
                                                </div>
                                            </a>
                                            {el.name !== "Aero EA" ?
                                                <div className = "coming_soon_label liquidGlass-wrapper">
                                                    <div className="liquidGlass-effect"></div>
                                                    <div className="liquidGlass-tint"></div>
                                                    <div className="liquidGlass-text">{t.home.catalog.comingSoon} <img src = {clock_icon.src} alt = ""/></div>

                                                    <svg style={{position: 'absolute', width: 0, height: 0, pointerEvents: 'none'}} aria-hidden="true">
                                                        <filter
                                                            id="glass-distortion"
                                                            x="-20%"
                                                            y="-20%"
                                                            width="140%"
                                                            height="140%"
                                                            filterUnits="objectBoundingBox"
                                                        >
                                                            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="2" seed="5"
                                                                          result="turbulence"/>
                                                            <feComponentTransfer in="turbulence" result="mapped">
                                                                <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5"/>
                                                                <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"/>
                                                                <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"/>
                                                            </feComponentTransfer>
                                                            <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap"/>
                                                            <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100"
                                                                                lightingColor="white" result="specLight">
                                                                <fePointLight x="-200" y="-200" z="300"/>
                                                            </feSpecularLighting>
                                                            <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage"/>
                                                            <feDisplacementMap in="SourceGraphic" in2="softMap" scale="50" xChannelSelector="R"
                                                                               yChannelSelector="G"/>
                                                        </filter>
                                                    </svg>
                                                     </div>
                                                : ""}


                                        </div>
                                    </motion.div>
                                    :

                                    <div className={`bot_gradient_border ${el.name !== "Aero EA" ? "coming_soon" : ""}`} key={idx}>
                                        <div className="bot_item">
                                            {/*el.name === "Aero EA" ? <img src={mql_pl.src} alt="" className="mql_pl"/> : ""*/}
                                            <div className="bot_image">
                                                {/*el.prop && <div className="prop_pl">{t.home.catalog.propLabel}</div>*/}
                                                <img src={el.image.src} alt={el.name}/>
                                                {/*{el.paying && <div className="paying_pl">{t.home.catalog.payingLabel}</div>}*/}
                                            </div>
                                            <div className="bot_name">{el.name}</div>
                                            <div className="bot_description">{el.description}</div>
                                            <div className="bot_advantages">
                                                <div className="advantages_item">
                                                    <div className="advantages_name">Year profit</div>
                                                    <div className="advantages_numbers">{el.advantages.yearProfit}</div>
                                                </div>
                                                <div className="advantages_item">
                                                    <div className="advantages_name">Max drawdown</div>
                                                    <div className="advantages_numbers">{el.advantages.maxDrawDown}</div>
                                                </div>
                                                <div className="advantages_item">
                                                    <div className="advantages_name">Winrate</div>
                                                    <div className="advantages_numbers">{el.advantages.winRate}</div>
                                                </div>
                                            </div>

                                            <div className="bot_price_block">
                                                <div className="bot_price_text">{t.terra.buy.price}</div>
                                                <div className="bot_price">

                                                    {el.name !== "Aero EA" ?
                                                        <a className="blur_price">{el.price}</a> : el.price}
                                                    <span>USD</span>
                                                </div>
                                            </div>

                                            {el.name === "Aero EA" ?
                                                <div className="bot_marquee">
                                                    <div className="bot_marquee_group">
                                                        <span>{el.oneTimePayment} · {el.lifetimeAccess} · {el.allUpdatesIncluded} · {el.oneTimePayment} · {el.lifetimeAccess} · {el.allUpdatesIncluded}</span>
                                                    </div>

                                                </div> : ""}


                                            <a href={el.name === "Aero EA" ? el.href : ""}>
                                                <div className="bot_more_details">
                                                    {el.name === "Aero EA" ? t.home.catalog.moreDetails : t.home.catalog.comingSoon}
                                                </div>
                                            </a>
                                            {el.name !== "Aero EA" ?
                                                <div className = "coming_soon_label liquidGlass-wrapper">
                                                    <div className="liquidGlass-effect"></div>
                                                    <div className="liquidGlass-tint"></div>
                                                    <div className="liquidGlass-text">{t.home.catalog.comingSoon} <img src = {clock_icon.src} alt = ""/></div>

                                                    <svg style={{position: 'absolute', width: 0, height: 0, pointerEvents: 'none'}} aria-hidden="true">
                                                        <filter
                                                            id="glass-distortion"
                                                            x="-20%"
                                                            y="-20%"
                                                            width="140%"
                                                            height="140%"
                                                            filterUnits="objectBoundingBox"
                                                        >
                                                            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="2" seed="5"
                                                                          result="turbulence"/>
                                                            <feComponentTransfer in="turbulence" result="mapped">
                                                                <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5"/>
                                                                <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"/>
                                                                <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"/>
                                                            </feComponentTransfer>
                                                            <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap"/>
                                                            <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100"
                                                                                lightingColor="white" result="specLight">
                                                                <fePointLight x="-200" y="-200" z="300"/>
                                                            </feSpecularLighting>
                                                            <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage"/>
                                                            <feDisplacementMap in="SourceGraphic" in2="softMap" scale="50" xChannelSelector="R"
                                                                               yChannelSelector="G"/>
                                                        </filter>
                                                    </svg>
                                                </div>
                                                : ""}

                                        </div>
                                    </div>
                            }
                        )}
                    </div>
                </div>

                <div className="algo_feedback_block" id="reviews">
                    <div className="feedback_h2">
                        <motion.h2 {...fadeUp}>
                            <span>{t.home.reviews.titleAccent}</span> {t.home.reviews.title}
                        </motion.h2>
                        <div className="reviews_nav">
                            <div className="nav-btn prev" onClick={() => swiperRef.current?.slidePrev()}>
                                <img src={prev_arrow.src} alt=""/>
                            </div>
                            <div className="nav-btn next" onClick={() => swiperRef.current?.slideNext()}>
                                <img src={next_arrow.src} alt=""/>
                            </div>
                        </div>
                    </div>

                    <motion.div className="slider-container" {...fadeUp}>
                        <Swiper
                            loop
                            modules={[Pagination]}
                            pagination={{clickable: true, el: '.custom-pagination'}}
                            spaceBetween={24}
                            slidesPerView={3}
                            onBeforeInit={(swiper: any) => {
                                swiperRef.current = swiper;
                            }}
                            breakpoints={{
                                0: {slidesPerView: 1},
                                768: {slidesPerView: 2},
                                1024: {slidesPerView: 3},
                            }}
                        >
                            {reviews.map((review: any, i: number) => (
                                <SwiperSlide key={i} className="review_item">
                                    <img src={review.image.src} alt=""/>
                                    <div className="review_author">{review.name}</div>
                                    <div className="review_description">{review.text}</div>
                                </SwiperSlide>
                            ))}
                            <div className="custom-pagination"></div>
                        </Swiper>
                    </motion.div>

                    <div className="center-btn">
                        <a href="https://t.me/+ZjmgYnV_mh9jOGMy" target="_blank" rel="noreferrer">
                            <div className="more_reviews_button">
                                {t.terra.reviews1.more}
                            </div>
                        </a>
                    </div>
                </div>

                <div className="faq_container" id="faq">
                    <motion.h2 {...fadeUp}>
                        {t.home.faqTitle}
                    </motion.h2>
                    <div className="faq_list">
                        <div className="bg_circles_faq">
                            <img src={circles_bg.src} alt=""/>
                        </div>
                        <div className="faq_questions_list">
                            {faqElements.map((el: any, index: number) => {
                                const isOpen = openFaqs.includes(index);

                                return (
                                    <motion.div
                                        key={index}
                                        className={`faq_item ${isOpen ? "open_faq" : ""}`}
                                        {...fadeNumeric}
                                        custom={index}
                                    >
                                        <div className="faq_item_question" onClick={() => {
                                            setOpenFaqs((prev: any) =>
                                                isOpen
                                                    ? prev.filter((i: number) => i !== index)
                                                    : [...prev, index]
                                            );
                                        }}>
                                            {el.question}

                                            <div className="cross_block">
                                                <div className="minus"></div>
                                                <div className="plus"></div>
                                            </div>
                                        </div>

                                        <div className="faq_item_answer">
                                            {el.answer}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <motion.div className="select_bot_fs" {...fadeUp}>
                    <div className="select_bot_block">
                        <div className="select_bot_info">
                            <div className="select_bot_theme">
                                {t.home.consult.title}
                            </div>
                            <div className="select_bot_desc">
                                {t.home.consult.desc}
                            </div>
                            <a href="https://telegram.me/vladimirbabak_mql" target="_blank" rel="noreferrer">
                                <div className="consult_button">
                                    {t.home.consult.button}
                                </div>
                            </a>
                        </div>
                        {/*<picture>
                            <source media="(max-width: 767px)" srcSet={select_bot_img_mob.src}/>
                            <source media="(min-width: 768px)" srcSet={select_bot_img.src}/>
                            <img src={select_bot_img.src} alt="Consultation" className="main_img"/>
                        </picture>*/}
                        <img src={select_bot_img.src} alt="Consultation" className="main_img"/>
                    </div>
                </motion.div>

                <Footer/>
                <Image src={lines} alt="" className="bottom_lines"/>


            </div>
        </div>
    );
};

export default MainPage;