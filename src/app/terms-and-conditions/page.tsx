"use client";

import "../tech.css";
import { useLanguage } from "@/context/LanguageProvider";
import Footer from "@/components/Footer";

const Page = () => {
    const { t, language } = useLanguage();
    return (
        <div className="tech_page">
            <article className="legal_page" lang={language === "UA" ? "uk" : language === "RU" ? "ru" : "en"} aria-labelledby="terms-conditions-title">
                <header className="legal_page_header">
                    <h1 className="legal_page_title" id="terms-conditions-title">{t.termsConditions.title}</h1>
                    <p className="legal_page_updated">{t.termsConditions.lastUpdated}</p>
                    <p className="legal_page_text">{t.termsConditions.intro.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.intro.paragraph2}</p>
                    <p className="legal_page_text">{t.termsConditions.intro.paragraph3}</p>
                </header>
                <section className="legal_page_section" aria-labelledby="terms-section-1">
                    <h2 className="legal_page_heading" id="terms-section-1">{t.termsConditions.whoWeAre.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.whoWeAre.paragraph1}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.termsConditions.whoWeAre.label1}</strong>{" "}{t.termsConditions.whoWeAre.paragraph2}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.termsConditions.whoWeAre.label2}</strong>{" "}{t.termsConditions.whoWeAre.paragraph3}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.termsConditions.whoWeAre.label3}</strong>{" "}{t.termsConditions.whoWeAre.paragraph4}</p>
                    <p className="legal_page_text">{t.termsConditions.whoWeAre.paragraph5}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.termsConditions.whoWeAre.label4}</strong>{" "}<a className="legal_page_link" href="https://algo-world.com">{t.termsConditions.whoWeAre.linkText1}</a></p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-2">
                    <h2 className="legal_page_heading" id="terms-section-2">{t.termsConditions.products.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.products.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.products.paragraph2}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.termsConditions.products.item1}</li>
                        <li className="legal_page_list_item">{t.termsConditions.products.item2}</li>
                        <li className="legal_page_list_item">{t.termsConditions.products.item3}</li>
                        <li className="legal_page_list_item">{t.termsConditions.products.item4}</li>
                        <li className="legal_page_list_item">{t.termsConditions.products.item5}</li>
                        <li className="legal_page_list_item">{t.termsConditions.products.item6}</li>
                    </ul>
                    <p className="legal_page_text">{t.termsConditions.products.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-3">
                    <h2 className="legal_page_heading" id="terms-section-3">{t.termsConditions.noAdvice.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.noAdvice.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.noAdvice.paragraph2}</p>
                    <p className="legal_page_text">{t.termsConditions.noAdvice.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-4">
                    <h2 className="legal_page_heading" id="terms-section-4">{t.termsConditions.responsibility.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.responsibility.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.responsibility.paragraph2}</p>
                    <p className="legal_page_text">{t.termsConditions.responsibility.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-5">
                    <h2 className="legal_page_heading" id="terms-section-5">{t.termsConditions.eligibility.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.eligibility.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.eligibility.paragraph2}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.termsConditions.eligibility.item1}</li>
                        <li className="legal_page_list_item">{t.termsConditions.eligibility.item2}</li>
                        <li className="legal_page_list_item">{t.termsConditions.eligibility.item3}</li>
                        <li className="legal_page_list_item">{t.termsConditions.eligibility.item4}</li>
                    </ul>
                    <p className="legal_page_text">{t.termsConditions.eligibility.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-6">
                    <h2 className="legal_page_heading" id="terms-section-6">{t.termsConditions.licenses.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.licenses.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.licenses.paragraph2}</p>
                    <p className="legal_page_text">{t.termsConditions.licenses.paragraph3}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.termsConditions.licenses.item1}</li>
                        <li className="legal_page_list_item">{t.termsConditions.licenses.item2}</li>
                        <li className="legal_page_list_item">{t.termsConditions.licenses.item3}</li>
                        <li className="legal_page_list_item">{t.termsConditions.licenses.item4}</li>
                    </ul>
                    <p className="legal_page_text">{t.termsConditions.licenses.paragraph4}</p>
                    <p className="legal_page_text">{t.termsConditions.licenses.paragraph5}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.termsConditions.licenses.item5}</li>
                        <li className="legal_page_list_item">{t.termsConditions.licenses.item6}</li>
                        <li className="legal_page_list_item">{t.termsConditions.licenses.item7}</li>
                        <li className="legal_page_list_item">{t.termsConditions.licenses.item8}</li>
                        <li className="legal_page_list_item">{t.termsConditions.licenses.item9}</li>
                        <li className="legal_page_list_item">{t.termsConditions.licenses.item10}</li>
                        <li className="legal_page_list_item">{t.termsConditions.licenses.item11}</li>
                    </ul>
                    <p className="legal_page_text">{t.termsConditions.licenses.paragraph6}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-7">
                    <h2 className="legal_page_heading" id="terms-section-7">{t.termsConditions.requirements.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.requirements.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.requirements.paragraph2}</p>
                    <p className="legal_page_text">{t.termsConditions.requirements.paragraph3}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.termsConditions.requirements.item1}</li>
                        <li className="legal_page_list_item">{t.termsConditions.requirements.item2}</li>
                        <li className="legal_page_list_item">{t.termsConditions.requirements.item3}</li>
                        <li className="legal_page_list_item">{t.termsConditions.requirements.item4}</li>
                        <li className="legal_page_list_item">{t.termsConditions.requirements.item5}</li>
                        <li className="legal_page_list_item">{t.termsConditions.requirements.item6}</li>
                    </ul>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-8">
                    <h2 className="legal_page_heading" id="terms-section-8">{t.termsConditions.orders.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.orders.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.orders.paragraph2}</p>
                    <p className="legal_page_text">{t.termsConditions.orders.paragraph3}</p>
                    <p className="legal_page_text">{t.termsConditions.orders.paragraph4}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-9">
                    <h2 className="legal_page_heading" id="terms-section-9">{t.termsConditions.pricing.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.pricing.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.pricing.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-10">
                    <h2 className="legal_page_heading" id="terms-section-10">{t.termsConditions.refunds.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.refunds.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.refunds.paragraph2}</p>
                    <p className="legal_page_text">{t.termsConditions.refunds.paragraph3}</p>
                    <div className="legal_page_subsection">
                        <h3 className="legal_page_subtitle">{t.termsConditions.refunds.subtitle1}</h3>
                        <p className="legal_page_text">{t.termsConditions.refunds.paragraph4}</p>
                        <ul className="legal_page_list">
                            <li className="legal_page_list_item">{t.termsConditions.refunds.item1}</li>
                            <li className="legal_page_list_item">{t.termsConditions.refunds.item2}</li>
                            <li className="legal_page_list_item">{t.termsConditions.refunds.item3}</li>
                            <li className="legal_page_list_item">{t.termsConditions.refunds.item4}</li>
                        </ul>
                    </div>
                    <div className="legal_page_subsection">
                        <h3 className="legal_page_subtitle">{t.termsConditions.refunds.subtitle2}</h3>
                        <p className="legal_page_text">{t.termsConditions.refunds.paragraph5}</p>
                        <ul className="legal_page_list">
                            <li className="legal_page_list_item">{t.termsConditions.refunds.item5}</li>
                            <li className="legal_page_list_item">{t.termsConditions.refunds.item6}</li>
                            <li className="legal_page_list_item">{t.termsConditions.refunds.item7}</li>
                        </ul>
                        <p className="legal_page_text">{t.termsConditions.refunds.paragraph6}</p>
                    </div>
                    <div className="legal_page_subsection">
                        <h3 className="legal_page_subtitle">{t.termsConditions.refunds.subtitle3}</h3>
                        <p className="legal_page_text">{t.termsConditions.refunds.paragraph7}</p>
                    </div>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-11">
                    <h2 className="legal_page_heading" id="terms-section-11">{t.termsConditions.chargebacks.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.chargebacks.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.chargebacks.paragraph2}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.termsConditions.chargebacks.item1}</li>
                        <li className="legal_page_list_item">{t.termsConditions.chargebacks.item2}</li>
                        <li className="legal_page_list_item">{t.termsConditions.chargebacks.item3}</li>
                        <li className="legal_page_list_item">{t.termsConditions.chargebacks.item4}</li>
                    </ul>
                    <p className="legal_page_text">{t.termsConditions.chargebacks.paragraph3}</p>
                    <p className="legal_page_text">{t.termsConditions.chargebacks.paragraph4}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-12">
                    <h2 className="legal_page_heading" id="terms-section-12">{t.termsConditions.marketplaces.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.marketplaces.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.marketplaces.paragraph2}</p>
                    <p className="legal_page_text">{t.termsConditions.marketplaces.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-13">
                    <h2 className="legal_page_heading" id="terms-section-13">{t.termsConditions.support.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.support.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.support.paragraph2}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.termsConditions.support.item1}</li>
                        <li className="legal_page_list_item">{t.termsConditions.support.item2}</li>
                        <li className="legal_page_list_item">{t.termsConditions.support.item3}</li>
                        <li className="legal_page_list_item">{t.termsConditions.support.item4}</li>
                    </ul>
                    <p className="legal_page_text">{t.termsConditions.support.paragraph3}</p>
                    <p className="legal_page_text">{t.termsConditions.support.paragraph4}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-14">
                    <h2 className="legal_page_heading" id="terms-section-14">{t.termsConditions.updates.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.updates.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.updates.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-15">
                    <h2 className="legal_page_heading" id="terms-section-15">{t.termsConditions.acceptableUse.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.acceptableUse.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.termsConditions.acceptableUse.item1}</li>
                        <li className="legal_page_list_item">{t.termsConditions.acceptableUse.item2}</li>
                        <li className="legal_page_list_item">{t.termsConditions.acceptableUse.item3}</li>
                        <li className="legal_page_list_item">{t.termsConditions.acceptableUse.item4}</li>
                        <li className="legal_page_list_item">{t.termsConditions.acceptableUse.item5}</li>
                        <li className="legal_page_list_item">{t.termsConditions.acceptableUse.item6}</li>
                        <li className="legal_page_list_item">{t.termsConditions.acceptableUse.item7}</li>
                        <li className="legal_page_list_item">{t.termsConditions.acceptableUse.item8}</li>
                        <li className="legal_page_list_item">{t.termsConditions.acceptableUse.item9}</li>
                        <li className="legal_page_list_item">{t.termsConditions.acceptableUse.item10}</li>
                    </ul>
                    <p className="legal_page_text">{t.termsConditions.acceptableUse.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-16">
                    <h2 className="legal_page_heading" id="terms-section-16">{t.termsConditions.intellectualProperty.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.intellectualProperty.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.intellectualProperty.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-17">
                    <h2 className="legal_page_heading" id="terms-section-17">{t.termsConditions.thirdPartyServices.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.thirdPartyServices.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.thirdPartyServices.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-18">
                    <h2 className="legal_page_heading" id="terms-section-18">{t.termsConditions.privacy.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.privacy.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.privacy.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-19">
                    <h2 className="legal_page_heading" id="terms-section-19">{t.termsConditions.disclaimers.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.disclaimers.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.disclaimers.paragraph2}</p>
                    <p className="legal_page_text">{t.termsConditions.disclaimers.paragraph3}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.termsConditions.disclaimers.item1}</li>
                        <li className="legal_page_list_item">{t.termsConditions.disclaimers.item2}</li>
                        <li className="legal_page_list_item">{t.termsConditions.disclaimers.item3}</li>
                        <li className="legal_page_list_item">{t.termsConditions.disclaimers.item4}</li>
                        <li className="legal_page_list_item">{t.termsConditions.disclaimers.item5}</li>
                        <li className="legal_page_list_item">{t.termsConditions.disclaimers.item6}</li>
                    </ul>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-20">
                    <h2 className="legal_page_heading" id="terms-section-20">{t.termsConditions.liability.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.liability.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.liability.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-21">
                    <h2 className="legal_page_heading" id="terms-section-21">{t.termsConditions.indemnity.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.indemnity.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-22">
                    <h2 className="legal_page_heading" id="terms-section-22">{t.termsConditions.termination.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.termination.paragraph1}</p>
                    <p className="legal_page_text">{t.termsConditions.termination.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-23">
                    <h2 className="legal_page_heading" id="terms-section-23">{t.termsConditions.consumerRights.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.consumerRights.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-24">
                    <h2 className="legal_page_heading" id="terms-section-24">{t.termsConditions.changes.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.changes.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-25">
                    <h2 className="legal_page_heading" id="terms-section-25">{t.termsConditions.governingLaw.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.governingLaw.paragraph1}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="terms-section-26">
                    <h2 className="legal_page_heading" id="terms-section-26">{t.termsConditions.contact.title}</h2>
                    <p className="legal_page_text">{t.termsConditions.contact.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.termsConditions.contact.item1}</li>
                        <li className="legal_page_list_item">{t.termsConditions.contact.item2}</li>
                        <li className="legal_page_list_item">{t.termsConditions.contact.item3}</li>
                    </ul>
                </section>
            </article>
            <Footer/>
        </div>
    );
};

export default Page;