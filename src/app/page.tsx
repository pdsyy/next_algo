"use client"
import React, {useEffect, useRef, useState} from 'react';
import mainBlockBg from "./images/mainBlockBg.png"
import mainBlockBgMobile from "./images/MainBlockBgMobile.png"
import metalPackage from "./images/metalPackage.png"
import market_image1 from "./images/market_image1.png"
import market_image2 from "./images/market_image2.png"
import market_image3 from "./images/market_image3.png"
import market_image4 from "./images/market_image4.png"
import market_image5 from "./images/market_image5.png"
import market_image6 from "./images/market_image6.png"
import market_image7 from "./images/market_image7.png"
import firstDealImage from "./images/firstDealImage.png"
import firstDealItem1 from "./images/firstDealItem1.svg"
import firstDealItem2 from "./images/firstDealImage2.svg"
import firstDealItem3 from "./images/firstDealImage3.svg"
import firstDealItem4 from "./images/firstDealImage4.svg"
import effectiveImage1 from "./images/effectiveImage1.png"
import effectiveImage2 from "./images/effectiveImage2.png"
import effectiveImage3 from "./images/effectiveImage3.png"
import effectiveImage4 from "./images/effectiveImage4.png"
import bot_item1 from "./images/bot_item1.png"
import bot_item2 from "./images/bot_item2.png"
import bot_item3 from "./images/bot_item3.png"
import prev_arrow from "./images/prev-arrow.svg"
import next_arrow from "./images/next-arrow.svg"
import review_image1 from "./images/review_image1.png"
import review_image2 from "./images/review_image2.png"
import review_image3 from "./images/review_image3.png"
import review_image4 from "./images/review_image4.png"
import review_image5 from "./images/review_image5.png"
import review_image6 from "./images/review_image6.png"
import circles_bg from "./images/circles.svg"
import select_bot_img from "./images/select_bot_img.png"
import select_bot_img_mob from "./images/select_bot_img_mob.png"
import white_info_icon from "./images/white_info_label.svg"

import {Swiper, SwiperSlide} from "swiper/react";
import {Pagination} from "swiper/modules";
import 'swiper/css/pagination';

import "swiper/css";
import "swiper/css/navigation";
import {useScroll} from "@/context/ScrollContext";
import {HTMLMotionProps, motion} from "framer-motion"
import {useLanguage} from "@/context/LanguageProvider";
import PopupBot from "@/components/PopupBot";
import AnimatedNumber from "@/components/AnimatedNumber";

