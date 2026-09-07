"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FlowSection, useSectionActive } from "@/components/scroll/FlowSection";
import { useMemberMorphSlot } from "@/components/scroll/MemberMorph";
import { AmbientGlow } from "@/components/ui/AmbientGlow";
import { SmartImage } from "@/components/ui/SmartImage";
import { bottomRowMembers, topRowMembers, type Member } from "@/lib/site-config";
import { reveal } from "@/lib/motion";

export function BigFatFamily({ index }: { index: number }) {
  return (
    <FlowSection
      id="bo-7"
      index={index}
      anchor={{ x: 92, y: 88, scale: 0.7 }}
      className="flex min-h-dvh flex-col items-center justify-center gap-10 overflow-hidden py-16 md:gap-14 md:py-24"
    >
      <AmbientGlow variant="bottom-left" />
      <FamilyContent />
    </FlowSection>
  );
}

function FamilyContent() {
  const isActive = useSectionActive();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <motion.h2
        className="flex flex-col items-center gap-1 text-center"
        {...reveal(shouldReduceMotion, isActive, { opacity: 0, y: 20 })}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="font-display text-xl font-medium tracking-tight sm:text-2xl">
          We are the
        </span>
        <span className="font-display text-4xl leading-none font-bold tracking-tight text-accent sm:text-6xl md:text-7xl">
          Big Fat Family
        </span>
      </motion.h2>

      <div className="flex w-full max-w-6xl flex-col items-center gap-6 px-5 sm:px-6 md:gap-10 lg:px-8">
        <ul className="grid w-full grid-cols-2 justify-items-center gap-4 sm:gap-6 md:grid-cols-4">
          {topRowMembers.map((member, i) => (
            <MemberFigure key={member.id} member={member} direction="up" delay={i * 0.06} />
          ))}
        </ul>

        <ul className="grid w-full grid-cols-2 justify-items-center gap-4 sm:gap-6 md:grid-cols-3">
          {bottomRowMembers.map((member, i) => (
            <MemberFigure key={member.id} member={member} direction="down" delay={0.24 + i * 0.06} morphs />
          ))}
        </ul>
      </div>
    </>
  );
}

function MemberFigure({
  member,
  direction,
  delay,
  morphs = false,
}: {
  member: Member;
  direction: "up" | "down";
  delay: number;
  /** Bottom-row (E/F/G) members morph into a department card in Ba ban. */
  morphs?: boolean;
}) {
  const isActive = useSectionActive();
  const shouldReduceMotion = useReducedMotion();
  const [isRaised, setIsRaised] = useState(false);
  const shift = direction === "up" ? -20 : 20;

  const [imageEl, setImageEl] = useState<HTMLDivElement | null>(null);
  useMemberMorphSlot(member.id, "bo7", morphs ? imageEl : null);

  // Morphing cards keep the photo at rest (no hover raise, no entrance
  // slide): it's the floating cross-section clone that's actually visible
  // once mounted, and that clone measures this element's position — letting
  // it move independently would desync the two. Non-morphing cards (A–D)
  // keep the original raise-on-hover/slide-in-on-entrance behavior.
  const hiddenForMorph = morphs && !shouldReduceMotion;
  const raiseY = morphs ? 0 : isRaised ? shift : 0;

  const initial = shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: morphs ? 0 : 24 };
  const animate = hiddenForMorph
    ? { opacity: 0, y: 0 }
    : shouldReduceMotion
      ? { opacity: 1, y: raiseY }
      : { opacity: isActive ? 1 : 0, y: isActive ? raiseY : morphs ? 0 : 24 };
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.45, delay: isActive && !isRaised ? delay : 0, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <li
      className="flex w-full max-w-[15rem] flex-col items-center"
      onMouseEnter={() => setIsRaised(true)}
      onMouseLeave={() => setIsRaised(false)}
    >
      <button
        type="button"
        aria-expanded={isRaised}
        onClick={() => setIsRaised((current) => !current)}
        onFocus={() => setIsRaised(true)}
        onBlur={() => setIsRaised(false)}
        className="flex w-full cursor-pointer flex-col items-center"
      >
        <motion.div
          ref={setImageEl}
          className="h-44 w-full overflow-hidden rounded-2xl sm:h-52"
          initial={initial}
          animate={animate}
          transition={transition}
        >
          <SmartImage
            src={member.imageSrc}
            alt={`${member.name} — ${member.role}`}
            placeholderLabel={`[TODO] ${member.name}`}
            className="h-full w-full"
          />
        </motion.div>

        {/* Space is reserved so revealing the name never shifts the row. */}
        <motion.span
          className="flex h-14 flex-col items-center justify-center gap-0.5 pt-2"
          initial={false}
          animate={{ opacity: isRaised ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <span className="font-display text-lg font-semibold">{member.name}</span>
          <span className="text-xs text-muted-foreground sm:text-sm">{member.role}</span>
        </motion.span>
      </button>
    </li>
  );
}
