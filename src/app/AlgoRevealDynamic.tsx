"use client";

import dynamic from "next/dynamic";

type Stage = "chunk" | "image" | "video";

type Props = {
    onStage?: (s: Stage) => void;
    onReady?: () => void;
};

const AlgoReveal = dynamic<Props>(() => import("./AlgoReveal"), {
    ssr: false,
    loading: () => null,
});

export default function AlgoRevealDynamic({ onStage, onReady }: Props) {
    return <AlgoReveal onStage={onStage} onReady={onReady} />;
}