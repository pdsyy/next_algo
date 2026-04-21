import React, {useState} from 'react';
import cross from "./components_images/popup_cross.svg";
import {useLanguage} from "@/context/LanguageProvider";

const ThxPopup = ({activePopup, setActivePopup, dark}:any) => {
    const { t } = useLanguage()!;

    return (
        <div className={`popup_fs ${activePopup ? "active_popup" : ""} ${dark ? "dark_mode" : ""}`} onClick={() => setActivePopup(false)}>
            <div className="popup_container_gradient thx" onClick={(e) => e.stopPropagation()}>
                <div className="popup_container">
                    <div className="thx_tex">
                        {t.thx.title}
                        <div className="cross_block_popup" onClick={() => setActivePopup(false)}>
                            <img src={cross} alt="close" />
                        </div>
                    </div>

                    <div className="thx_desc">
                        {t.thx.desc}
                    </div>

                    <a href="/">
                        <div className="main_page_button">
                            {t.thx.button}
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ThxPopup;