const MainPage = ({activePopup, setActivePopup}:any) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  const {t} = useLanguage()!;


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

  const boxRef:any = useRef(null);
  const handleMouseMove = (e:any) => {
    if (!boxRef.current) return;
    const {innerWidth, innerHeight} = window;
    const x = (e.clientX / innerWidth) - 0.5;
    const y = (e.clientY / innerHeight) - 0.5;
    const moveX = x * 60;
    const moveY = y * 60;
    boxRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
  };


  const bot_images = [bot_item1, bot_item2, bot_item3];

  const botsList = t.home.botsList.map((bot:any, index:number) => ({
    ...bot,
    image: bot_images[index]
  }));

  const reviews_images = [review_image1, review_image2, review_image3, review_image4, review_image5, review_image6];

  const reviews = t.home.reviewsList.map((review:any, index:number) => ({
    ...review,
    image: reviews_images[index]
  }));


  const swiperRef:any = useRef(null);

  const [openFaqs, setOpenFaqs]:any = useState([]);

  const faqElements = t.home.faq;


  const fastEase = [0.25, 0.1, 0.25, 1.0];

  const pointVariants:any = {
    hidden: {
      opacity: 0,
      y: 20,
      rotate: 0.001
    },
    visible: (i:number) => ({
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

  const marketImages = [
    market_image1,
    market_image2,
    market_image3,
    market_image4,
    market_image5,
    market_image6,
    market_image7
  ];

  const [isActive, setIsActive] = useState(false)

  const bot_info_popup = {
    bot_info: t.prop.botInfoPopup.botInfo,
    bot_name: t.prop.botInfoPopup.botName,
    bot_price: t.prop.botInfoPopup.botPrice
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
        <div className="main_block" onMouseMove={handleMouseMove}>
          <img
              src={!isMobile ? mainBlockBg.src : mainBlockBgMobile.src}
              alt="Background"
              className="main_block_bg"
          />
          <motion.div className="main_info_block" {...fadeLeft}>
            <div className="algo_block">
              algo
            </div>
            <h1 className="main_h1">
              {t.home.hero.title}
            </h1>
            <div className="main_desc">
              {t.home.hero.desc}
            </div>
            <div className="select_bot_button" onClick={() => scrollToSection("catalog")}>
              {t.home.hero.button}
            </div>
          </motion.div>

          <motion.img
              src={metalPackage.src}
              alt="Metal Package"
              className="metalPackage"
              ref={boxRef}
              {...fadeRight}
          />
        </div>
        <div className="main_page_content">


          <div className="about_us_block">
            <motion.div className="market_list" {...fadeUp}>
              {[...Array(isMobile ? 14 : 7)].map((_, i) => (
                  <img
                      key={i}
                      src={marketImages[i % 7].src}
                      alt={`market-${i}`}
                      className={`market-${i}`}
                  />
              ))}
            </motion.div>

            <motion.h2 className="our_main_advantages" {...fadeUp}
                       dangerouslySetInnerHTML={{__html: t.home.stats.title}}/>

            <div className="our_advantages_list">
              {t.home.stats.items.map((item:any, index:number) => (
                  <motion.div key={index} className="advantages_point" {...fadeNumeric} custom={index + 1}>
                    <div className="advantages_point_number"><AnimatedNumber value={item.num}
                                                                             duration={index !== 3 ? 1 : 2}
                                                                             delay={index * 0.1}/></div>
                    <div className="advantages_point_desc">{item.desc}</div>
                  </motion.div>
              ))}
            </div>
          </div>

          <div className="money_in_management">
            <motion.div className="money_in_management_number" {...fadeUp}>
              {isMobile ? "200 000$" : <AnimatedNumber value="200 000$" duration={2.5}/>}
            </motion.div>
            <motion.div className="in_management" {...fadeUp}>
              {t.home.stats.management}
            </motion.div>
          </div>


          <div className="effective_algorithm" id="advantages">
            <motion.h2 {...fadeUp} dangerouslySetInnerHTML={{__html: t.home.effective.title}}/>

            <div className="effective_points first">
              {t.home.effective.items.slice(0, 2).map((item:any, index:number) => (
                  <motion.div key={index}
                              className="effective_point" {...(index === 0 ? fadeLeft : fadeRight)}>
                    <img src={index === 0 ? effectiveImage1.src : effectiveImage2.src} alt=""/>
                    <div className="name">{item.title}</div>
                    <div className="desc">{item.desc}</div>
                  </motion.div>
              ))}
            </div>

            <div className="effective_points second">
              {t.home.effective.items.slice(2, 4).map((item:any, index:number) => (
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
            <div className="first_deal_details">
              <motion.div className="first_deal_image" {...fadeLeft}>
                <img src={firstDealImage.src} alt=""/>
              </motion.div>

              <motion.div className="first_deal_block_list" {...fadeRight}>
                {t.home.steps.items.map((step:any, index:number) => (
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
            </div>
          </div>

          <div className="bots_catalog" id="catalog">
            <motion.h2 {...fadeUp}>
              {t.home.catalog.title}
            </motion.h2>

            <div className="bots_list">
              {botsList.map((el:any, idx:number) =>
                  {return !isMobile ?  <motion.div className = "piece_pay_full_block" key={idx} {...fadeNumeric} custom={idx}>
                        <div className = "white_info_block">
                          <img src = {white_info_icon.src} alt = ""/>
                          {t.home.piecePay}
                        </div>
                        <div className = "bot_gradient_border">
                          <div className="bot_item">
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
                                {el.price}
                                <span>USD</span>
                              </div>
                            </div>

                            <a href={el.href}>
                              <div className="bot_more_details">
                                {t.home.catalog.moreDetails}
                              </div>
                            </a>
                          </div>
                        </div>
                      </motion.div> :

                      <div className = "bot_gradient_border">
                        <div className="bot_item">
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
                              {el.price}
                              <span>USD</span>
                            </div>
                          </div>

                          <div className = "mob_piece_pay">
                            ✓ {t.home.piecePay}
                          </div>

                          <a href={el.href}>
                            <div className="bot_more_details">
                              {t.home.catalog.moreDetails}
                            </div>
                          </a>
                        </div>
                      </div>
                  }
              )}
            </div>
          </div>

          <motion.div className="prop_container_fs" {...fadeUp}>
            {!isMobile ?
                <div className="main_page_prop_container"
                     onMouseOver={() => {
                       /*
                                                    if (window.innerWidth > 767) {
                                                        setVisibleBgProp(true)
                                                        setVisibleHeader(true)
                                                    }*/
                     }} onMouseOut={() => {
                  /* if (window.innerWidth > 767) {
                       setVisibleBgProp(false)
                       setVisibleHeader(false)
                   }*/
                }}>
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
                    <a href="/prop">
                      <div className="main_btn_buy" onClick={() => {
                        //setIsActive(true)
                      }}>
                        {t.prop.buySection.button}
                      </div>
                    </a>
                  </div>

                </div> :
                <div className = "mobile_prop_container">
                  <div className="white_info_block">
                    <img src={white_info_icon.src} alt = ""/>{t.home.bestOfferProp}
                  </div>
                  <div className="main_page_prop_container"
                       onMouseOver={() => {
                         /*
                                                      if (window.innerWidth > 767) {
                                                          setVisibleBgProp(true)
                                                          setVisibleHeader(true)
                                                      }*/
                       }} onMouseOut={() => {
                    /* if (window.innerWidth > 767) {
                         setVisibleBgProp(false)
                         setVisibleHeader(false)
                     }*/
                  }}>
                    <div className="prop_bot_info">

                      <div className="prop_bot_name">
                        {t.prop.buySection.title}
                      </div>
                      <div className="prop_bot_desc">
                        {t.prop.buySection.desc}
                      </div>
                      <div className="prop_bot_advantages">
                        <div className="prop_advantage_name">
                          {t.prop.buySection.labels.monthlyProfit}
                        </div>
                        <div className="prop_advantage_number">
                          1.5-3%
                        </div>
                      </div>
                      <div className="three_prop_bot_advantages">

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
                      <div className="two_prop_bot_advantages prop_bot">
                        <div className="test_detail_item">
                          {t.prop.calculator.labels.botPrice}
                          <div className="test_detail_number">
                            350<span className = "usd_main">USD</span>
                          </div>
                        </div>
                        <div className="test_detail_item">
                          {t.prop.calculator.labels.monthSubscribe}
                          <div className="test_detail_number f_month_free">
                            <span>1 {t.prop.calculator.labels.month} FREE</span>39<span className = "usd_main">USD</span>
                          </div>
                        </div>
                      </div>

                      <a href="/prop">
                        <div className="main_btn_buy" onClick={() => {
                          //setIsActive(true)
                        }}>
                          {t.home.catalog.moreDetails}
                        </div>
                      </a>
                    </div>

                  </div>
                </div>
            }
            {/*<div className= "prop_bot_bg">

                    </div>*/}

          </motion.div>

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
                  onBeforeInit={(swiper:any) => {
                    swiperRef.current = swiper;
                  }}
                  breakpoints={{
                    0: {slidesPerView: 1},
                    768: {slidesPerView: 2},
                    1024: {slidesPerView: 3},
                  }}
              >
                {reviews.map((review:any, i:number) => (
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
                                  ? prev.filter((i:number) => i !== index)
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
                <a href="https://t.me/volodymyrbbk" target="_blank" rel="noreferrer">
                  <div className="consult_button">
                    {t.home.consult.button}
                  </div>
                </a>
              </div>
              <picture>
                <source media="(max-width: 767px)" srcSet={select_bot_img_mob.src} />
                <source media="(min-width: 768px)" srcSet={select_bot_img.src} />
                <img src={select_bot_img.src} alt="Consultation" className="main_img" />
              </picture>
            </div>
          </motion.div>

          <motion.div className="footer" {...fadeUp}>
            <a href="/">
              <img src="./images/logo.svg" alt="Logo" className="logo_img"/>
            </a>
            <hr/>

            {isMobile ?
                <div className="society_block">
                  <div>
                    <a href="https://t.me/+uKCqVOr1OAE2ZmQy" target="_blank" rel="noreferrer">
                      <img src="/src/app/images/tg_icon.svg" alt=""/>
                    </a>
                  </div>
                  <div>
                    <a href="https://www.instagram.com/alg0_bots?igsh=NW82eGFuajRlYmpw" target="_blank"
                       rel="noreferrer">
                      <img src="/src/app/images/insta_icon.svg" alt=""/>
                    </a>
                  </div>
                  <div>
                    <a href="https://www.youtube.com/@alg0_ofx" target="_blank" rel="noreferrer">
                      <img src="/src/app/images/youtube_icon.svg" alt=""/>
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
      </div>
  );
};

export default MainPage;