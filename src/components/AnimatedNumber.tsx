"usr client"
import { useEffect, useRef } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";

const AnimatedNumber = ({
                            value,
                            duration = 2,
                            ease = "easeOut"
                        }:any) => {
    const ref = useRef<any>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const numericValue = parseInt(value.replace(/\s|[^0-9]/g, ""), 10) || 0;

    const prefix = value.match(/^[^\d]+/)?.[0] || "";
    const suffix = value.match(/[^\d\s]+$/)?.[0] || "";

    const motionValue = useMotionValue(0);

    useEffect(() => {
        if (isInView) {
            animate(motionValue, numericValue, {
                type: "tween",
                duration: duration,
                ease: ease,
            });
        }
    }, [isInView, motionValue, numericValue, duration, ease]);

    useEffect(() => {
        return motionValue.on("change", (latest) => {
            if (ref.current) {
                const formatted = Math.floor(latest)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

                ref.current.textContent = `${prefix}${formatted}${suffix}`;
            }
        });
    }, [motionValue, prefix, suffix]);

    return <span ref={ref}>{prefix}0{suffix}</span>;
};

export default AnimatedNumber;