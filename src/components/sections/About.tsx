"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FlowSection, useSectionActive } from "@/components/scroll/FlowSection";
import { SmartImage } from "@/components/ui/SmartImage";
import { about } from "@/lib/site-config";

/**
 * Sizes the rotated "About us" label so its rendered height matches the
 * paragraph column beside it, at any viewport width.
 */
function useHeightMatchedType(targetRef: React.RefObject<HTMLElement | null>) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(48);

  useEffect(() => {
    const target = targetRef.current;
    const label = labelRef.current;
    if (!target || !label) return;

    const fit = () => {
      const available = target.getBoundingClientRect().height;
      if (!available) return;
      // Vertical writing mode means the label's height is its text length.
      const measured = label.getBoundingClientRect().height;
      if (!measured) return;
      setFontSize((current) => {
        const next = current * (available / measured);
        return Math.max(24, Math.min(next, 160));
      });
    };

    const observer = new ResizeObserver(fit);
    observer.observe(target);
    observer.observe(label);
    return () => observer.disconnect();
  }, [targetRef]);

  return { labelRef, fontSize };
}

export function About({ index }: { index: number }) {
  return (
    <FlowSection
      id="about"
      index={index}
      anchor={{ x: 88, y: 78, scale: 1 }}
      className="flex min-h-dvh items-center py-16 md:py-24"
    >
      <AboutContent />
    </FlowSection>
  );
}

function AboutContent() {
  const isActive = useSectionActive();
  const shouldReduceMotion = useReducedMotion();
  const paragraphRef = useRef<HTMLDivElement>(null);
  const { labelRef, fontSize } = useHeightMatchedType(paragraphRef);

  const reveal = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-[auto_1fr] items-stretch gap-5 px-5 sm:gap-8 sm:px-6 lg:grid-cols-[auto_1fr_1fr] lg:px-8">
      {/* Vertical label — morphs to the horizontal header in the next section. */}
      <motion.div
        className="flex items-center"
        initial={shouldReduceMotion ? undefined : { opacity: 0, x: -16 }}
        animate={shouldReduceMotion ? undefined : { opacity: isActive ? 1 : 0, x: isActive ? 0 : -16 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          ref={labelRef}
          style={{ fontSize, writingMode: "vertical-rl", rotate: "180deg" }}
          className="font-display leading-none font-semibold tracking-tight text-accent"
        >
          {about.label}
        </span>
      </motion.div>

      <motion.div
        ref={paragraphRef}
        {...reveal}
        className="flex flex-col justify-center gap-5 py-2"
      >
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-foreground/85 sm:text-lg">
            {paragraph}
          </p>
        ))}
      </motion.div>

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="col-span-2 lg:col-span-1"
      >
        <SmartImage
          src={about.imageSrc}
          alt={about.imageAlt}
          placeholderLabel="[TODO] ảnh tập thể — public/about.jpg"
          className="h-56 w-full rounded-2xl shadow-[0_12px_32px_rgba(36,31,28,0.12)] sm:h-72 lg:h-full lg:min-h-[22rem]"
        />
      </motion.div>
    </div>
  );
}
