import AeroClientComponent from "@/app/aero/AeroClientComponent";
import {Metadata} from "next";


import { translations } from '@/translations';

export async function generateMetadata(): Promise<Metadata> {
    const t = translations["EN"];

    return {
        title: t.aero.seo.title,
        description: t.aero.seo.description,
        keywords: t.aero.seo.keywords,
        openGraph: {
            title: t.aero.seo.title,
            description: t.aero.seo.description,
            url: "https://algo-market.com/aero",
            images: [
                {
                    url: '/images/logo192.png',
                    width: 192,
                    height: 192,
                },
            ],
        },
        twitter: {
            title: t.aero.seo.title,
            description: t.aero.seo.description,
        },
        alternates:{
            canonical:"https://algo-market.com/aero"
        }
    };
}

const AeroPage = () => {
    return (
        <AeroClientComponent/>
    );
};

export default AeroPage;