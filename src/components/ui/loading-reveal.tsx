"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface LoadingRevealProps {
  /** How long the loading screen holds before sliding away, in ms */
  holdMs?: number;
  /** Background colour of the loading screen */
  backgroundColor?: string;
}

export default function LoadingReveal({
  holdMs = 1000,
  backgroundColor = "#FFD1DC",
}: LoadingRevealProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), holdMs);
    return () => clearTimeout(timer);
  }, [holdMs]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor }}
      initial={{ y: 0 }}
      animate={{ y: revealed ? "-100%" : 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      aria-hidden={revealed}
    >
      <Image
        src="/loading-bi.png"
        alt="Đang tải"
        width={1254}
        height={1254}
        loading="eager"
        fetchPriority="high"
        className="w-40 md:w-64"
      />
    </motion.div>
  );
}
