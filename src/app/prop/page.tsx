
import {Metadata} from "next";


import { translations } from '@/translations';
import PropClientComponent from "@/app/prop/PropClientComponent";

export async function generateMetadata(): Promise<Metadata> {
    const t = translations["EN"];

    return {
        title: t.prop.seo.title,
        description: t.prop.seo.description,
        keywords: t.prop.seo.keywords,
        openGraph: {
            title: t.prop.seo.title,
            description: t.prop.seo.description,
            url: "https://algo-market.com/prop",
            images: [
                {
                    url: '/images/logo192.png',
                    width: 192,
                    height: 192,
                },
            ],
        },
        twitter: {
            title: t.prop.seo.title,
            description: t.prop.seo.description,
        },
        alternates: {
            canonical: "https://algo-market.com/prop"
        },
    };
}

const Page = () => {
    return (
        <PropClientComponent/>
    );
};

export default Page;