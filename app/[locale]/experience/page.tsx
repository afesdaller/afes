"use client";
import { experiences } from "@/configs/experience";
import Experience from "./Experience";
import Image from "next/image";
import { motion } from "motion/react";

export default function Page() {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(5px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(5px)" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex flex-col gap-[30px]"
    >
      {experiences.map((ex, index) => (
        <div key={ex.company} className="flex flex-col items-center gap-[30px]">
          <Experience
            company={ex.company}
            period={ex.period}
            responsibilities={ex.responsibilities}
            jobTitle={ex.job_title}
            crs={ex.crs}
          />
          {index !== experiences.length - 1 && (
            <Image
              src="/page/line.png"
              alt="line"
              width={600}
              height={63}
              loading="eager"
              className="h-auto min-[840px]:w-[400px]"
            />
          )}
        </div>
      ))}
    </motion.div>
  );
}
