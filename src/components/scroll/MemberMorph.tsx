"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSectionFlow } from "./SectionFlow";
import { SmartImage } from "@/components/ui/SmartImage";
import { bottomRowMembers } from "@/lib/site-config";

type SlotKey = "bo7" | "baban";
type MemberId = string;

type Slot = { element: HTMLElement };
type SlotMap = Partial<Record<SlotKey, Slot>>;

type Registry = {
  setSlot: (memberId: MemberId, key: SlotKey, slot: Slot | null) => void;
};

const MemberMorphContext = createContext<Registry | null>(null);

/**
 * Registers the invisible placeholder that reserves layout space for one
 * member's photo in one section — see FloatingMemberImage for the visible
 * element that actually morphs between whichever slots are registered.
 */
export function useMemberMorphSlot(memberId: MemberId, key: SlotKey, element: HTMLElement | null) {
  const ctx = useContext(MemberMorphContext);

  useEffect(() => {
    if (!ctx || !element) return;
    ctx.setSlot(memberId, key, { element });
    return () => ctx.setSlot(memberId, key, null);
  }, [ctx, memberId, key, element]);
}

export function MemberMorphProvider({ children }: { children: ReactNode }) {
  const [registry, setRegistry] = useState<Record<MemberId, SlotMap>>({});

  const setSlot = useCallback((memberId: MemberId, key: SlotKey, slot: Slot | null) => {
    setRegistry((prev) => {
      const existing = prev[memberId] ?? {};
      const nextSlots = { ...existing };
      if (slot) nextSlots[key] = slot;
      else delete nextSlots[key];
      return { ...prev, [memberId]: nextSlots };
    });
  }, []);

  // Stable across re-renders (setSlot itself never changes identity) — see
  // AboutUsMorph for why an unmemoized value here causes a register/
  // unregister loop.
  const value = useMemo(() => ({ setSlot }), [setSlot]);

  return (
    <MemberMorphContext.Provider value={value}>
      {children}
      {bottomRowMembers.map((member) => (
        <FloatingMemberImage
          key={member.id}
          imageSrc={member.imageSrc}
          alt={`${member.name} — ${member.role}`}
          slots={registry[member.id] ?? {}}
        />
      ))}
    </MemberMorphContext.Provider>
  );
}

type Target = { x: number; y: number; width: number; height: number; borderRadius: number };

/**
 * The single photo for one bottom-row member (E, F or G) that actually
 * renders. It tracks whichever registered slot belongs to the active
 * section, tweening position, size and corner radius between them — the
 * portrait in Bộ 7 genuinely grows and slides into its department card in
 * Ba ban, rather than one fading out while a second, independent copy fades
 * in elsewhere. Three of these exist at once, one per bottom-row member.
 *
 * Under reduced motion this stays hidden: each section renders its own
 * static, always-visible photo instead (see BigFatFamily.tsx / Departments.tsx).
 */
function FloatingMemberImage({
  imageSrc,
  alt,
  slots,
}: {
  imageSrc: string;
  alt: string;
  slots: SlotMap;
}) {
  const { activeSectionId, isTransitioning } = useSectionFlow();
  const shouldReduceMotion = useReducedMotion();
  const [target, setTarget] = useState<Target | null>(null);

  const activeKey: SlotKey | null =
    activeSectionId === "bo-7" ? "bo7" : activeSectionId === "ba-ban" ? "baban" : null;
  const activeSlot = activeKey ? slots[activeKey] : undefined;

  useEffect(() => {
    if (shouldReduceMotion || !activeSlot) return;
    const { element } = activeSlot;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const borderRadius = parseFloat(getComputedStyle(element).borderRadius) || 0;
      setTarget({ x: rect.left, y: rect.top, width: rect.width, height: rect.height, borderRadius });
    };

    // Coalesced to one measurement per frame — see AboutUsMorph for why this
    // is both necessary (position must track scroll, which is viewport-
    // relative) and throttled (one setState per raw scroll/resize event
    // would spam re-renders and, worse, make the label visibly lag).
    let frame = 0;
    const scheduleMeasure = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    measure();
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(element);
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [activeSlot, shouldReduceMotion]);

  if (shouldReduceMotion || !target) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-20 overflow-hidden will-change-transform"
      animate={{
        x: target.x,
        y: target.y,
        width: target.width,
        height: target.height,
        borderRadius: target.borderRadius,
        opacity: activeKey ? 1 : 0,
      }}
      // A spring only for the flight between sections (isTransitioning): once
      // settled, position/size updates come from the reader's own scroll,
      // which is already smooth — animating those too would make the photo
      // visibly lag behind real scroll input.
      transition={
        isTransitioning
          ? { type: "spring", stiffness: 120, damping: 20, mass: 0.8 }
          : { duration: 0 }
      }
    >
      <SmartImage src={imageSrc} alt={alt} placeholderLabel={`[TODO] ${alt}`} className="h-full w-full" />
    </motion.div>
  );
}
