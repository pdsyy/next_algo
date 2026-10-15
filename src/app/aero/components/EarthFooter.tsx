import React, {useEffect, useState} from 'react';
import "@/app/styles/earthFooter.css"
import {useLanguage} from "@/context/LanguageProvider";
import {useScroll} from "@/context/ScrollContext";
import ParticleSphere from "@/app/aero/components/ParticleSphere";

const EarthFooter = () => {


    const {t, language, setLanguage} = useLanguage();


    const [activeBotList, setActiveBotList] = useState(false)

    const [activeMenu, setActiveMenu] = useState(false);
    useEffect(() => {
        setActiveMenu(false)
    }, [language])
    const {scrollToSection} = useScroll()!;
    const handleMenuClick = (id: string) => {
        scrollToSection(id);
        setActiveMenu(false);
    };

    return (
        <div className = "earth_container_fs">
        <div className="earth_footer_container">

            <div className="left_footer_menu">
                <a href="/" className = "footer_algo_logo"><img src="/images/logo.svg" alt="Logo" className="logo_img"/></a>

                <div className="footer_menu_item" onClick={() => handleMenuClick("how-it-works")}>
                    {t.home.header.howItWorks}
                </div>
                <div className="footer_menu_item" onClick={() => handleMenuClick("advantages")}>
                    {t.home.header.advantages}
                </div>
                <div className={`footer_menu_item ${activeBotList ? "active_bot_list" : ""}`}>
                    <span onClick={() => {
                        handleMenuClick("catalog")
                    }}>{t.home.header.catalog}</span>
                </div>

                <div className="footer_menu_item" onClick={() => handleMenuClick("reviews")}>
                    {t.home.header.reviews}
                </div>
                <div className="footer_menu_item" onClick={() => handleMenuClick("faq")}>
                    {t.home.header.faq}
                </div>

                <div className = "copyrights_algo mob_none">
                    @algo 2026
                </div>
            </div>

            <div className = "earth_container">
                <ParticleSphere   count={10000}
                                  color="#777777"
                                  radiusScale={0.42}
                                  hoverRadius={80}
                                  pushStrength={20}/>
            </div>


            <div className = "right_footer_menu">
                <a href="https://www.instagram.com/alg0_bots?igsh=NW82eGFuajRlYmpw" className = "footer_menu_item">{t.terra.footer.instagram}</a>
                <a href="https://www.youtube.com/@alg0_ofx" className = "footer_menu_item">{t.terra.footer.youtube}</a>
                <a href="https://t.me/+uKCqVOr1OAE2ZmQy" className = "footer_menu_item">{t.terra.footer.telegram}</a>

                <div className = "tech_page_footer_list mob_none">
                    <a href = "/terms-and-conditions" className = "footer_menu_item">Terms & Conditions</a>
                    <a href = "/software-use-trading-risk-disclosure" className = "footer_menu_item">Software Use & Trading Risk Disclosure</a>
                    <a href = "/privacy-policy" className = "footer_menu_item">Privacy Policy</a>
                </div>
            </div>


            <svg
                className="algo_world_label_bottom"
                viewBox="0 0 1344 120"
                preserveAspectRatio="none"
                role="img"
                aria-label="ALGO WORLD"
            >
                <defs>
                    <linearGradient
                        id="algoLabelGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="#232323" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#232323" stopOpacity="0"/>
                    </linearGradient>
                </defs>

                <text
                    x="0"
                    y="120"
                    textLength="1344"
                    lengthAdjust="spacingAndGlyphs"
                    fill="url(#algoLabelGradient)"
                >
                    ALGO WORLD
                </text>
            </svg>

        </div>
        </div>
    );
};

export default EarthFooter;