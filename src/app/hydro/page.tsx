import HydroClientComponent from "@/app/hydro/HydroClientComponent";
import {Metadata} from "next";


import { translations } from '@/translations';

export async function generateMetadata(): Promise<Metadata> {
    const t = translations["EN"];
    return {
        title: t.hydro.seo.title,
        description: t.hydro.seo.description,
        keywords: t.hydro.seo.keywords,
        openGraph: {
            title: t.hydro.seo.title,
            description: t.hydro.seo.description,
            url: "https://algo-market.com/hydro",
            images: [
                {
                    url: '/images/logo192.png',
                    width: 192,
                    height: 192,
                },
            ],

        },
        twitter: {
            title: t.hydro.seo.title,
            description: t.hydro.seo.description,
        },
        alternates:{
            canonical:"https://algo-market.com/hydro"
        }
    };
}

const Page = () => {
    return (
       <HydroClientComponent/>
    );
};

export default Page;