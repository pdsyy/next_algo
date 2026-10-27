"use client";

import dynamic from "next/dynamic";

type Stage = "chunk" | "image" | "video";

type Props = {
    onStage?: (s: Stage) => void;
    onReady?: () => void;
};

const loadAlgoReveal = () => import("./AlgoReveal");

const AlgoReveal = dynamic<Props>(loadAlgoReveal, {
    ssr: false,
    loading: () => null,
});


if (typeof window !== "undefined" && window.innerWidth > 768) {
    loadAlgoReveal();
}

export default function AlgoRevealDynamic({ onStage, onReady }: Props) {
    return <AlgoReveal onStage={onStage} onReady={onReady} />;
}