import React, {useEffect, useState} from 'react';
import {useScroll} from "@/context/ScrollContext";
import {useLanguage} from "@/context/LanguageProvider";
import YearMonthHandler from "./YearMonthHandler";
import TripleHandler from "./TripleHandler";
import Image from "next/image";
import {usePathname} from "next/navigation";

interface HeaderProps {
    dark: boolean,
    visibleHeader: boolean,
    setVisibleHeader: (visible: boolean) => void
    initialLanguage: string
}

const Header = ({dark, visibleHeader, setVisibleHeader, initialLanguage}: HeaderProps) => {



    const pathname = usePathname();

    const changeLanguage = (newLang: string) => {
        const segments = pathname.split('/');
        segments[1] = newLang;

        const newPath = segments.join('/');

        window.location.assign(newPath);
    };


    const {t, language, setLanguage} = useLanguage()!;


    const [activeBotList, setActiveBotList] = useState(false)
    const {scrollToSection} = useScroll()!;
    const [activeMenu, setActiveMenu] = useState(false);
    useEffect(() => {
        setActiveMenu(false)
    }, [language])

    const handleMenuClick = (id: string) => {
        scrollToSection(id);
        setActiveMenu(false);
    };

    const menuItems = [
        {name: t.home.header.howItWorks, id: "how-it-works"},
        {name: t.home.header.advantages, id: "advantages"},
        {name: t.home.header.catalog, id: "catalog"},
        {name: t.home.header.reviews, id: "reviews"},
        {name: t.home.header.faq, id: "faq"},
    ];

    return (
        <div
            className={`header_container liquidGlass-wrapper ${activeMenu ? "active_menu" : ""} ${dark ? "dark_header" : ""} ${visibleHeader ? "visible_header" : ""}`}>
            <div className="liquidGlass-effect"></div>
            <div className="liquidGlass-tint"></div>
            <div className="header liquidGlass-text">
                <a href="/"><img src={dark ? "/images/logoLight.svg" : "/images/logo.svg"} alt="Logo" className="logo_img"/></a>

                <div className="desktop_header_menu">
                    {/*menuItems.map((item) => (
                        <div key={item.id} onClick={() => handleMenuClick(item.id)}>
                            {item.name}
                        </div>
                    ))*/}
                    <div className="catalog_menu_item" onClick={() => handleMenuClick("how-it-works")}>
                        {t.home.header.howItWorks}
                    </div>
                    <div className="catalog_menu_item" onClick={() => handleMenuClick("advantages")}>
                        {t.home.header.advantages}
                    </div>
                    <div className={`catalog_menu_item ${activeBotList ? "active_bot_list" : ""}`} onMouseOver={(e) => {
                        setActiveBotList(true)
                    }} onMouseLeave={(e) => {
                        setActiveBotList(false)
                    }}>
                    <span onClick={() => {
                        handleMenuClick("catalog")
                    }}>{t.home.header.catalog}</span>
                        <img src={dark ? "/images/bottom_arrow_white.svg" : "/images/bottom_arrow.svg"}
                               className={activeBotList ? "reverse_arrow" : ""}
                               alt=""
                        />
                        <div className={`bots_list_desk_menu ${activeBotList ? "active_bot_list" : ""}`}>
                            <a href="/terra">
                                <div className="menu_item">Terra EA</div>
                            </a>
                            <a href="/aero">
                                <div className="menu_item">Aero EA</div>
                            </a>
                            <a href="/hydro">
                                <div className="menu_item">Hydro EA</div>
                            </a>
                            <a href="/prop">
                                <div className="menu_item prop_bot_menu">Prop EA <span>NEW</span></div>
                            </a>
                        </div>
                    </div>

                    <div className="catalog_menu_item" onClick={() => handleMenuClick("reviews")}>
                        {t.home.header.reviews}
                    </div>
                    <div className="catalog_menu_item" onClick={() => handleMenuClick("faq")}>
                        {t.home.header.faq}
                    </div>

                </div>

                <div className="lang_select_block">
                    {/*<div className="languages_block">
                        <div
                            className={language === "UA" ? "active" : ""}
                            onClick={() => setLanguage("UA")}
                        >
                            UA
                        </div>
                        <div
                            className={language === "RU" ? "active" : ""}
                            onClick={() => setLanguage("RU")}
                        >
                            RU
                        </div>
                        <div
                            className={language === "EN" ? "active" : ""}
                            onClick={() => setLanguage("EN")}
                        >
                            EN
                        </div>
                    </div>*/}
                    <div className="select_bot_button" onClick={() => handleMenuClick("catalog")}>
                        {t.home.hero.button}
                    </div>
                </div>

                <div className="burger_menu" onClick={() => setActiveMenu(!activeMenu)}>
                    <div className="burger_lines">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile_menu ${dark ? "prop_bot" : ""}`}>
                {/*menuItems.map((item) => (
                    <div key={item.id} className="menu_item" onClick={() => handleMenuClick(item.id)}>
                        {item.name}
                    </div>
                ))*/}
                <div className="menu_item" onClick={() => handleMenuClick("how-it-works")}>
                    {t.home.header.howItWorks}
                </div>
                <div className="menu_item" onClick={() => handleMenuClick("advantages")}>
                    {t.home.header.advantages}
                </div>
                <div className={`menu_item catalog_menu_item ${activeBotList ? "active_bot_list" : ""}`}>
                    <span onClick={() => {
                        handleMenuClick("catalog")
                    }}>{t.home.header.catalog}</span>
                    <img
                        src={dark ? "/images/bottom_arrow_white.svg" : "/images/bottom_arrow.svg"}
                        onClick={(e) => {
                            setActiveBotList(!activeBotList)
                            e.currentTarget.classList.toggle("reverse_arrow")
                        }}
                        alt=""
                    />
                </div>
                <div className={`bots_list_mob_menu ${activeBotList ? "active_bot_list" : ""}`}>
                    <a href="/terra">
                        <div className="menu_item">Terra EA</div>
                    </a>
                    <a href="/aero">
                        <div className="menu_item">Aero EA</div>
                    </a>
                    <a href="/hydro">
                        <div className="menu_item">Hydro EA</div>
                    </a>
                    <a href="/prop">
                        <div className="menu_item prop_bot_menu">Prop EA <span>NEW</span></div>
                    </a>
                </div>
                <div className="menu_item" onClick={() => handleMenuClick("reviews")}>
                    {t.home.header.reviews}
                </div>
                <div className="menu_item" onClick={() => handleMenuClick("faq")}>
                    {t.home.header.faq}
                </div>
                <div className="languages_block_mobile" style={{display: "none"}}>
                    <div
                        className={`lang_mob ${language === "UA" ? "active_item" : ""}`}
                        onClick={() => {
                            setLanguage("UA");
                            setActiveMenu(false);
                        }}
                    >
                        UA
                    </div>
                    <div
                        className={`lang_mob ${language === "RU" ? "active_item" : ""}`}
                        onClick={() => {
                            setLanguage("RU");
                            setActiveMenu(false);
                        }}
                    >
                        RU
                    </div>


                </div>

                {/*<TripleHandler items={["UA", "RU", "EN"]} setHandleValue={setLanguage} handleValue={language}/>*/}
                <div className="select_bot_button_mobile" onClick={() => handleMenuClick("catalog")}>
                    {t.home.hero.button}
                </div>
            </div>
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
    );
};

export default Header;