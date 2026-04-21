import type {Metadata} from "next";
import {Geist, Geist_Mono, Geologica, Inter, Manrope} from "next/font/google";
import {cookies} from 'next/headers';
import 'swiper/css';
import 'swiper/css/pagination';
import "./globals.css";
import "./styles/mainPageStyle.css"
import "./styles/terra.css"
import "./styles/aero.css"
import "./styles/hydro.css"
import "./styles/prop.css"
import Providers from "@/components/Providers";
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const geologica = Geologica({
    subsets: ["latin", "cyrillic"],
    variable: "--font-geologica",
});

const inter = Inter({
    subsets: ["latin", "cyrillic"],
    variable: "--font-inter",
});

const manrope = Manrope({
    subsets: ["latin", "cyrillic"],
    variable: "--font-manrope",
});

export const metadata: Metadata = {
    title: "ALGO — Algorithmic Trading and Trading Bots | ALGO Trading",
    description: "Automated trading bots with transparent statistics. Passive income in trading without the human factor. Choose your bot: Terra, Aero, or Hydro EA.",
    openGraph: {
        title: 'ALGO — Algorithmic Trading and Trading Bots | ALGO Trading',
        description: 'Automated trading bots with transparent statistics. Passive income in trading without the human factor. Choose your bot: Terra, Aero, or Hydro EA.',
        url: 'https://algo-market.com',
        siteName: 'ALGO Official',
        images: [
            {
                url: '/images/logo512.png',
                width: 512,
                height: 512,
            },
        ],
        type: 'website',
    },
    icons: {
        icon: [
            { url: '/favicon.png' },
            { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
        ],
        apple: [
            { url: '/logo192.png' },
        ],

        other: [
            {
                rel: 'mask-icon',
                url: '/logo192.png',
                color: '#5bbad5',
            },
        ],
    },
};

export default async function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {

    const cookieStore = await cookies();
    const savedLang = cookieStore.get('algo_lang')?.value || "UA";

    return (
        <html lang="en" className={`
        ${geistSans.variable}
        ${geistMono.variable}
        ${geologica.variable} 
        ${inter.variable} 
        ${manrope.variable}
         `}>

        <body>
        <Providers initialLanguage={savedLang}>

            {children}
        </Providers>
        </body>
        </html>
    );
}
