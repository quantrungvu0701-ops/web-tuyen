"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useRegisterSection, type MascotAnchor } from "./SectionFlow";

const SectionActiveContext = createContext(false);

/** True while this section is the one the flow has scrolled to. */
export function useSectionActive() {
  return useContext(SectionActiveContext);
}

type FlowSectionProps = {
  id: string;
  index: number;
  anchor: MascotAnchor;
  className?: string;
  children: ReactNode;
  /** See `Registration.triggerAt` in SectionFlow. */
  triggerAt?: number;
};

export function FlowSection({ id, index, anchor, className = "", children, triggerAt }: FlowSectionProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const isActive = useRegisterSection(id, index, anchor, element, triggerAt);

  return (
    <section
      id={id}
      ref={setElement}
      data-active={isActive || undefined}
      className={`relative ${className}`}
    >
      <SectionActiveContext.Provider value={isActive}>{children}</SectionActiveContext.Provider>
    </section>
  );
}
