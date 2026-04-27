"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Page() {
  const t = useTranslations("Projects");
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(5px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(5px)" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      <p className="text-shadow m-[40px] text-center whitespace-pre-line">
        {t("project")}
      </p>
      <a
        href="https://github.com/afesdaller"
        target="_blank"
        className="cursor-pointer"
      >
        <Image
          src="/skills/github.png"
          alt="github"
          width={100}
          height={100}
          className="md drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.9)]"
        />
      </a>
    </motion.div>
  );
}
