"use client";
import emitter from "@/lib/emitter";
import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";

interface Props {
  href: string;
  title: string;
  onClick?: () => void;
  isMobile?: boolean;
}

export default function NavButton({ href, title, isMobile, onClick }: Props) {
  const pathname = usePathname();
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const isActive = pathname === href;

  useEffect(() => {
    const sendEmitter = () => {
      if (isActive && buttonRef.current && buttonRef.current.offsetWidth > 0) {
        emitter.emit("nav:active", {
          rect: buttonRef.current.getBoundingClientRect(),
        });
      }
    };

    sendEmitter();

    window.addEventListener("resize", sendEmitter);
    return () => {
      window.removeEventListener("resize", sendEmitter);
    };
  }, [isActive]);

  return (
    <motion.div
      animate={
        isActive
          ? {
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.02, 1],
            }
          : {
              opacity: 1,
              scale: 1,
            }
      }
      transition={
        isActive
          ? {
              duration: 2,
              repeat: Infinity,
            }
          : { duration: 0 }
      }
    >
      <Link
        href={href}
        ref={buttonRef}
        onMouseEnter={() => emitter.emit("nav:hover", { buttonHref: href })}
        onMouseLeave={() => emitter.emit("nav:unhover", { buttonHref: href })}
        onClick={onClick}
        className={`group cursor-pointer p-[10px] font-bold ${isMobile ? "text-[30px]" : "text-[22px]"}`}
      >
        <span
          style={{ WebkitTextStroke: "0.2px rgba(100, 60, 0, 0.8)" }}
          className={`z-10 drop-shadow-[0_2px_2px_rgba(153,101,21,0.8)] transition-all duration-300 group-hover:text-[#ffb700] group-hover:drop-shadow-[0_2px_3px_rgba(80,40,0,0.9)] ${isActive ? "text-[#ffb700] drop-shadow-[0_2px_3px_rgba(80,40,0,0.9)]" : ""} `}
        >
          {title}
        </span>
      </Link>
    </motion.div>
  );
}
