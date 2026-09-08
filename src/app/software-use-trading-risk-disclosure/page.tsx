"use client"

import "../tech.css"

import Footer from "@/components/Footer";
import {useLanguage} from "@/context/LanguageProvider";

const Page = () => {
    const { t, language } = useLanguage();
    return (
        <div className="tech_page">
            <article className="legal_page" lang={language === "UA" ? "uk" : language === "RU" ? "ru" : "en"} aria-labelledby="risk-disclosure-title">
                <header className="legal_page_header">
                    <h1 className="legal_page_title" id="risk-disclosure-title">{t.riskDisclosure.title}</h1>
                    <p className="legal_page_updated">{t.riskDisclosure.lastUpdated}</p>
                    <p className="legal_page_text">{t.riskDisclosure.intro.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.intro.paragraph2}</p>
                    <p className="legal_page_text">{t.riskDisclosure.intro.paragraph3}</p>
                    <p className="legal_page_text">{t.riskDisclosure.intro.paragraph4}</p>
                    <p className="legal_page_text">{t.riskDisclosure.intro.paragraph5}</p>
                    <p className="legal_page_text">{t.riskDisclosure.intro.paragraph6}</p>
                </header>
                <section className="legal_page_section" aria-labelledby="risk-section-1">
                    <h2 className="legal_page_heading" id="risk-section-1">{t.riskDisclosure.software.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.software.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.software.paragraph2}</p>
                    <p className="legal_page_text">{t.riskDisclosure.software.paragraph3}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.software.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.software.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.software.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.software.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.software.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.software.item6}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.software.paragraph4}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-2">
                    <h2 className="legal_page_heading" id="risk-section-2">{t.riskDisclosure.noAdvice.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.noAdvice.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.noAdvice.paragraph2}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.noAdvice.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noAdvice.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noAdvice.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noAdvice.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noAdvice.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noAdvice.item6}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noAdvice.item7}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noAdvice.item8}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noAdvice.item9}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noAdvice.item10}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.noAdvice.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-3">
                    <h2 className="legal_page_heading" id="risk-section-3">{t.riskDisclosure.userResponsibility.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.userResponsibility.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.userResponsibility.paragraph2}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.userResponsibility.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.userResponsibility.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.userResponsibility.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.userResponsibility.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.userResponsibility.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.userResponsibility.item6}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.userResponsibility.item7}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.userResponsibility.item8}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.userResponsibility.item9}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.userResponsibility.item10}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.userResponsibility.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-4">
                    <h2 className="legal_page_heading" id="risk-section-4">{t.riskDisclosure.tradingRisk.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.tradingRisk.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.tradingRisk.paragraph2}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.tradingRisk.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.tradingRisk.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.tradingRisk.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.tradingRisk.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.tradingRisk.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.tradingRisk.item6}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.tradingRisk.item7}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.tradingRisk.paragraph3}</p>
                    <p className="legal_page_text">{t.riskDisclosure.tradingRisk.paragraph4}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-5">
                    <h2 className="legal_page_heading" id="risk-section-5">{t.riskDisclosure.noGuarantee.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.noGuarantee.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.noGuarantee.paragraph2}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item6}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item7}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item8}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item9}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item10}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item11}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item12}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.noGuarantee.item13}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.noGuarantee.paragraph3}</p>
                    <p className="legal_page_text">{t.riskDisclosure.noGuarantee.paragraph4}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-6">
                    <h2 className="legal_page_heading" id="risk-section-6">{t.riskDisclosure.performanceExamples.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.performanceExamples.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.performanceExamples.paragraph2}</p>
                    <p className="legal_page_text">{t.riskDisclosure.performanceExamples.paragraph3}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item6}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item7}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item8}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item9}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.performanceExamples.paragraph4}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item10}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item11}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item12}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item13}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item14}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item15}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item16}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.performanceExamples.item17}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.performanceExamples.paragraph5}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-7">
                    <h2 className="legal_page_heading" id="risk-section-7">{t.riskDisclosure.configurationRisk.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.configurationRisk.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.configurationRisk.paragraph2}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.configurationRisk.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.configurationRisk.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.configurationRisk.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.configurationRisk.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.configurationRisk.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.configurationRisk.item6}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.configurationRisk.item7}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.configurationRisk.item8}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.configurationRisk.item9}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.configurationRisk.paragraph3}</p>
                    <p className="legal_page_text">{t.riskDisclosure.configurationRisk.paragraph4}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-8">
                    <h2 className="legal_page_heading" id="risk-section-8">{t.riskDisclosure.dependencies.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.dependencies.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.dependencies.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.dependencies.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.dependencies.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.dependencies.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.dependencies.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.dependencies.item6}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.dependencies.item7}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.dependencies.item8}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.dependencies.paragraph2}</p>
                    <p className="legal_page_text">{t.riskDisclosure.dependencies.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-9">
                    <h2 className="legal_page_heading" id="risk-section-9">{t.riskDisclosure.automatedExecution.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.automatedExecution.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.automatedExecution.paragraph2}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.automatedExecution.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.automatedExecution.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.automatedExecution.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.automatedExecution.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.automatedExecution.item5}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.automatedExecution.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-10">
                    <h2 className="legal_page_heading" id="risk-section-10">{t.riskDisclosure.thirdPartyPrograms.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.thirdPartyPrograms.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.thirdPartyPrograms.paragraph2}</p>
                    <p className="legal_page_text">{t.riskDisclosure.thirdPartyPrograms.paragraph3}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.thirdPartyPrograms.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.thirdPartyPrograms.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.thirdPartyPrograms.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.thirdPartyPrograms.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.thirdPartyPrograms.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.thirdPartyPrograms.item6}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.thirdPartyPrograms.paragraph4}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-11">
                    <h2 className="legal_page_heading" id="risk-section-11">{t.riskDisclosure.marketplaces.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.marketplaces.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.marketplaces.paragraph2}</p>
                    <p className="legal_page_text">{t.riskDisclosure.marketplaces.paragraph3}</p>
                    <p className="legal_page_text">{t.riskDisclosure.marketplaces.paragraph4}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-12">
                    <h2 className="legal_page_heading" id="risk-section-12">{t.riskDisclosure.reviews.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.reviews.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.reviews.paragraph2}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.reviews.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.reviews.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.reviews.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.reviews.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.reviews.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.reviews.item6}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.reviews.item7}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.reviews.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-13">
                    <h2 className="legal_page_heading" id="risk-section-13">{t.riskDisclosure.education.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.education.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.education.paragraph2}</p>
                    <p className="legal_page_text">{t.riskDisclosure.education.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-14">
                    <h2 className="legal_page_heading" id="risk-section-14">{t.riskDisclosure.precautions.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.precautions.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.precautions.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.precautions.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.precautions.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.precautions.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.precautions.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.precautions.item6}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.precautions.item7}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.precautions.item8}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.precautions.item9}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.precautions.item10}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.precautions.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-15">
                    <h2 className="legal_page_heading" id="risk-section-15">{t.riskDisclosure.liability.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.liability.paragraph1}</p>
                    <p className="legal_page_text">{t.riskDisclosure.liability.paragraph2}</p>
                    <p className="legal_page_text">{t.riskDisclosure.liability.paragraph3}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-16">
                    <h2 className="legal_page_heading" id="risk-section-16">{t.riskDisclosure.acceptance.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.acceptance.paragraph1}</p>
                    <ul className="legal_page_list">
                        <li className="legal_page_list_item">{t.riskDisclosure.acceptance.item1}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.acceptance.item2}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.acceptance.item3}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.acceptance.item4}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.acceptance.item5}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.acceptance.item6}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.acceptance.item7}</li>
                        <li className="legal_page_list_item">{t.riskDisclosure.acceptance.item8}</li>
                    </ul>
                    <p className="legal_page_text">{t.riskDisclosure.acceptance.paragraph2}</p>
                </section>
                <section className="legal_page_section" aria-labelledby="risk-section-17">
                    <h2 className="legal_page_heading" id="risk-section-17">{t.riskDisclosure.contact.title}</h2>
                    <p className="legal_page_text">{t.riskDisclosure.contact.paragraph1}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.riskDisclosure.contact.label1}</strong>{" "}{t.riskDisclosure.contact.paragraph2}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.riskDisclosure.contact.label2}</strong>{" "}{t.riskDisclosure.contact.paragraph3}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.riskDisclosure.contact.label3}</strong>{" "}{t.riskDisclosure.contact.paragraph4}</p>
                    <p className="legal_page_text"><strong className="legal_page_emphasis">{t.riskDisclosure.contact.label4}</strong>{" "}{t.riskDisclosure.contact.paragraph5}</p>
                    <p className="legal_page_text">{t.riskDisclosure.contact.paragraph6}</p>
                </section>
            </article>
            <Footer/>
        </div>
    );
};

export default Page;