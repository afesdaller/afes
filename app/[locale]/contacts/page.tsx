"use client";
import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("Contacts");
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(5px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(5px)" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="mt-[40px] flex flex-col items-center"
    >
      <h3 className="text-shadow text-center">{t("cta")}</h3>
      <div className="mt-[20px] flex items-center justify-center gap-[10px] min-[840px]:gap-[30px]">
        <a
          href="https://t.me/afesdaller"
          target="_blank"
          className="flex cursor-pointer flex-col items-center"
        >
          <Image
            src="/contacts/telegram.png"
            alt="telegram"
            width={100}
            height={100}
            className="h-[100px] w-[100px] max-w-none drop-shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all duration-300 hover:drop-shadow-[0_0_30px_rgba(212,175,55,0.9)]"
          />
          <p className="text-shadow">@afesdaller</p>
        </a>
        <a
          href="mailto:afesdaller@gmail.com"
          target="_blank"
          className="flex cursor-pointer flex-col items-center"
        >
          <Image
            src="/contacts/gmail.png"
            alt="gmail"
            width={100}
            height={100}
            className="h-[100px] w-[100px] max-w-none drop-shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.9)]"
          />
          <p className="text-shadow">afesdaller@gmail.com</p>
        </a>
        <a
          href="https://github.com/afesdaller"
          target="_blank"
          className="flex cursor-pointer flex-col items-center"
        >
          <Image
            src="/contacts/github.png"
            alt="github"
            width={100}
            height={100}
            className="h-[100px] w-[100px] max-w-none drop-shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all duration-200 hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.9)]"
          />
          <p className="text-shadow">afesdaller</p>
        </a>
      </div>
      <p className="text-shadow mt-[20px]">Kyiv, Ukraine 2026</p>
    </motion.div>
  );
}
