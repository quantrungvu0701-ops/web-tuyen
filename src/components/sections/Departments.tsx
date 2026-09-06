"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FlowSection, useSectionActive } from "@/components/scroll/FlowSection";
import { SmartImage } from "@/components/ui/SmartImage";
import { bottomRowMembers, departments } from "@/lib/site-config";
import { reveal } from "@/lib/motion";

export function Departments({ index }: { index: number }) {
  return (
    <FlowSection
      id="ba-ban"
      index={index}
      anchor={{ x: 8, y: 84, scale: 0.85 }}
      className="flex min-h-dvh flex-col items-center justify-center py-16 md:py-24"
    >
      <DepartmentsContent />
    </FlowSection>
  );
}

function DepartmentsContent() {
  const isActive = useSectionActive();
  const shouldReduceMotion = useReducedMotion();

  return (
    <ul className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-5 sm:grid-cols-3 sm:gap-6 sm:px-6 lg:px-8">
      {departments.map((department, i) => {
        // Each card carries the character it morphed from in the previous section.
        const member = bottomRowMembers.find((m) => m.id === department.memberId);

        return (
          <motion.li
            key={department.memberId}
            className="flex flex-col items-center gap-5"
            {...reveal(shouldReduceMotion, isActive, { opacity: 0, y: 48, scale: 0.94 })}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <SmartImage
              src={member?.imageSrc ?? ""}
              alt={member ? `${member.name} — ${department.name}` : department.name}
              placeholderLabel={`[TODO] ${member?.name ?? department.name}`}
              className="h-56 w-full rounded-2xl shadow-[0_12px_32px_rgba(36,31,28,0.12)] sm:h-72"
            />
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {department.name}
            </h2>
          </motion.li>
        );
      })}
    </ul>
  );
}
