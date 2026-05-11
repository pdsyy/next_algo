import TerraClientComponent from "@/app/terra/TerraClientComponent";

import {Metadata} from "next";


import { translations } from '@/translations';

export async function generateMetadata(): Promise<Metadata> {
    const t = translations["EN"];

    return {
        title: t.terra.seo.title,
        description: t.terra.seo.description,
        keywords: t.terra.seo.keywords,
        openGraph: {
            title: t.terra.seo.title,
            description: t.terra.seo.description,
            url: "https://algo-market.com/terra",
            images: [
                {
                    url: '/images/logo192.png',
                    width: 192,
                    height: 192,
                },
            ],
        },
        twitter: {
            title: t.terra.seo.title,
            description: t.terra.seo.description,
        },
        alternates: {
            canonical: "https://algo-market.com/terra",
        },
    };
}
const Page = () => {
    return (
        <TerraClientComponent/>
    );
};

export default Page;