"use client";

import { motion, AnimatePresence, animate } from "motion/react";
import Image from "next/image";
import { usePathname } from "@/i18n/navigation";
import { useEffect } from "react";
import { FrozenRouter } from "./FrozenRouter";

const MotionImage = motion.create(Image);

interface Props {
  children?: React.ReactNode;
  className?: string;
}

export default function Scroll(props: Props) {
  const pathname = usePathname();

  useEffect(() => {
    animate(window.scrollY, 0, {
      duration: 0.6,
      ease: "easeInOut",
      onUpdate: (latest) => window.scrollTo(0, latest),
    });
  }, [pathname]);

  return (
    <motion.div
      layout
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={`relative z-[1] ${props.className} flex w-screen flex-col items-center`}
    >
      <motion.div
        layout
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute top-0 bottom-0 z-[-1] mt-[5%] mb-[14%] w-[75%] rounded-[30px] border-[2px] border-[#aa7107] bg-gradient-to-r from-[#d2b882] via-[#f3ddb3] to-[#d2b882] opacity-90 shadow-[0_0_15px_rgba(0,0,0,0.3)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] min-[840px]:w-[55%]"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
        }}
      ></motion.div>
      <MotionImage
        layout
        transition={{ duration: 0.6, ease: "easeInOut" }}
        src="/page/scroll top.png"
        alt="scroll top"
        width={1500}
        height={585}
        className="pointer-events-none h-auto w-[95%] max-w-none opacity-80 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] select-none min-[840px]:w-[70%]"
        priority
      />
      <motion.div
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="mt-[-6%] mb-[2%] flex w-[65%] flex-col items-center min-[840px]:w-[50%]"
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            transition={{ duration: 0.6, ease: "easeInOut" }}
            key={pathname}
            className="flex w-full flex-col items-center"
          >
            <FrozenRouter>{props.children}</FrozenRouter>
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <MotionImage
        layout
        transition={{ duration: 0.6, ease: "easeInOut" }}
        src="/page/scroll bottom.png"
        alt="scroll bottom"
        width={840}
        height={361}
        className="pointer-events-none h-auto w-[95%] max-w-none opacity-80 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] select-none min-[840px]:w-[70%]"
        priority
      />
    </motion.div>
  );
}
