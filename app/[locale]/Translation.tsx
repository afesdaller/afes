"use client";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";

export default function Translation() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLanguage = (newLocale: "en" | "ua") => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="fixed top-[20px] right-1/2 z-40 translate-x-1/2 min-[840px]:top-[90px] min-[840px]:right-[90px] min-[840px]:translate-x-0">
      <Image
        src="/menu/translation.png"
        alt="translation"
        width={100}
        height={70}
        unoptimized
        priority
        className="pointer-events-none relative z-1 h-[70px] w-[100px] drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
      />
      <div className="bg-background/30 absolute inset-x-[5px] top-[12px] bottom-[35px] z-0 rounded-full backdrop-blur-[2px]" />
      <button
        onClick={() => switchLanguage("en")}
        style={{ WebkitTextStroke: "0.5px rgba(100, 60, 0, 0.8)" }}
        className={`absolute top-[11px] left-[20px] cursor-pointer text-[16px] font-bold transition-all duration-300 ${locale === "en" ? "text-[#ffb700]" : ""}`}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage("ua")}
        style={{ WebkitTextStroke: "0.5px rgba(100, 60, 0, 0.8)" }}
        className={`absolute top-[11px] right-[20px] cursor-pointer text-[16px] font-bold transition-all duration-300 ${locale === "ua" ? "text-[#ffb700]" : ""}`}
      >
        UA
      </button>
    </div>
  );
}
