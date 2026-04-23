"use client"
import React, {useContext, useEffect, useRef, useState} from 'react';
import advantageIcon1 from "./images/strategyIconGreen1.svg"
import advantageIcon2 from "./images/advantage_icon_green2.svg"
import advantageIcon3 from "./images/connection_icon_green3.svg"
import advantageIcon4 from "./images/connection_icon2.svg"
import advantageIcon5 from "./images/bot_icon_green.svg"
import last_block_img from "./images/buying_block_img.png"
import how_to_image from "./images/how_to_image.png"
import prev_arrow from "../images/prev-arrow.svg";
import next_arrow from "../images/next-arrow.svg";
import {Swiper, SwiperSlide} from "swiper/react";
import review_image2 from "./images/reviewImage2.png";
import review_image3 from "./images/reviewImage3.png";
import review_image4 from "./images/reviewImage4.png";
import review_image5 from "./images/reviewImage5.png";
import test_image from "./images/test_image3.png";
import logo from "./images/logoLight.svg";
import hydroPreview from "./images/hydroPreview.png";
import PopupBot from "@/components/PopupBot";
import {Pagination} from "swiper/modules";
import {AnimatePresence, HTMLMotionProps, motion} from "framer-motion";
import preview from "../images/logo192.png"
import {useLanguage} from "@/context/LanguageProvider";
import CalculatorSectionProp from "@/components/CalculatorSectionProp";
import tg_icon from "../images/tg_icon.svg";
import instagram_icon from "../images/insta_icon.svg";
import youtube_icon from "../images/youtube_icon.svg";
import circles_bg from "./images/circles.svg";
import {ThemeContext} from "@/context/ThemeContext";
import {useThxContext} from "@/context/ThxContext";

