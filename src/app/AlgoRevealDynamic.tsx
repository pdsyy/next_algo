"use client";

import dynamic from "next/dynamic";

const AlgoReveal = dynamic(() => import("./AlgoReveal"), {
    ssr: false,
    loading: () => null,
});

export default function AlgoRevealDynamic() {
    return <AlgoReveal />;
}