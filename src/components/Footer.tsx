"use client"
import React, {useEffect, useState} from 'react';
import logo from "@/app/images/logo.svg";
import tg_icon from "@/app/images/tg_icon.svg";
import youtube_icon from "@/app/images/youtube_icon.svg";
import {HTMLMotionProps, motion} from "framer-motion";
import {useLanguage} from "@/context/LanguageProvider";

const Footer = () => {


    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);
    const {t, language, setLanguage} = useLanguage();


    const fastEase = [0.25, 0.1, 0.25, 1.0];


    const baseTransition: any = {duration: 0.7, ease: fastEase};
    const baseViewport = {once: true, amount: 0.1};

    const fadeUp: HTMLMotionProps<any> = {
        initial: {opacity: 0, y: 30, translateZ: 0},
        whileInView: {opacity: 1, y: 0, translateZ: 0},
        viewport: baseViewport,
        transition: baseTransition
    };

    return (
        <>
            <motion.div className="footer" {...fadeUp}>
                <a href="/">
                    <img src={logo.src} alt="Logo" className="logo_img"/>
                </a>
                <hr/>

                {isMobile ?
                    <div className="society_block">
                        <div>
                            <a href={language === "EN" ? "https://t.me/algoworId" : "https://t.me/+uKCqVOr1OAE2ZmQy"}
                               target="_blank" rel="noreferrer">
                                <img src={tg_icon.src} alt=""/>
                            </a>
                        </div>
                        {/*<div>
                            <a href="https://www.instagram.com/alg0_bots?igsh=NW82eGFuajRlYmpw" target="_blank"
                               rel="noreferrer">
                                <img src={instagram_icon.src} alt=""/>
                            </a>
                        </div>*/}
                        <div>
                            <a href={language === "EN" ? "https://www.youtube.com/channel/UCUdEXqsf87y8gSnz7FjxS8g" : "https://www.youtube.com/@alg0_ofx"}
                               target="_blank"
                               rel="noreferrer">
                                <img src={youtube_icon.src} alt=""/>
                            </a>
                        </div>
                    </div>

                    : <div className="society_block">
                        {/* <div>
                           <a href="https://www.instagram.com/alg0_bots?igsh=NW82eGFuajRlYmpw">{t.terra.footer.instagram}</a>
                        </div>*/}
                        <div>
                            <a href={language === "EN" ? "https://www.youtube.com/channel/UCUdEXqsf87y8gSnz7FjxS8g" : "https://www.youtube.com/@alg0_ofx"}>{t.terra.footer.youtube}</a>
                        </div>
                        <div>
                            <a href={language === "EN" ? "https://t.me/algoworId" : "https://t.me/+uKCqVOr1OAE2ZmQy"}>{t.terra.footer.telegram}</a>
                        </div>
                    </div>}
            </motion.div>
            <div className = "tech_page_list">
                <a href = "/terms-and-conditions">Terms & Conditions</a>
                <a href = "/software-use-trading-risk-disclosure">Software Use & Trading Risk Disclosure</a>
                <a href = "/privacy-policy">Privacy Policy</a>
            </div>
        </>
    );
};

export default Footer;