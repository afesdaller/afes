"use client";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import Scroll from "./Scroll";
import { motion } from "motion/react";

export default function Home() {
  const locale = useLocale();
  const t = useTranslations("Home");
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(5px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(5px)" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      {locale === "en" ? (
        <Image
          src="/page/name-en.png"
          alt="name"
          width={700}
          height={104}
          className="h-auto w-[90%] max-w-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] min-[840px]:w-[80%]"
          priority
          unoptimized
        />
      ) : (
        <Image
          src="/page/name-ua.png"
          alt="name"
          width={700}
          height={127}
          priority
          className="h-auto w-[90%] max-w-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] min-[840px]:w-[80%]"
          unoptimized
        />
      )}
      <div className="relative flex justify-center">
        <Image
          src="/page/photo frame.png"
          alt="photo frame"
          width={500}
          height={500}
          className="relative z-1 h-auto w-[85%] max-w-[300px] rounded-full drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] min-[840px]:w-[350px]"
          priority
        />
        <Image
          src="/page/photo.png"
          alt="photo frame"
          width={230}
          height={230}
          className="absolute top-[16%] left-1/2 z-0 h-auto w-[60%] max-w-[200px] -translate-x-1/2 rounded-full drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] backdrop-blur-[5px] min-[840px]:top-[62px] min-[840px]:w-[230px]"
          priority
        />
      </div>

      <h3 className="text-shadow text-center font-bold">{t("subtitle")}</h3>
      <div className="relative flex flex-col items-center">
        <Image
          src="/page/line.png"
          alt="line"
          width={600}
          height={63}
          loading="eager"
          className="h-auto min-[840px]:w-[400px]"
        />
        <p className="text-shadow text-center">{t("about_me")}</p>
        <Image
          src="/page/line.png"
          alt="line"
          width={600}
          height={63}
          loading="eager"
          className="h-auto min-[840px]:w-[400px]"
        />
        <p className="text-shadow text-center">{t("what_i_do")}</p>
        <Image
          src="/page/line.png"
          alt="line"
          width={600}
          height={63}
          loading="eager"
          className="h-auto min-[840px]:w-[400px]"
        />
        <h3 className="text-shadow text-center">{t("call_to_action")}</h3>
      </div>
    </motion.div>
  );
}
