"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import emitter from "@/lib/emitter";

export default function Loading() {
  const [letterScale, setLetterScaleScale] = useState(1);
  const [showLoading, setShowLoading] = useState(true);
  const animationEndRef = useRef(false);

  useEffect(() => {
    const minWidth = 400;
    const maxWidth = 1920;

    const resize = () => {
      const clampedWidth = Math.max(
        minWidth,
        Math.min(maxWidth, window.innerWidth),
      );
      const t = (clampedWidth - minWidth) / (maxWidth - minWidth);
      const scale = 0.5 + (1 - 0.5) * t;
      setLetterScaleScale(scale);
    };

    resize();

    window.addEventListener("resize", resize);
    emitter.on("loading:end", () => {
      if (animationEndRef.current) {
        setShowLoading(false);
      } else {
        const interval = setInterval(() => {
          if (animationEndRef.current) {
            setShowLoading(false);
            clearInterval(interval);
          }
        }, 100);
      }
    });

    const timeout = setTimeout(() => {
      animationEndRef.current = true;
    }, 2000);

    return () => {
      clearTimeout(timeout);
      animationEndRef.current = false;
      window.removeEventListener("resize", resize);
      emitter.off("loading:end");
    };
  }, []);
  const pulseAnimate = {
    opacity: 1,
    scale: [0.95, 1, 0.95, 1, 0.95, 0.95],
    filter: [
      "drop-shadow(0px 0px 10px rgba(153, 101, 21, 0.8))",
      "drop-shadow(0px 0px 5px rgba(153, 101, 21, 0.6))",
      "drop-shadow(0px 0px 10px rgba(153, 101, 21, 0.8))",
      "drop-shadow(0px 0px 5px rgba(153, 101, 21, 0.6))",
      "drop-shadow(0px 0px 10px rgba(153, 101, 21, 0.8))",
      "drop-shadow(0px 0px 10px rgba(153, 101, 21, 0.8))",
    ],
  };

  const letterPulseAnimate = {
    opacity: [0, 1],
    scale: [0.95, 1, 0.95, 1, 0.95, 0.95],
    filter: [
      "drop-shadow(0px 0px 5px rgba(153, 101, 21, 0.8))",
      "drop-shadow(0px 0px 0px rgba(153, 101, 21, 0.6))",
      "drop-shadow(0px 0px 5px rgba(153, 101, 21, 0.8))",
      "drop-shadow(0px 0px 0px rgba(153, 101, 21, 0.6))",
      "drop-shadow(0px 0px 5px rgba(153, 101, 21, 0.8))",
      "drop-shadow(0px 0px 5px rgba(153, 101, 21, 0.8))",
    ],
  };

  const pulseTransition = {
    opacity: {
      duration: 2,
      ease: "linear" as const,
    },
    scale: {
      duration: 3.5,
      times: [0, 0.15, 0.3, 0.45, 0.6, 1],
      ease: "linear" as const,
    },
    filter: {
      duration: 3.5,
      times: [0, 0.15, 0.3, 0.45, 0.6, 1],
      ease: "linear" as const,
    },
  };

  const getLetterPulseTransition = (delay: number) => ({
    opacity: {
      duration: 0.8,
      delay,
      ease: "linear" as const,
    },
    scale: {
      duration: 1,
      times: [0, 0.15, 0.3, 0.45, 0.6, 1],
      delay,
      ease: "linear" as const,
    },
    filter: {
      duration: 1,
      times: [0, 0.15, 0.3, 0.45, 0.6, 1],
      delay,
      ease: "linear" as const,
    },
  });

  return (
    <AnimatePresence>
      {showLoading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)", skewX: 5 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="bg-background fixed inset-0 z-9999"
        >
          <div className="relative top-[93px] flex h-[291px] justify-center">
            <motion.div
              initial={{
                opacity: 0,
                filter: "drop-shadow(0px 0px 5px rgba(153, 101, 21, 0.8))",
              }}
              animate={pulseAnimate}
              transition={pulseTransition}
            >
              <Image
                src="/loading/loading-tree.png"
                alt="loading tree"
                width={420}
                height={415}
                priority
                className="pointer-events-none h-[291px] w-auto max-w-none select-none"
                unoptimized
              />
            </motion.div>
            <div
              style={{ scale: letterScale }}
              className="absolute bottom-[-340px] left-1/2 flex h-[360px] w-[800px] origin-top -translate-x-1/2 justify-between"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  filter: "drop-shadow(0px 0px 5px rgba(153, 101, 21, 0.8))",
                }}
                animate={letterPulseAnimate}
                transition={getLetterPulseTransition(0)}
              >
                <Image
                  src="/loading/a.png"
                  alt="a"
                  width={820}
                  height={1250}
                  priority
                  className="pointer-events-none h-[323px] w-auto select-none"
                  unoptimized
                />
              </motion.div>
              <motion.div
                initial={{
                  opacity: 0,
                  filter: "drop-shadow(0px 0px 5px rgba(153, 101, 21, 0.8))",
                }}
                animate={letterPulseAnimate}
                transition={getLetterPulseTransition(0.5)}
              >
                <Image
                  src="/loading/f.png"
                  alt="f"
                  width={600}
                  height={1200}
                  priority
                  className="pointer-events-none h-[325px] w-auto select-none"
                  unoptimized
                />
              </motion.div>
              <motion.div
                initial={{
                  opacity: 0,
                  filter: "drop-shadow(0px 0px 5px rgba(153, 101, 21, 0.8))",
                }}
                animate={letterPulseAnimate}
                transition={getLetterPulseTransition(1)}
              >
                <Image
                  src="/loading/e.png"
                  alt="e"
                  width={660}
                  height={1210}
                  priority
                  className="pointer-events-none h-[333px] w-auto select-none"
                  unoptimized
                />
              </motion.div>
              <motion.div
                initial={{
                  opacity: 0,
                  filter: "drop-shadow(0px 0px 5px rgba(153, 101, 21, 0.8))",
                }}
                animate={letterPulseAnimate}
                transition={getLetterPulseTransition(1.5)}
              >
                <Image
                  src="/loading/s.png"
                  alt="s"
                  width={826}
                  height={1290}
                  priority
                  className="pointer-events-none h-[360px] w-auto select-none"
                  unoptimized
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
