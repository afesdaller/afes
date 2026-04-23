"use client";
import Image from "next/image";
import NavButton from "./NavButton";
import { links } from "@/configs/links";
import GemImage from "./GemImage";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import emitter from "@/lib/emitter";
import { CONSTANTS } from "@/configs/constants";
import { useTranslations } from "next-intl";

export default function Menu() {
  const t = useTranslations("NavMenu");
  const [mobileMenuActive, setMobileMenuActive] = useState<boolean>(false);
  const mobileMenuActiveRef = useRef(false);

  const toggleMobileMenu = (openMenu: boolean) => {
    mobileMenuActiveRef.current = openMenu;
    emitter.emit("mobile:menu:open", { isOpen: openMenu });
    setMobileMenuActive(openMenu);
  };

  useEffect(() => {
    const resize = () => {
      if (
        window.innerWidth > CONSTANTS.MOBILE_BREAKPOINT &&
        mobileMenuActiveRef.current
      ) {
        toggleMobileMenu(false);
      }
    };
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (mobileMenuActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuActive]);

  return (
    <div className="relative z-30">
      <AnimatePresence>
        {mobileMenuActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background/20 fixed inset-0 z-49 backdrop-blur-lg"
          >
            <nav className="relative m-auto mt-[220px] flex h-fit w-[300px] flex-col items-center">
              <Image
                src="/menu/mobile-menu-bottom-angle.png"
                alt="mobile menu bottom"
                height={100}
                width={100}
                className="absolute bottom-[-80px] left-[-40px] h-[100px] w-[100px]"
                unoptimized
                priority
              />
              <Image
                src="/menu/mobile-menu-bottom-angle.png"
                alt="mobile menu bottom"
                height={100}
                width={100}
                className="absolute right-[-40px] bottom-[-80px] h-[100px] w-[100px] scale-x-[-1]"
                unoptimized
                priority
              />
              <Image
                src="/menu/mobile-menu-top-angle.png"
                alt="mobile menu top"
                height={100}
                width={100}
                className="absolute top-[-100px] left-[-40px] h-[100px] w-[100px]"
                unoptimized
                priority
              />
              <Image
                src="/menu/mobile-menu-top-angle.png"
                alt="mobile menu top"
                height={100}
                width={100}
                className="absolute top-[-100px] right-[-40px] h-[100px] w-[100px] scale-x-[-1]"
                unoptimized
                priority
              />
              {Object.values(links).map((link) => (
                <div
                  key={link.href}
                  className="m-[10px] flex w-[260px] items-center justify-between"
                >
                  <GemImage
                    src={link.gemSrc}
                    alt={link.alt}
                    leftHref={null}
                    rightHref={link.href}
                    glowColor={link.glowColor}
                  />
                  <NavButton
                    href={link.href}
                    title={t(link.label)}
                    isMobile={true}
                    onClick={() => toggleMobileMenu(false)}
                  />

                  <GemImage
                    src={link.gemSrc}
                    alt={link.alt}
                    leftHref={link.href}
                    rightHref={null}
                    glowColor={link.glowColor}
                  />
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => toggleMobileMenu(!mobileMenuActive)}
        className="fixed top-0 right-0 z-50 m-[20px] h-[100px] w-[71px] min-[840]:hidden"
      >
        <div className="bg-background/30 absolute top-[14px] left-1/2 z-0 h-[45px] w-[45px] -translate-x-1/2 rounded-full backdrop-blur-[2px]" />
        <Image
          className="z-1 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
          src="/menu/burger-button-frame.png"
          alt="burger button frame"
          fill
          unoptimized
          loading="eager"
        />
        {(mobileMenuActive && (
          <Image
            className="absolute inset-x-[10px] top-[19px] z-1 m-auto h-[35px] w-[35px] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            src="/menu/cross.png"
            alt="burger button frame"
            width={35}
            height={35}
            unoptimized
            loading="eager"
          />
        )) || (
          <Image
            className="absolute inset-x-[10px] top-[24px] z-1 m-auto h-[26px] w-[35px] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            src="/menu/burger-button.png"
            alt="burger button frame"
            width={35}
            height={26}
            unoptimized
            loading="eager"
          />
        )}
      </button>
      <div className="fixed top-0 right-0 m-[20px] hidden h-[100px] w-[800px] min-[840]:block">
        <div className="bg-background/50 absolute inset-x-[38px] top-[11px] bottom-[34px] rounded-full backdrop-blur-[3px]" />
        <Image
          src="/menu/menu frame.png"
          alt="left side"
          width={1600}
          height={400}
          priority
          className="pointer-events-none absolute z-1 h-[100px] w-[400px] drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] select-none"
          unoptimized
        />
        <Image
          src="/menu/menu frame.png"
          alt="left side"
          width={1600}
          height={400}
          priority
          className="pointer-events-none absolute top-0 right-0 z-1 h-[100px] w-[400px] -scale-x-100 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] select-none"
          unoptimized
        />
        <nav className="m-auto flex h-[78px] w-[600px] items-center justify-between">
          <GemImage
            src="/menu/amethist.png"
            alt="amethist"
            leftHref={null}
            rightHref={links.home.href}
            glowColor="147,112,219"
          />
          <NavButton href={links.home.href} title={t(links.home.label)} />

          <GemImage
            src="/menu/ruby.png"
            alt="ruby"
            leftHref={links.home.href}
            rightHref={links.skills.href}
            glowColor="220,20,60"
          />
          <NavButton href={links.skills.href} title={t(links.skills.label)} />

          <GemImage
            src="/menu/sapphire.png"
            alt="sapphire"
            leftHref={links.skills.href}
            rightHref={links.experience.href}
            glowColor="30,100,220"
          />
          <NavButton
            href={links.experience.href}
            title={t(links.experience.label)}
          />

          <GemImage
            src="/menu/emerald.png"
            alt="emerald"
            leftHref={links.experience.href}
            rightHref={links.projects.href}
            glowColor="0,180,80"
          />
          <NavButton
            href={links.projects.href}
            title={t(links.projects.label)}
          />

          <GemImage
            src="/menu/ruby.png"
            alt="ruby"
            leftHref={links.projects.href}
            rightHref={links.contacts.href}
            glowColor="220,20,60"
          />
          <NavButton
            href={links.contacts.href}
            title={t(links.contacts.label)}
          />

          <GemImage
            src="/menu/amethist.png"
            alt="amethist"
            leftHref={links.contacts.href}
            rightHref={null}
            glowColor="147,112,219"
          />
        </nav>
      </div>
    </div>
  );
}
