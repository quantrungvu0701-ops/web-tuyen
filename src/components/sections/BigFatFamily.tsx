"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FlowSection, useSectionActive } from "@/components/scroll/FlowSection";
import { SmartImage } from "@/components/ui/SmartImage";
import { bottomRowMembers, topRowMembers, type Member } from "@/lib/site-config";

export function BigFatFamily({ index }: { index: number }) {
  return (
    <FlowSection
      id="bo-7"
      index={index}
      anchor={{ x: 92, y: 88, scale: 0.7 }}
      className="flex min-h-dvh flex-col items-center justify-center gap-10 py-16 md:gap-14 md:py-24"
    >
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
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? undefined : { opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
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
            <MemberFigure key={member.id} member={member} direction="down" delay={0.24 + i * 0.06} />
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
}: {
  member: Member;
  direction: "up" | "down";
  delay: number;
}) {
  const isActive = useSectionActive();
  const shouldReduceMotion = useReducedMotion();
  const [isRaised, setIsRaised] = useState(false);
  const shift = direction === "up" ? -20 : 20;

  return (
    <li
      className="flex w-full max-w-[15rem] flex-col items-center"
      onMouseEnter={() => setIsRaised(true)}
      onMouseLeave={() => setIsRaised(false)}
    >
      <motion.button
        type="button"
        aria-expanded={isRaised}
        onClick={() => setIsRaised((current) => !current)}
        onFocus={() => setIsRaised(true)}
        onBlur={() => setIsRaised(false)}
        className="flex w-full cursor-pointer flex-col items-center"
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
        animate={
          shouldReduceMotion
            ? undefined
            : { opacity: isActive ? 1 : 0, y: isActive ? (isRaised ? shift : 0) : 24 }
        }
        transition={{ duration: 0.45, delay: isActive && !isRaised ? delay : 0, ease: [0.16, 1, 0.3, 1] }}
      >
        <SmartImage
          src={member.imageSrc}
          alt={`${member.name} — ${member.role}`}
          placeholderLabel={`[TODO] ${member.name}`}
          className="h-44 w-full rounded-2xl sm:h-52"
        />

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
      </motion.button>
    </li>
  );
}
