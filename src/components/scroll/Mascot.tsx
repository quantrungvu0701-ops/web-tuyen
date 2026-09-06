"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSectionFlow } from "./SectionFlow";

function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

/**
 * The mascot that travels between sections. It is fixed to the viewport and
 * tweens to whichever anchor the active section (or a section override, like
 * the Tuyển timeline) declares.
 */
export function Mascot() {
  const { mascotAnchor } = useSectionFlow();
  const { width, height } = useViewportSize();
  const shouldReduceMotion = useReducedMotion();

  // Nothing to position against until the viewport has been measured.
  if (!width || !height) return null;

  const isCompact = width < 768;
  const scale = (mascotAnchor.scale ?? 1) * (isCompact ? 0.6 : 1);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-30 will-change-transform"
      initial={false}
      animate={{
        x: (mascotAnchor.x / 100) * width,
        y: (mascotAnchor.y / 100) * height,
        opacity: mascotAnchor.hidden ? 0 : 1,
      }}
      transition={
        shouldReduceMotion || mascotAnchor.instant
          ? { duration: 0 }
          : { type: "spring", stiffness: 90, damping: 18, mass: 0.9 }
      }
    >
      <motion.div
        className="-translate-x-1/2 -translate-y-1/2"
        initial={false}
        animate={{
          scale,
          rotate: mascotAnchor.rotate ?? 0,
          scaleX: mascotAnchor.flip ? -1 : 1,
        }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <MascotPlaceholder />
      </motion.div>
    </motion.div>
  );
}

/**
 * TODO: replace with the real mascot artwork — drop the cut-outs in as
 * public/images/mascot/*.png and swap this component's body for an <Image>.
 * Keeping it as one element means the choreography above needs no changes.
 */
function MascotPlaceholder() {
  return (
    <svg width="96" height="112" viewBox="0 0 96 112" fill="none" role="presentation">
      <ellipse cx="48" cy="104" rx="26" ry="6" className="fill-foreground/10" />
      <path
        d="M48 10c14 0 22 7 22 20 0 6-2 10-2 14 6 5 10 13 10 23 0 16-13 27-30 27S18 83 18 67c0-10 4-18 10-23 0-4-2-8-2-14 0-13 8-20 22-20Z"
        className="fill-accent"
      />
      <path d="M48 4c4 5 6 9 6 12h-12c0-3 2-7 6-12Z" className="fill-accent-hover" />
      <circle cx="38" cy="60" r="5" className="fill-background" />
      <circle cx="60" cy="60" r="5" className="fill-background" />
      <circle cx="39" cy="61" r="2.5" className="fill-foreground" />
      <circle cx="61" cy="61" r="2.5" className="fill-foreground" />
      <path d="M44 72h10l-5 6-5-6Z" className="fill-accent-hover" />
    </svg>
  );
}
