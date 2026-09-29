"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * The curtain: Bi on the sunrise sky, with the key visual's three lamps
 * blinking red → yellow → green as the loader, then the whole sky lifts away.
 * The hero times its own entrance to start as this lifts (see --enter-offset
 * in Hero), so the scene assembles in view rather than behind the curtain.
 */
export default function LoadingReveal({ holdMs = 1000 }: { holdMs?: number }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), holdMs);
    return () => clearTimeout(timer);
  }, [holdMs]);

  return (
    <motion.div
      // Above the nav's own z-100/101 (morphing-scroll-navbar.tsx), which is
      // also position: fixed — below it, the logo and CTA showed through.
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8"
      style={{ background: "linear-gradient(180deg, #FDE3D6 0%, #FAF4BF 55%, #FFD9E0 100%)" }}
      initial={{ y: 0 }}
      animate={{ y: revealed ? "-100%" : 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      aria-hidden={revealed}
      role="status"
      aria-label="Đang tải"
    >
      <div className="relative w-44 md:w-56">
        <img src="/kv/bi.webp" alt="" className="anim-bob w-full" style={{ ["--dur" as string]: "1.4s" }} />
        <img src="/kv/bi-anger.webp" alt="" className="anim-pulse absolute left-[23%] top-[-7%] w-[27%]" style={{ ["--dur" as string]: "1.2s" }} />
      </div>
      <div className="flex gap-3" aria-hidden="true">
        {["#FF4F86", "#FFD84D", "#7ED957"].map((c, i) => (
          <span
            key={c}
            className="size-4 rounded-full"
            style={{
              background: c,
              boxShadow: `0 0 14px ${c}`,
              animation: `blink 1.2s ${i * 0.4}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
