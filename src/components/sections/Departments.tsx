"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FlowSection, useSectionActive } from "@/components/scroll/FlowSection";
import { useMemberMorphSlot } from "@/components/scroll/MemberMorph";
import { SmartImage } from "@/components/ui/SmartImage";
import { bottomRowMembers, departments, type Department } from "@/lib/site-config";
import { reveal } from "@/lib/motion";

export function Departments({ index }: { index: number }) {
  return (
    <FlowSection
      id="ba-ban"
      index={index}
      anchor={{ x: 8, y: 84, scale: 0.85 }}
      className="flex min-h-dvh flex-col items-center justify-center py-16 md:py-24"
    >
      <ul className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-5 sm:grid-cols-3 sm:gap-6 sm:px-6 lg:px-8">
        {departments.map((department, i) => (
          <DepartmentCard key={department.memberId} department={department} delay={i * 0.1} />
        ))}
      </ul>
    </FlowSection>
  );
}

function DepartmentCard({ department, delay }: { department: Department; delay: number }) {
  const isActive = useSectionActive();
  const shouldReduceMotion = useReducedMotion();
  const member = bottomRowMembers.find((m) => m.id === department.memberId);

  const [imageEl, setImageEl] = useState<HTMLDivElement | null>(null);
  useMemberMorphSlot(department.memberId, "baban", imageEl);

  return (
    <li className="flex flex-col items-center gap-5">
      {/* The photo is an invisible anchor — see MemberMorph for the floating
          clone that flies in from Bộ 7 and is what's actually shown here. */}
      <motion.div
        ref={setImageEl}
        className="h-56 w-full overflow-hidden rounded-2xl shadow-[0_12px_32px_rgba(36,31,28,0.12)] sm:h-72"
        animate={{ opacity: shouldReduceMotion ? 1 : 0 }}
        transition={{ duration: 0 }}
      >
        <SmartImage
          src={member?.imageSrc ?? ""}
          alt={member ? `${member.name} — ${department.name}` : department.name}
          placeholderLabel={`[TODO] ${member?.name ?? department.name}`}
          className="h-full w-full"
        />
      </motion.div>

      <motion.h2
        className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
        {...reveal(shouldReduceMotion, isActive, { opacity: 0, y: 16 })}
        transition={{ duration: 0.5, delay: 0.35 + delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {department.name}
      </motion.h2>
    </li>
  );
}
