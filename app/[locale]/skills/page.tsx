"use client";
import { motion } from "motion/react";
import Scroll from "../Scroll";

export default function Page() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* <Scroll></Scroll> */}
    </motion.div>
  );
}
