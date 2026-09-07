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

type Measurement = { x: number; y: number; width: number; height: number; borderRadius: number };

function measureSlot(slot: Slot): Measurement {
  const rect = slot.element.getBoundingClientRect();
  const borderRadius = parseFloat(getComputedStyle(slot.element).borderRadius) || 0;
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height, borderRadius };
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

/**
 * The single photo for one bottom-row member (E, F or G) that actually
 * renders. It tracks whichever registered slot belongs to the active
 * section, and while a pinned scrub is actively crossing between Bộ 7 and
 * Ba ban, interpolates continuously between both slots' measured position/
 * size/radius using the scrub's own progress (not a timer) — the portrait
 * visibly grows and slides into its department card in step with the
 * reader's own wheel/touch input, rather than snapping the instant
 * activeSectionId flips at the scrub's halfway mark. Three of these exist
 * at once, one per bottom-row member.
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
  const { activeSectionId, scrub } = useSectionFlow();
  const shouldReduceMotion = useReducedMotion();
  const [measurements, setMeasurements] = useState<Partial<Record<SlotKey, Measurement>>>({});

  const bo7Slot = slots.bo7;
  const babanSlot = slots.baban;

  useEffect(() => {
    if (shouldReduceMotion) return;

    const measure = () => {
      setMeasurements({
        bo7: bo7Slot ? measureSlot(bo7Slot) : undefined,
        baban: babanSlot ? measureSlot(babanSlot) : undefined,
      });
    };

    // Coalesced to one measurement per frame — see AboutUsMorph for why this
    // is both necessary (position must track scroll, which is viewport-
    // relative) and throttled (one setState per raw scroll/resize event
    // would spam re-renders and, worse, make the photo visibly lag).
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
    if (bo7Slot) observer.observe(bo7Slot.element);
    if (babanSlot) observer.observe(babanSlot.element);
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [babanSlot, bo7Slot, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  const isCrossSectionScrub =
    scrub && ((scrub.fromId === "bo-7" && scrub.toId === "ba-ban") ||
      (scrub.fromId === "ba-ban" && scrub.toId === "bo-7"));

  let target: Measurement | null = null;
  let visible = false;

  if (isCrossSectionScrub && measurements.bo7 && measurements.baban) {
    const t = scrub!.fromId === "bo-7" ? scrub!.progress : 1 - scrub!.progress;
    const from = measurements.bo7;
    const to = measurements.baban;
    target = {
      x: lerp(from.x, to.x, t),
      y: lerp(from.y, to.y, t),
      width: lerp(from.width, to.width, t),
      height: lerp(from.height, to.height, t),
      borderRadius: lerp(from.borderRadius, to.borderRadius, t),
    };
    visible = true;
  } else {
    const activeKey: SlotKey | null =
      activeSectionId === "bo-7" ? "bo7" : activeSectionId === "ba-ban" ? "baban" : null;
    target = activeKey ? (measurements[activeKey] ?? null) : null;
    visible = Boolean(activeKey && target);
  }

  if (!target) return null;

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
        opacity: visible ? 1 : 0,
      }}
      // Always instant: every property is driven by a live measurement (or,
      // mid-scrub, a direct interpolation of the scrub's own progress) — see
      // AboutUsMorph for why a separate animation timeline on top of that
      // just reintroduces a lag behind the source signal.
      transition={{ duration: 0 }}
    >
      <SmartImage src={imageSrc} alt={alt} placeholderLabel={`[TODO] ${alt}`} className="h-full w-full" />
    </motion.div>
  );
}
