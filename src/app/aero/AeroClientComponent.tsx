"use client"
import React, {useEffect, useRef, useState} from 'react';

import bento_row from "./images/Bento Row 2 (1).png"
import info_icon_mt4 from "./images/info-icon-mt4.svg"
import test_results_aero from "./images/aero_test_results.png"
import feature_shield_mobile from "./images/feature_shield_mobile.webp"
import refresh_feature_mobile1 from "./images/refresh_feature_mobile.webp"
import flashlight_feature_mobile from "./images/flashlight_feature_mobile.webp"
import chart_feature_mobile from "./images/chart_feature_mobile.webp"
import filter_feature_mobile from "./images/filter_feature_mobile.webp"


import feature_shield from "./images/feature_shield.png"
import refresh_feature from "./images/refresh_feature.png"
import flashlight_feature from "./images/flashlight_feature.png"
import chart_feature from "./images/chart_feature.png"
import filter_feature from "./images/filter_feature.png"
import shield_line from "./images/shield-check-line.svg"
import refresh_line from "./images/refresh-line.svg"
import flashlight_line from "./images/flashlight-line (1).svg"
import line_chart from "./images/line-chart-line (1).svg"
import filter_line from "./images/filter_line.svg"
import prev_arrow from "../images/prev-arrow.svg";
import next_arrow from "../images/next-arrow.svg";
import mql5_button from "../images/mql_button.svg";
import {Swiper, SwiperSlide} from "swiper/react";
import review_image1 from "./images/review_image1.png";
import review_image2 from "./images/review_image2.png";
import review_image3 from "./images/review_image3.png";
import review_image4 from "./images/review_image4.png";
import review_image5 from "./images/review_image5.png";
import test_image from "./images/test_image.png";
import bottom_product_image from "./images/bottom_product_image.webp";
import logo from "../images/logo.svg";
import PopupBot from "@/components/PopupBot";
import {Pagination} from "swiper/modules";
import {AnimatePresence, HTMLMotionProps, motion} from "framer-motion";
import aeroPreview from "./images/aero_preview_t.png";
//import aeroVideo from "./images/aeroMainVideo.mp4";
import preview from "../images/logo192.png"
import {useLanguage} from "@/context/LanguageProvider";
import CalculatorSectionAero from "@/components/CalculatorSectionAero";
import tg_icon from "../images/tg_icon.svg";
import youtube_icon from "../images/youtube_icon.svg";
import {useThxContext} from "@/context/ThxContext";
import Image from "next/image";
import lines from "@/app/images/bottom_lines.svg";
import Footer from "@/components/Footer";
import AddToCartButton from "@/components/cartPopup/AddToCartButton";
import TripleHandler from "@/app/aero/components/TripleHandler";
import EarthFooter from "@/app/aero/components/EarthFooter";
import {useScroll} from "@/context/ScrollContext";

