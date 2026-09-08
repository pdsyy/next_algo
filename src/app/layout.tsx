import type { Metadata } from "next";
import React, { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono, Geologica, Inter, Manrope } from "next/font/google";
import { cookies } from "next/headers";
import "swiper/css";
import "swiper/css/pagination";
import "./globals.css";
import "./styles/mainPageStyle.css";
import "./styles/terra.css";
import "./styles/aero.css";
import "./styles/hydro.css";
import "./styles/prop.css";
import Providers from "@/components/Providers";
import PaymentSuccessPopup from "@/components/PaymentSuccessPopup";
import { Language } from "@/context/LanguageProvider";

const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});
const geistMono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
const geologica=Geologica({subsets:["latin","cyrillic"],variable:"--font-geologica"});
const inter=Inter({subsets:["latin","cyrillic"],variable:"--font-inter"});
const manrope=Manrope({subsets:["latin","cyrillic"],variable:"--font-manrope",preload:true});

export const metadata:Metadata={
    title:"ALGO — Algorithmic Trading and Trading Bots | ALGO Trading",
    description:"Automated trading bots with transparent statistics. Passive income in trading without the human factor. Choose your bot: Terra, Aero, or Hydro EA.",
    metadataBase:new URL("https://algo-world.com/"),
    openGraph:{title:"ALGO — Algorithmic Trading and Trading Bots | ALGO Trading",description:"Automated trading bots with transparent statistics. Passive income in trading without the human factor. Choose your bot: Terra, Aero, or Hydro EA.",url:"https://algo-world.com",siteName:"ALGO Official",images:[{url:"/images/logo192.png",width:192,height:192}],type:"website"},
    icons:{icon:[{url:"/favicon.png"},{url:"/favicon.png",sizes:"16x16",type:"image/png"}],apple:[{url:"/logo192.png"}],other:[{rel:"mask-icon",url:"/logo192.png",color:"#5bbad5"}]},
};

const supportedLanguages:Language[]=["UA","RU","EN"];
const isLanguage=(value:string|undefined):value is Language=>supportedLanguages.includes(value as Language);

export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){
    const cookieStore=await cookies();
    const savedLanguage=cookieStore.get("algo_lang")?.value;
    const initialLanguage:Language=isLanguage(savedLanguage)?savedLanguage:"EN";
    return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${geologica.variable} ${inter.variable} ${manrope.variable}`}>
    <body>
    <Providers initialLanguage={initialLanguage}>
        {children}
        <Suspense fallback={null}><PaymentSuccessPopup/></Suspense>
    </Providers>
    <SpeedInsights/>
    </body>
    </html>;
}
