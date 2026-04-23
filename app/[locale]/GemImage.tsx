"use client";
import emitter from "@/lib/emitter";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { usePathname } from "@/i18n/navigation";

interface Props {
  src: string;
  alt: string;
  leftHref: string | null;
  rightHref: string | null;
  glowColor: string;
  className?: string;
}

export default function GemImage({
  src,
  alt,
  leftHref,
  rightHref,
  glowColor,
  className,
}: Props) {
  const [lit, setLit] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onHover = ({ buttonHref }: { buttonHref: string }) => {
      if (buttonHref === leftHref || buttonHref === rightHref) {
        setLit(true);
      }
    };
    const onUnhover = ({ buttonHref }: { buttonHref: string }) => {
      if (buttonHref === leftHref || buttonHref === rightHref) {
        setLit(false);
      }
    };

    emitter.on("nav:hover", onHover);
    emitter.on("nav:unhover", onUnhover);
    return () => {
      emitter.off("nav:hover", onHover);
      emitter.off("nav:unhover", onUnhover);
    };
  }, [leftHref, rightHref]);

  const isLit = lit || pathname === leftHref || pathname === rightHref;
  return (
    <motion.div
      animate={
        isLit
          ? {
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.05, 1],
            }
          : {
              opacity: 1,
              scale: 1,
            }
      }
      transition={
        isLit
          ? {
              duration: 2,
              repeat: Infinity,
            }
          : { duration: 0 }
      }
    >
      <Image
        src={src}
        alt={alt}
        width={66}
        height={100}
        priority
        className={`pointer-events-none h-[26px] w-[16px] transition-all duration-300 select-none ${className}`}
        style={{
          filter: isLit
            ? `drop-shadow(0 0 6px rgba(${glowColor}, 0.9)) drop-shadow(0 0 12px rgba(${glowColor}, 0.5)) brightness(1.3)`
            : "drop-shadow(0 2px 2px rgba(0,0,0,0.8))",
        }}
        unoptimized
      />
    </motion.div>
  );
}
