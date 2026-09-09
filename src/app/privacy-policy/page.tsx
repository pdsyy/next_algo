"use client";

import "../tech.css";
import { useLanguage } from "@/context/LanguageProvider";
import Footer from "@/components/Footer";

const Page = () => {
    const { t, language } = useLanguage();
    return (
        <div className="tech_page">
            <article className="legal_page" lang={language === "UA" ? "uk" : language === "RU" ? "ru" : "en"} aria-labelledby="privacy-policy-title">
                <header className="legal_page_header">
                    <h1 className="legal_page_title" id="privacy-policy-title">{t.privacyPolicy.title}</h1>
                    <p className="legal_page_updated">{t.privacyPolicy.lastUpdated}</p>
                    <p className="legal_page_text">{t.privacyPolicy.introduction}</p>
                    <p className="legal_page_text">{t.privacyPolicy.acknowledgement}</p>
                </header>
                <section className="legal_page_section" aria-labelledby="privacy-section-1">
                    <h2 className="legal_page_heading" id="privacy-section-1">{t.privacyPolicy.whoWeAre.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.whoWeAre.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.privacyPolicy.whoWeAre.item1}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.whoWeAre.item2}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.whoWeAre.item3}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.whoWeAre.item4}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.whoWeAre.item5}<a className="legal_page_link"
                                                                                                href="https://algo-world.com">{t.privacyPolicy.whoWeAre.linkText1}</a>
                        </li>
                    </ul>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-2">
                    <h2 className="legal_page_heading" id="privacy-section-2">{t.privacyPolicy.clarification.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.clarification.paragraph1}</p>
                    <p className="legal_page_text">{t.privacyPolicy.clarification.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-3">
                    <h2 className="legal_page_heading" id="privacy-section-3">{t.privacyPolicy.informationCollected.title}</h2>
                    <div className="legal_page_subsection">
                        <h3 className="legal_page_subtitle">{t.privacyPolicy.informationCollected.subtitle1}</h3>
                        <ul className="legal_page_list">
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item1}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item2}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item3}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item4}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item5}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item6}</li>
                        </ul>
                    </div>
                    <div className="legal_page_subsection">
                        <h3 className="legal_page_subtitle">{t.privacyPolicy.informationCollected.subtitle2}</h3>
                        <ul className="legal_page_list">
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item7}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item8}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item9}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item10}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item11}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item12}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item13}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item14}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item15}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item16}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item17}</li>
                        </ul>
                        <p className="legal_page_text">{t.privacyPolicy.informationCollected.paragraph1}</p>
                    </div>
                    <div className="legal_page_subsection">
                        <h3 className="legal_page_subtitle">{t.privacyPolicy.informationCollected.subtitle3}</h3>
                        <ul className="legal_page_list">
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item18}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item19}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item20}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item21}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item22}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item23}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item24}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item25}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item26}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item27}</li>
                        </ul>
                        <p className="legal_page_text">{t.privacyPolicy.informationCollected.paragraph2}</p>
                    </div>
                    <div className="legal_page_subsection">
                        <h3 className="legal_page_subtitle">{t.privacyPolicy.informationCollected.subtitle4}</h3>
                        <ul className="legal_page_list">
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item28}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item29}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item30}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item31}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item32}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item33}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item34}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item35}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item36}</li>
                        </ul>
                    </div>
                    <div className="legal_page_subsection">
                        <h3 className="legal_page_subtitle">{t.privacyPolicy.informationCollected.subtitle5}</h3>
                        <ul className="legal_page_list">
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item37}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item38}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item39}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item40}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item41}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item42}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item43}</li>
                        </ul>
                        <p className="legal_page_text">{t.privacyPolicy.informationCollected.paragraph3}</p>
                    </div>
                    <div className="legal_page_subsection">
                        <h3 className="legal_page_subtitle">{t.privacyPolicy.informationCollected.subtitle6}</h3>
                        <ul className="legal_page_list">
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item44}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item45}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item46}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item47}</li>
                        </ul>
                        <p className="legal_page_text">{t.privacyPolicy.informationCollected.paragraph4}</p>
                    </div>
                    <div className="legal_page_subsection">
                        <h3 className="legal_page_subtitle">{t.privacyPolicy.informationCollected.subtitle7}</h3>
                        <ul className="legal_page_list">
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item48}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item49}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item50}</li>
                            <li className="legal_page_list_item">{t.privacyPolicy.informationCollected.item51}</li>
                        </ul>
                        <p className="legal_page_text">{t.privacyPolicy.informationCollected.paragraph5}</p>
                    </div>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-4">
                    <h2 className="legal_page_heading" id="privacy-section-4">{t.privacyPolicy.collectionMethods.title}</h2>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.privacyPolicy.collectionMethods.item1}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.collectionMethods.item2}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.collectionMethods.item3}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.collectionMethods.item4}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.collectionMethods.item5}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.collectionMethods.item6}</li>
                    </ul>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-5">
                    <h2 className="legal_page_heading" id="privacy-section-5">{t.privacyPolicy.purposes.title}</h2>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.privacyPolicy.purposes.label1}</strong>{" "}{t.privacyPolicy.purposes.paragraph1}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.privacyPolicy.purposes.label2}</strong>{" "}{t.privacyPolicy.purposes.paragraph2}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.privacyPolicy.purposes.label3}</strong>{" "}{t.privacyPolicy.purposes.paragraph3}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.privacyPolicy.purposes.label4}</strong>{" "}{t.privacyPolicy.purposes.paragraph4}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.privacyPolicy.purposes.label5}</strong>{" "}{t.privacyPolicy.purposes.paragraph5}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.privacyPolicy.purposes.label6}</strong>{" "}{t.privacyPolicy.purposes.paragraph6}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.privacyPolicy.purposes.label7}</strong>{" "}{t.privacyPolicy.purposes.paragraph7}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-6">
                    <h2 className="legal_page_heading" id="privacy-section-6">{t.privacyPolicy.legalBases.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.legalBases.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item"><strong className="legal_page_emphasis">{t.privacyPolicy.legalBases.label1}</strong>{" "}{t.privacyPolicy.legalBases.paragraph2}</li>
                        <li className="legal_page_list_item"><strong className="legal_page_emphasis">{t.privacyPolicy.legalBases.label2}</strong>{" "}{t.privacyPolicy.legalBases.paragraph3}</li>
                        <li className="legal_page_list_item"><strong className="legal_page_emphasis">{t.privacyPolicy.legalBases.label3}</strong>{" "}{t.privacyPolicy.legalBases.paragraph4}</li>
                        <li className="legal_page_list_item"><strong className="legal_page_emphasis">{t.privacyPolicy.legalBases.label4}</strong>{" "}{t.privacyPolicy.legalBases.paragraph5}</li>
                    </ul>
                    <p className="legal_page_text">{t.privacyPolicy.legalBases.paragraph6}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-7">
                    <h2 className="legal_page_heading" id="privacy-section-7">{t.privacyPolicy.paymentProcessors.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.paymentProcessors.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-8">
                    <h2 className="legal_page_heading" id="privacy-section-8">{t.privacyPolicy.marketplaces.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.marketplaces.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-9">
                    <h2 className="legal_page_heading" id="privacy-section-9">{t.privacyPolicy.cookies.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.cookies.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-10">
                    <h2 className="legal_page_heading" id="privacy-section-10">{t.privacyPolicy.analytics.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.analytics.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-11">
                    <h2 className="legal_page_heading" id="privacy-section-11">{t.privacyPolicy.marketing.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.marketing.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-12">
                    <h2 className="legal_page_heading" id="privacy-section-12">{t.privacyPolicy.sharing.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.sharing.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.privacyPolicy.sharing.item1}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.sharing.item2}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.sharing.item3}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.sharing.item4}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.sharing.item5}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.sharing.item6}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.sharing.item7}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.sharing.item8}</li>
                    </ul>
                    <p className="legal_page_text">{t.privacyPolicy.sharing.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-13">
                    <h2 className="legal_page_heading" id="privacy-section-13">{t.privacyPolicy.internationalTransfers.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.internationalTransfers.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-14">
                    <h2 className="legal_page_heading" id="privacy-section-14">{t.privacyPolicy.retention.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.retention.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.privacyPolicy.retention.item1}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.retention.item2}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.retention.item3}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.retention.item4}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.retention.item5}</li>
                    </ul>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-15">
                    <h2 className="legal_page_heading" id="privacy-section-15">{t.privacyPolicy.security.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.security.paragraph1}</p>
                    <p className="legal_page_text">{t.privacyPolicy.security.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-16">
                    <h2 className="legal_page_heading" id="privacy-section-16">{t.privacyPolicy.rights.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.rights.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.privacyPolicy.rights.item1}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.rights.item2}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.rights.item3}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.rights.item4}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.rights.item5}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.rights.item6}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.rights.item7}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.rights.item8}</li>
                    </ul>
                    <p className="legal_page_text">{t.privacyPolicy.rights.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-17">
                    <h2 className="legal_page_heading" id="privacy-section-17">{t.privacyPolicy.children.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.children.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-18">
                    <h2 className="legal_page_heading" id="privacy-section-18">{t.privacyPolicy.tradingAccountData.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.tradingAccountData.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.privacyPolicy.tradingAccountData.item1}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.tradingAccountData.item2}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.tradingAccountData.item3}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.tradingAccountData.item4}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.tradingAccountData.item5}</li>
                    </ul>
                    <p className="legal_page_text">{t.privacyPolicy.tradingAccountData.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-19">
                    <h2 className="legal_page_heading" id="privacy-section-19">{t.privacyPolicy.community.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.community.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-20">
                    <h2 className="legal_page_heading" id="privacy-section-20">{t.privacyPolicy.externalLinks.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.externalLinks.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-21">
                    <h2 className="legal_page_heading" id="privacy-section-21">{t.privacyPolicy.automatedDecisions.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.automatedDecisions.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-22">
                    <h2 className="legal_page_heading" id="privacy-section-22">{t.privacyPolicy.policyChanges.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.policyChanges.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="privacy-section-23">
                    <h2 className="legal_page_heading" id="privacy-section-23">{t.privacyPolicy.contact.title}</h2>
                    <p className="legal_page_text">{t.privacyPolicy.contact.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.privacyPolicy.contact.item1}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.contact.item2}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.contact.item3}</li>
                        <li className="legal_page_list_item">{t.privacyPolicy.contact.item4}</li>
                    </ul>
                </section>
            </article>
            <Footer/>
        </div>
    );
};

export default Page;