const AeroClientComponent = () => {
    const {t, language} = useLanguage();
    const {activePopup, setActivePopup} = useThxContext()
    const [isMobile, setIsMobile] = useState(false);
    const [selectedValue, setSelectedValue] = useState(1);
    const [widgetSize, setWidgetSize] = useState<{
        width: number;
        height: number;
    } | null>(null);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;

            setWidgetSize({
                width: mobile ? 450 : 800,
                height: mobile ? 600 : 270,
            });
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);


    const reviews_images = [review_image1, review_image2, review_image3, review_image4, review_image5];

    const reviews = t.aero.reviewsList.map((review: any, index: number) => ({
        ...review,
        image: reviews_images[index]
    }));

    const [isActive, setIsActive] = useState(false)

    const bot_info_popup = {
        bot_info: t.aero.botInfoPopup.botInfo,
        bot_name: t.aero.botInfoPopup.botName,
        bot_price: t.aero.botInfoPopup.botPrice
    };


    const swiperRef: any = useRef(null);


    const fastEase = [0.25, 0.1, 0.25, 1.0];

    const pointVariants: any = {
        hidden: {
            opacity: 0,
            y: 20,
            rotate: 0.001
        },
        visible: (i: any) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: fastEase
            }
        })
    };
    const {scrollToSection} = useScroll()!;

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


    const botsList = [...t.home.botsList]

    console.log(selectedValue)
    return (
        <div className="product_page aero">

            <PopupBot
                bot_info={bot_info_popup.bot_info}
                bot_name={bot_info_popup.bot_name}
                price={bot_info_popup.bot_price}
                isActive={isActive}
                setIsActive={setIsActive}
                activeThx={activePopup}
                setActiveThx={setActivePopup}
            />


            <div className="hero_block_aero">
                <div className="aero_hero_information">
                    <motion.h1
                        className="aero_hero_h1"
                        {...fadeNumeric}
                        custom={1}
                    >
                        {t.aero.hero.title}
                    </motion.h1>

                    <motion.div
                        className="aero_hero_desc"
                        {...fadeNumeric}
                        custom={2}
                    >
                        {t.aero.hero.description}
                    </motion.div>

                    <div className="aero_hero_buttons">
                        <motion.a
                            className="view_live_performance"
                            href="#view-live-performance"
                            {...fadeNumeric}
                            custom={3}
                        >
                            {t.aero.hero.viewPerformance}
                        </motion.a>

                        <motion.a
                            className="explore_the_strategy"
                            href="#explore-strategy"
                            {...fadeNumeric}
                            custom={4}
                        >
                            {t.aero.hero.exploreStrategy}
                        </motion.a>
                    </div>

                    <motion.a
                        href="#purchase-bot"
                        {...fadeNumeric}
                        custom={5}
                        className="ready_to_start"

                    >

                        {t.aero.hero.getAero}<span>→</span>

                    </motion.a>
                </div>
            </div>

            <motion.div className="positive_features" {...fadeUp}>
                {t.aero.features.label}
            </motion.div>

            <div className="inside_aero_container">
                <motion.h2 {...fadeUp}>
                    {t.aero.features.title}
                </motion.h2>

                <div className="inside_aero_features_list">
                    <motion.div
                        className="feature feature--main"
                        {...fadeNumeric}
                        custom={1}
                    >
                        <div className="feature-title">
                            <img src={shield_line.src} alt=""/>
                            {t.aero.features.main.title}
                        </div>

                        <div className="feature-desc">
                            {t.aero.features.main.description}
                        </div>

                        <picture>
                            <source
                                media="(max-width: 767px)"
                                srcSet={feature_shield_mobile.src}
                            />

                            <img
                                src={feature_shield.src}
                                alt=""
                                className="feature_shield_img"
                            />
                        </picture>
                    </motion.div>

                    <motion.div
                        className="feature feature--strategy"
                        {...fadeNumeric}
                        custom={2}
                    >
                        <div className="feature_info_container">
                            <div className="feature-title">
                                <img src={refresh_line.src} alt=""/>
                                {t.aero.features.strategy.title}
                            </div>

                            <div className="feature-desc">
                                {t.aero.features.strategy.description}
                            </div>
                        </div>

                        <picture>
                            <source
                                media="(max-width: 767px)"
                                srcSet={refresh_feature_mobile1.src}
                            />

                            <img src={refresh_feature.src} alt=""/>
                        </picture>
                    </motion.div>

                    <motion.div
                        className="feature feature--protection"
                        {...fadeNumeric}
                        custom={3}
                    >
                        <div className="feature_info_container">
                            <div className="feature-title">
                                <img src={flashlight_line.src} alt=""/>
                                {t.aero.features.protection.title}
                            </div>

                            <div className="feature-desc">
                                {t.aero.features.protection.description}
                            </div>
                        </div>

                        <picture>
                            <source
                                media="(max-width: 767px)"
                                srcSet={flashlight_feature_mobile.src}
                            />

                            <img src={flashlight_feature.src} alt=""/>
                        </picture>
                    </motion.div>

                    <motion.div
                        className="feature feature--setup"
                        {...fadeNumeric}
                        custom={4}
                    >
                        <div className="feature_info_container">
                            <div className="feature-title">
                                <img src={line_chart.src} alt=""/>
                                {t.aero.features.setup.title}
                            </div>

                            <div className="feature-desc">
                                {t.aero.features.setup.description}
                            </div>
                        </div>

                        <picture>
                            <source
                                media="(max-width: 767px)"
                                srcSet={chart_feature_mobile.src}
                            />

                            <img src={chart_feature.src} alt=""/>
                        </picture>
                    </motion.div>

                    <motion.div
                        className="feature feature--news"
                        {...fadeNumeric}
                        custom={5}
                    >
                        <div className="feature_info_container">
                            <div className="feature-title">
                                <img src={filter_line.src} alt=""/>
                                {t.aero.features.news.title}
                            </div>

                            <div className="feature-desc">
                                {t.aero.features.news.description}
                            </div>
                        </div>

                        <picture>
                            <source
                                media="(max-width: 767px)"
                                srcSet={filter_feature_mobile.src}
                            />

                            <img src={filter_feature.src} alt=""/>
                        </picture>
                    </motion.div>
                </div>
            </div>

            <div className="product_result_fs" id = "explore-strategy">
                <div className="what_trading_looks_like_container">
                    <motion.div className="positive_features" {...fadeUp}>
                        {t.aero.workflow.label}
                    </motion.div>

                    <motion.h2 {...fadeUp}>
                        {t.aero.workflow.title}
                    </motion.h2>

                    <div className="container_main_description">
                        {t.aero.workflow.description}
                    </div>

                    <div className="what_trading_looks_like">
                        <motion.div
                            className="trading_look_item"
                            {...fadeNumeric}
                            custom={1}
                        >
                            <div className="number_item">01</div>

                            <div className="title_item">
                                {t.aero.workflow.breakout.title}
                            </div>

                            <div className="description_item">
                                {t.aero.workflow.breakout.description}
                            </div>
                        </motion.div>

                        <motion.div
                            className="trading_look_item"
                            {...fadeNumeric}
                            custom={2}
                        >
                            <div className="number_item">02</div>

                            <div className="title_item">
                                {t.aero.workflow.retest.title}
                            </div>

                            <div className="description_item">
                                {t.aero.workflow.retest.description}
                            </div>
                        </motion.div>

                        <motion.div
                            className="trading_look_item"
                            {...fadeNumeric}
                            custom={3}
                        >
                            <div className="number_item">03</div>

                            <div className="title_item">
                                {t.aero.workflow.stop.title}
                            </div>

                            <div className="description_item">
                                {t.aero.workflow.stop.description}
                            </div>
                        </motion.div>
                    </div>

                    <Image
                        src={bento_row}
                        alt=""
                        className="bento_row_image"
                    />

                    <motion.div className="optional_hedge_block" {...fadeUp}>
                        <div className="optional_hedge_main">
                            <img src={refresh_line.src} alt=""/>
                            {t.aero.workflow.hedge.title}
                        </div>

                        <div className="optional_hedge_info">
                            {t.aero.workflow.hedge.description}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="explore_aeros_record_container">
                <div className="explore_aeros_record">
                    <motion.div className="positive_features">
                        {t.aero.statistics.label}
                    </motion.div>

                    <motion.h2 {...fadeUp}>
                        {t.aero.statistics.title}
                    </motion.h2>

                    <div className="container_main_description">
                        {t.aero.statistics.description}
                    </div>

                    <div className="explore_aeros_record_video_container">
                        <TripleHandler
                            items={[
                                {
                                    value: 1,
                                    label: (
                                        <div className="handler_explore_item">
                                            <div className="handler_title">
                                                {t.aero.statistics.accounts.legacy.title}
                                            </div>

                                            <div className="handler_desc">
                                                {t.aero.statistics.accounts.legacy.description}
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    value: 2,
                                    label: (
                                        <div className="handler_explore_item">
                                            <div className="handler_title">
                                                {t.aero.statistics.accounts.current.title}
                                            </div>

                                            <div className="handler_desc">
                                                {t.aero.statistics.accounts.current.description}
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    value: 3,
                                    label: (
                                        <div className="handler_explore_item">
                                            <div className="handler_title">
                                                {t.aero.statistics.accounts.darwinex.title}
                                            </div>

                                            <div className="handler_desc">
                                                {t.aero.statistics.accounts.darwinex.description}
                                            </div>
                                        </div>
                                    ),
                                },
                            ]}
                            handleValue={selectedValue}
                            setHandleValue={setSelectedValue}
                        />

                        <div className="archived_mt4">
                            <div className="top_mobile_archived">
                                <img src={info_icon_mt4.src} alt=""/>

                                <div className="mt4_archived_text">
                                    {t.aero.statistics.archivedTitle}
                                </div>
                            </div>

                            <div className="mt4_archived_info">
                                {t.aero.statistics.archivedDescription}
                            </div>
                        </div>

                        <div className="mt4_vidget_container" id = "view-live-performance">
                            <div className="mt4_vidget_block">
                                <a href={selectedValue === 1 ?
                                    "https://www.myfxbook.com/members/alg0_o/aero-mt4--archive-1/12232265" :
                                    selectedValue === 2 ? "https://www.myfxbook.com/members/alg0_o/aero-mt5--current-account/12205723" :
                                        "https://www.myfxbook.com/members/alg0_o/aero-darwinex-zero--oenc/12209314"}
                                   className="open_mt4_myfxbook" target="_blank">
                                    {t.aero.statistics.openMyfxbook}
                                </a>

                                <div className="mt4_vidget_block_content">
                                    {widgetSize && (selectedValue === 1 ?
                                        (
                                            <a href="https://www.myfxbook.com/members/alg0_o/aero-mt4--archive-1/12232265" target="_blank">
                                                <img className="widget_image_myfxbook" alt="widget"
                                                     src={`https://widgets.mfbcdn.net/custom-widget?id=12232265&width=${widgetSize.width}&height=${widgetSize.height}&bart=0&linet=2&symbol=GOLD&magic=-1&title=AeroMT4(Archive%2B1year)&titles=12&bgColor=ffffff&gridColor=bdbdbd&lineColor=ff0505&barColor=ffadad&bar1Color=ffadad&fontColor=525252&chartbgc=ffffff&equityColor=eff45a`}/></a>
                                        )
                                        : selectedValue === 2 ?
                                            (
                                                <a href="https://www.myfxbook.com/members/alg0_o/aero-mt5--current-account/12205723" target="_blank">
                                                    <img className="widget_image_myfxbook" alt="widget"
                                                         src={`https://widgets.mfbcdn.net/custom-widget?id=12205723&width=${widgetSize.width}&height=${widgetSize.height}&bart=0&linet=2&symbol=GOLD&magic=-1&title=AeroMT5(CurrentAccount)&titles=12&bgColor=ffffff&gridColor=bdbdbd&lineColor=ff0505&barColor=ffadad&bar1Color=ffadad&fontColor=525252&chartbgc=ffffff&equityColor=eff45a`}/></a>
                                            )
                                            :
                                            (
                                                <a href="https://www.myfxbook.com/members/alg0_o/aero-darwinex-zero--oenc/12209314" target="_blank">
                                                    <img className="widget_image_myfxbook" alt="widget"
                                                         src={`https://widgets.mfbcdn.net/custom-widget?id=12209314&width=${widgetSize.width}&height=${widgetSize.height}&bart=0&linet=2&symbol=GOLD&magic=-1&title=AeroDarwinexZero(OENC)&titles=12&bgColor=ffffff&gridColor=bdbdbd&lineColor=ff0505&barColor=ffadad&bar1Color=ffadad&fontColor=525252&chartbgc=ffffff&equityColor=eff45a`}/>
                                                </a>
                                            )
                                    )}


                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="all_element_container">
                        <div className="elements_block">
                            <div className="elements_list_text">
                                {t.aero.portfolio.elements}
                            </div>

                            <div className="one_portfolio_text">
                                {t.aero.portfolio.title}
                            </div>
                        </div>

                        <div className="deposit_elements">
                            <div className="deposit_label">
                                {t.aero.portfolio.deposit}
                            </div>

                            <div className="deposit_money">
                                $160,000
                            </div>
                        </div>

                        <a className="myfxbook_deposit_button" href = "https://www.myfxbook.com/members/alg0_o" target = "_blank">
                            {t.aero.portfolio.myfxbook}
                        </a>
                    </div>
                </div>
            </div>

            <div className="algo_feedback_block">
                <div className="feedback_h2">
                    <motion.h2 {...fadeUp}>
                        <span>{t.aero.reviews.titleAccent}</span> {t.aero.reviews.title}
                    </motion.h2>

                    <div className="reviews_nav">
                        <div className="nav-btn prev" onClick={() => swiperRef.current?.slidePrev()}>
                            <img src={prev_arrow.src} alt="prev"/>
                        </div>
                        <div className="nav-btn next" onClick={() => swiperRef.current?.slideNext()}>
                            <img src={next_arrow.src} alt="next"/>
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

                        onBeforeInit={(swiper) => {
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
                                <img src={review.image.src} alt={review.name}/>
                                <div className="review_author">{review.name}</div>
                                <div className="review_description">{review.text}</div>
                            </SwiperSlide>
                        ))}
                        <div className="custom-pagination"></div>
                    </Swiper>
                </motion.div>

                <motion.div className="center-btn" {...fadeUp}>
                    <a href="https://t.me/+ZjmgYnV_mh9jOGMy" target="_blank" rel="noreferrer"
                       className="more_reviews_button">
                        {t.terra.reviews1.more}
                    </a>
                </motion.div>
            </div>

            <div className="test_result">
                <h2>
                    {t.terra.tests.title} <span>{t.terra.tests.titleAccent}</span>
                </h2>
                <div className="test_details_block_fs">
                    <div className="test_details_block">

                        <div className="test_grid_container">
                            <div className="test_result_f">
                                <div className="test_theme">
                                    {t.terra.tests.period}
                                </div>
                                <div className="test_detail_item">
                                    {t.terra.tests.timeframe}
                                    <div className="test_detail_number">
                                        {t.terra.tests.timeframeValue}
                                    </div>
                                </div>
                                <div className="test_detail_item">
                                    {t.terra.tests.dates}
                                    <div className="test_detail_number">
                                        2016.01.04 — 2026.01.01
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="test_theme">
                                    {t.terra.tests.depositProfit}
                                </div>
                                <div className="test_numbers_grid">
                                    <div className="test_numbers_grid_item">
                                        <div className="test_item_name">
                                            {t.terra.tests.startDeposit}
                                        </div>
                                        <div className="test_item_number">
                                            10000.00
                                        </div>
                                    </div>
                                    <div className="test_numbers_grid_item">
                                        <div className="test_item_name">
                                            {t.terra.tests.netProfit}
                                        </div>
                                        <div className="test_item_number">
                                            +1113%
                                        </div>
                                    </div>
                                </div>

                                <div className="test_detail_item">
                                    {t.terra.tests.pairs}
                                    <div className="test_detail_number">
                                        XAUUSD ( GOLD )
                                    </div>
                                </div>
                            </div>

                            <div className="test_result_f">
                                <div className="test_theme">
                                    {t.terra.tests.risk}
                                </div>
                                <div className="test_detail_item mb16">
                                    {t.terra.tests.maxDrawdown}
                                    <div className="test_detail_number">
                                        12.31%
                                    </div>
                                </div>

                                <div className="test_theme mt-auto">
                                    {t.terra.tests.trades}
                                </div>
                                <div className="test_detail_item">
                                    {t.aero.tests.winTrades}
                                    <div className="test_detail_number">
                                        85.66%
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="test_result_image">
                            <img src={test_results_aero.src} alt="Test results chart"/>
                        </div>
                    </div>
                </div>
            </div>


            {/*<div className="how_to_fs">
                <div className="how_to_block">
                    <motion.div className="learn_ho_to" {...fadeLeft}>
                        <div className="how_to_main_info">
                            {t.aero.propInfo.title}
                        </div>
                        <a href="https://teletype.in/@volodymyrbbk/d-OhuPGz2YL" target="_blank" rel="noreferrer">
                            <div className="read_more_button">
                                {t.aero.propInfo.button}
                            </div>
                        </a>
                    </motion.div>
                    <motion.div className="hot_to_image" {...fadeRight}>
                        <img src={how_to_image.src} alt=""/>
                    </motion.div>
                </div>
            </div>*/}


            <CalculatorSectionAero startPercentage={30}/>

            <div className="buy_block_fs" id = "purchase-bot">
                <div className="buy_block">

                    <motion.div className="buy_block_image" {...fadeNumeric} custom={1}>
                        <img src={bottom_product_image.src} alt="Aero EA"/>
                    </motion.div>

                    <motion.div className="buy_block_info" {...fadeNumeric} custom={2}>
                        <div className="product_name_bottom">
                            {t.aero.hero.botName}
                        </div>
                        <div className="product_desc_bottom">
                            {t.aero.buy.desc}
                        </div>
                        <div className="buy_block_bot_stat">
                            {t.aero.results.stats.map((stat: any, index: number) => (
                                <div className="bot_stat_item" key={index}>
                                    <div className="bot_stat_name">{stat.label}</div>
                                    <div className="bot_stat_num">{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="bot_stat_price">
                            {t.terra.buy.price}
                            <div className="price_block_bottom">
                                {t.aero.botInfoPopup.botPrice}
                                <span>USD</span>
                            </div>
                        </div>
                        <div className="bot_marquee">
                            <div className="bot_marquee_group">
                                {botsList.map((el) =>
                                    el.name === "Aero EA" ?
                                        <span>{el.oneTimePayment} · {el.lifetimeAccess} · {el.allUpdatesIncluded} · {el.oneTimePayment} · {el.lifetimeAccess} · {el.allUpdatesIncluded}</span> : ""
                                )}

                            </div>

                        </div>

                        <div className="bottom_buttons_block">{/* aero_purchase_block*/}
                            <AddToCartButton className="button_buy_bottom" product={{
                                id: "aero-ea",
                                name: "AERO EA",
                                subtitle: t.aero.hero.theme,
                                imageSrc: bottom_product_image.src,
                                unitPrice: 900,
                            }}>
                                {t.terra.buy.buy}
                            </AddToCartButton>
                            {/* <a className="open_mql5_bottom"
                               href="https://www.mql5.com/en/market/product/176860?source=Site+Market+My+Products+Page#description"
                               target="_blank"
                               rel="noopener noreferrer">
                                {t.buttons.openMql}
                                <img src={mql5_button.src} alt=""/>
                            </a>*/}
                            {/* <div className="piece_pay_bottom" onClick={() => setIsActive(true)}>
                                {t.terra.buy.parts}
                            </div>*/}
                        </div>
                    </motion.div>
                </div>
            </div>
            {/*
            <Footer/>
            */}
            <EarthFooter/>

            <div className="tech_page_footer_list desk_none">
                <a href="/terms-and-conditions" className="footer_menu_item">
                    {t.legalFooter.termsAndConditions}
                </a>
                <a href="/software-use-trading-risk-disclosure" className="footer_menu_item">
                    {t.legalFooter.softwareUseTradingRiskDisclosure}
                </a>
                <a href="/privacy-policy" className="footer_menu_item">
                    {t.legalFooter.privacyPolicy}
                </a>
                <div className="copyrights_algo desk_none_none">
                    @algo 2026
                </div>
            </div>
        </div>
    );
};

export default AeroClientComponent;