const PropPage = () => {
    const {activePopup, setActivePopup} = useThxContext()
    const [isMobile, setIsMobile] = useState(false);
    const {setDarkTheme} = useContext(ThemeContext);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        setDarkTheme(true)
    }, [])
    const {t} = useLanguage()!;

    const reviews_images = [review_image2, review_image3, review_image4, review_image5];


    const [isActive, setIsActive] = useState(false)

    const bot_info_popup = {
        bot_info: t.prop.botInfoPopup.botInfo,
        bot_name: t.prop.botInfoPopup.botName,
        bot_price: t.prop.botInfoPopup.botPrice
    };


    const swiperRef:any = useRef(null);


    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(true);
    };

    const fastEase = [0.25, 0.1, 0.25, 1.0];

    const pointVariants:any = {
        hidden: {
            opacity: 0,
            y: 20,
            rotate: 0.001
        },
        visible: (i:any) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: fastEase
            }
        })
    };

    const fadeNumeric:HTMLMotionProps<any> = {
        initial: "hidden",
        whileInView: "visible",
        viewport: {once: true, amount: 0.1},
        variants: pointVariants
    };

    const baseTransition:any = {duration: 0.7, ease: fastEase};
    const baseViewport = {once: true, amount: 0.1};

    const fadeUp:HTMLMotionProps<any> = {
        initial: {opacity: 0, y: 30, translateZ: 0},
        whileInView: {opacity: 1, y: 0, translateZ: 0},
        viewport: baseViewport,
        transition: baseTransition
    };

    const fadeLeft:HTMLMotionProps<any> = {
        initial: {opacity: 0, x: -40, translateZ: 0},
        whileInView: {opacity: 1, x: 0, translateZ: 0},
        viewport: baseViewport,
        transition: baseTransition
    };

    const fadeRight:HTMLMotionProps<any> = {
        initial: {opacity: 0, x: 40, translateZ: 0},
        whileInView: {opacity: 1, x: 0, translateZ: 0},
        viewport: baseViewport,
        transition: baseTransition
    };

    const [openFaqs, setOpenFaqs]:any = useState([]);

    const faqElements = t.prop.faq;

    return (
        <div className="product_page prop_bot">
            {/*<SEO
                title={t.prop.seo.title}
                description={t.prop.seo.description}
                keywords={t.prop.seo.keywords}
                image={preview}
            />*/}
            <PopupBot
                bot_info={bot_info_popup.bot_info}
                bot_name={bot_info_popup.bot_name}
                price={bot_info_popup.bot_price}
                isActive={isActive}
                setIsActive={setIsActive}
                activeThx={activePopup}
                setActiveThx={setActivePopup}
                isDark={true}
            />
            <div className="bot_info_main">
                <motion.div className="main_video_block" {...fadeLeft}>
                    <video
                        src="/images/propVideo.mp4"
                        autoPlay
                        muted
                        loop
                        preload="metadata"
                        playsInline
                        className="my-video-class"
                    >
                        {t.hydro.hero.videoFallback}
                    </video>
                </motion.div>
                <div className="product_info_main">
                    <motion.div className="product_name" {...fadeNumeric} custom={1}>
                        {t.prop.hero.botName}
                    </motion.div>
                    <div className="best_offer_container">
                        <div className="best_offer">
                            {t.prop.hero.bestOffer}
                        </div>
                        <div className="first_month_free">
                            {t.prop.hero.freeMonth}
                        </div>
                    </div>
                    <motion.div className="bot_main_theme" {...fadeNumeric} custom={2}>
                        {t.prop.hero.theme}
                    </motion.div>
                    <motion.div className="bot_main_desc" {...fadeNumeric} custom={3}>
                        {t.prop.hero.desc}
                    </motion.div>
                    <motion.div className="button_buy_bot" onClick={() => setIsActive(true)} {...fadeNumeric}
                                custom={4}>
                        {t.prop.hero.buy}
                    </motion.div>
                    <motion.div className="product_slogan" {...fadeNumeric} custom={5}>
                        {t.prop.hero.slogan}
                    </motion.div>
                    <motion.div
                        className="product_description"
                        {...fadeNumeric}
                        custom={6}
                        dangerouslySetInnerHTML={{__html: t.prop.hero.about}}
                    />
                </div>
            </div>

            <div className="product_advantages">
                <motion.h2 {...fadeUp}>
                    {t.prop.advantages.title} <span>{t.prop.hero.botName}</span>
                </motion.h2>

                <div className="product_advantages_list_hydro">
                    {t.prop.advantages.items.slice(0, 3).map((item:any, index:number) => (
                        <motion.div key={index} className="product_advantage_item_gradient" {...fadeNumeric}
                                    custom={index + 1}>
                            <div className="product_advantage_item">
                                <div className="product_advantage_name">
                                    <img
                                        src={index === 0 ? advantageIcon1.src : index === 1 ? advantageIcon2.src : advantageIcon3.src}
                                        alt=""/>
                                    {item.title}
                                    <div className="product_advantage_num">0{index + 1}</div>
                                </div>
                                <div className="product_advantage_desc">
                                    {item.desc}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="product_advantages_list_hydro sec">
                    {t.prop.advantages.items.slice(3).map((item:any, index:number) => (
                        <motion.div key={index + 3} className="product_advantage_item_gradient" {...fadeNumeric}
                                    custom={index + 4}>
                            <div className="product_advantage_item">
                                <div className="product_advantage_name">
                                    <img src={index === 0 ? advantageIcon4.src : advantageIcon5.src} alt=""/>
                                    {item.title}
                                    <div className="product_advantage_num">0{index + 4}</div>
                                </div>
                                <div className="product_advantage_desc">
                                    {item.desc}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="algo_feedback_block">
                <div className="product_name">
                    {t.prop.case.badge}
                </div>
                <div className="feedback_h2">
                    <motion.h2 {...fadeUp}>
                        <span>{t.prop.case.title} </span> PROP EA + INSTANT PROP
                    </motion.h2>
                </div>

                <motion.div className="feedback_short_desc" {...fadeUp}>
                    {t.prop.case.desc}
                </motion.div>

                <motion.div className="slider-container" {...fadeUp}>
                    <Swiper
                        loop
                        modules={[Pagination]}
                        pagination={{clickable: true, el: '.custom-pagination'}}
                        spaceBetween={24}
                        slidesPerView={3}
                        onBeforeInit={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        breakpoints={{
                            0: {slidesPerView: 1},
                            768: {slidesPerView: 2},
                            1024: {slidesPerView: 3},
                        }}
                    >
                        {reviews_images.map((review, i) => (
                            <SwiperSlide key={i} className="reviews_item">
                                <img src={review.src} alt=""/>
                            </SwiperSlide>
                        ))}
                        <div className="custom-pagination"></div>
                    </Swiper>
                </motion.div>

                <div className="reviews_nav">
                    <div className="nav-btn prev" onClick={() => swiperRef.current?.slidePrev()}>
                        <img src={prev_arrow.src} alt="prev"/>
                    </div>
                    <div className="nav-btn next" onClick={() => swiperRef.current?.slideNext()}>
                        <img src={next_arrow.src} alt="next"/>
                    </div>
                </div>
            </div>

            <div className="how_to_fs">
                <div className="how_to_block">
                    <motion.div className="learn_ho_to" {...fadeLeft}>
                        <div className="how_to_main_info">
                            {t.prop.howTo.title}
                        </div>
                        <a href="https://teletype.in/@volodymyrbbk/_MMBDWK2r3-" target="_blank" rel="noreferrer">
                            <div className="read_more_button">
                                {t.aero.propInfo.button}
                            </div>
                        </a>
                    </motion.div>
                    <motion.div className="hot_to_image" {...fadeRight}>
                        <img src={how_to_image.src} alt=""/>
                    </motion.div>
                </div>
            </div>


            <div className="video_demonstration" style={{display: "none"}}>
                <motion.div className="video_text" {...fadeLeft}>
                    <h2 dangerouslySetInnerHTML={{__html: t.aero.video.title}}/>
                </motion.div>
                <motion.div className="video_block" {...fadeRight}>
                    <iframe
                        key={isPlaying ? "playing" : "stopped"}
                        style={{width: '100%', height: '100%', border: 'none'}}
                        src={isPlaying
                            ? "https://www.youtube.com/embed/M3kGv3oRp-Q?autoplay=1&mute=0&si=05eZ6R8NleVqosq0"
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
                                <img src={hydroPreview.src} alt="Video Cover"/>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <CalculatorSectionProp startPercentage={50}/>

            <div className="test_result">
                <motion.h2 {...fadeUp}>
                    {t.prop.tests.title} <span>{t.prop.tests.subtitle}</span>
                </motion.h2>
                <div className="test_details_block_fs">
                    <motion.div className="test_details_block" {...fadeUp}>
                        <div className="test_info">
                            <div className="test_theme">
                                {t.terra.tests.period}
                            </div>
                            <div className="test_detail_item">
                                {t.terra.tests.timeframe}
                                <div className="test_detail_number">
                                    М30
                                </div>
                            </div>
                            <div className="test_detail_item">
                                {t.terra.tests.dates}
                                <div className="test_detail_number">
                                    2025.01.01 - 2026.02.20
                                </div>
                            </div>

                            <div className="test_theme mt24">
                                {t.terra.tests.depositProfit}
                            </div>
                            <div className="test_numbers_grid">
                                <div className="test_numbers_grid_item">
                                    <div className="test_item_name">
                                        {t.terra.tests.startDeposit}
                                    </div>
                                    <div className="test_item_number">
                                        10 000
                                    </div>
                                </div>
                                <div className="test_numbers_grid_item">
                                    <div className="test_item_name">
                                        {t.terra.tests.netProfit}
                                    </div>
                                    <div className="test_item_number">
                                        +379%
                                    </div>
                                </div>
                            </div>

                            <div className="test_detail_item currency">
                                {t.terra.tests.pairs}
                                <div className="test_detail_number">
                                    EURUSD, NZDUSD, USDCHF, USDJPY, EURJPY, USDCAD, AUDCAD
                                </div>
                            </div>

                            <div className="test_theme mt24">
                                {t.terra.tests.risk}
                            </div>
                            <div className="test_detail_item">
                                {t.terra.tests.maxDrawdown}
                                <div className="test_detail_number">
                                    8.83%
                                </div>
                            </div>

                            <div className="test_theme mt24">
                                {t.terra.tests.trades}
                            </div>
                            <div className="test_detail_item">
                                {t.prop.tests.winTrades}
                                <div className="test_detail_number">
                                    84.39%
                                </div>
                            </div>
                        </div>
                        <div className="test_result_image">
                            <img src={test_image.src} alt="Prop EA tests"/>
                        </div>
                    </motion.div>
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
                        {faqElements.map((el:any, index:number) => {
                            const isOpen = openFaqs.includes(index);

                            return (
                                <motion.div
                                    key={index}
                                    className={`faq_item ${isOpen ? "open_faq" : ""}`}
                                    {...fadeNumeric}
                                    custom={index}
                                >
                                    <div className="faq_item_question" onClick={() => {
                                        setOpenFaqs((prev:any) =>
                                            isOpen
                                                ? prev.filter((i:any) => i !== index)
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
            <div className="prop_buy_fs">
                <div className="prop_bot_buy_section">
                    <div className="prop_bot_info">
                        <div className="best_offer_container">
                            <div className="best_offer">
                                {t.prop.buySection.badge}
                            </div>
                            <div className="first_month_free">
                                {t.prop.buySection.freeMonth}
                            </div>
                        </div>
                        <div className="prop_bot_name">
                            {t.prop.buySection.title}
                        </div>
                        <div className="prop_bot_desc">
                            {t.prop.buySection.desc}
                        </div>
                        <div className="three_prop_bot_advantages">
                            <div className="prop_bot_advantages">
                                <div className="prop_advantage_name">
                                    {t.prop.buySection.labels.monthlyProfit}
                                </div>
                                <div className="prop_advantage_number">
                                    1.5-3%
                                </div>
                            </div>
                            <div className="prop_bot_advantages">
                                <div className="prop_advantage_name">
                                    {t.prop.buySection.labels.maxDrawdown}
                                </div>
                                <div className="prop_advantage_number">
                                    8.8%
                                </div>
                            </div>
                            <div className="prop_bot_advantages">
                                <div className="prop_advantage_name">
                                    {t.prop.buySection.labels.winrate}
                                </div>
                                <div className="prop_advantage_number">
                                    84.4%
                                </div>
                            </div>
                        </div>
                        <div className="two_prop_bot_advantages">
                            <div className="advantages_block">
                                <div className="advantages_name_prop">
                                    {t.prop.buySection.labels.price}
                                </div>
                                <div className="advantages_num">
                                    350
                                    <span>USD</span>
                                </div>
                            </div>
                            <div className="advantages_block">
                                <div className="advantages_name_prop">
                                    {t.prop.buySection.labels.subscription}
                                </div>
                                <div className="advantages_num">
                                    39
                                    <span>USD</span>
                                </div>
                            </div>
                        </div>
                        <div className="main_btn_buy" onClick={() => setIsActive(true)}>
                            {t.prop.buySection.button}
                        </div>
                    </div>
                    <div className="prop_main_bot_img">
                        <img src={last_block_img.src} alt="Prop EA Bot"/>
                    </div>
                </div>
            </div>

            <motion.div className="footer" {...fadeUp}>
                <a href="/">
                    <img src={logo.src} alt="Logo" className="logo_img"/>
                </a>
                <hr/>

                {isMobile ?
                    <div className="society_block">
                        <div>
                            <a href="https://t.me/+uKCqVOr1OAE2ZmQy" target="_blank" rel="noreferrer">
                                <img src={tg_icon.src} alt=""/>
                            </a>
                        </div>
                        <div>
                            <a href="https://www.instagram.com/alg0_bots?igsh=NW82eGFuajRlYmpw" target="_blank"
                               rel="noreferrer">
                                <img src={instagram_icon.src} alt=""/>
                            </a>
                        </div>
                        <div>
                            <a href="https://www.youtube.com/@alg0_ofx" target="_blank" rel="noreferrer">
                                <img src={youtube_icon.src} alt=""/>
                            </a>
                        </div>
                    </div>

                    : <div className="society_block">
                        <div>
                            <a href="https://www.instagram.com/alg0_bots?igsh=NW82eGFuajRlYmpw">{t.terra.footer.instagram}</a>
                        </div>
                        <div>
                            <a href="https://www.youtube.com/@alg0_ofx">{t.terra.footer.youtube}</a>
                        </div>
                        <div>
                            <a href="https://t.me/+uKCqVOr1OAE2ZmQy">{t.terra.footer.telegram}</a>
                        </div>
                    </div>}
            </motion.div>
        </div>
    );
};

export default PropPage;