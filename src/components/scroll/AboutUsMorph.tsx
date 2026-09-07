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
import { about } from "@/lib/site-config";

type SlotId = "about" | "events";

type Slot = {
  element: HTMLElement;
  /** Degrees the floating label should rotate to when parked at this slot. */
  rotate: number;
};

type Registry = {
  setSlot: (id: SlotId, slot: Slot | null) => void;
};

const AboutUsMorphContext = createContext<Registry | null>(null);

/**
 * Registers the invisible placeholder that reserves layout space for the
 * "About us" label in one section — see FloatingAboutUsLabel for the visible
 * element that actually morphs between whichever slots are registered.
 */
export function useAboutUsSlot(id: SlotId, element: HTMLElement | null, rotate: number) {
  const ctx = useContext(AboutUsMorphContext);

  useEffect(() => {
    if (!ctx || !element) return;
    ctx.setSlot(id, { element, rotate });
    return () => ctx.setSlot(id, null);
  }, [ctx, id, element, rotate]);
}

export function AboutUsMorphProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<Partial<Record<SlotId, Slot>>>({});

  const setSlot = useCallback((id: SlotId, slot: Slot | null) => {
    setSlots((prev) => {
      if (!slot) {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: slot };
    });
  }, []);

  // Stable across re-renders (setSlot itself never changes identity): without
  // this, every slots update would hand consumers a new context value, whose
  // changed identity would re-fire their registration effects, which call
  // setSlot again — an infinite register/unregister loop.
  const registry = useMemo(() => ({ setSlot }), [setSlot]);

  return (
    <AboutUsMorphContext.Provider value={registry}>
      {children}
      <FloatingAboutUsLabel slots={slots} />
    </AboutUsMorphContext.Provider>
  );
}

type Target = { x: number; y: number; rotate: number; fontSize: number };

/**
 * The single "About us" label that actually renders. It tracks whichever
 * registered slot belongs to the active section, tweening position, rotation
 * and font size between them — the vertical rail in About continuously
 * rotates and slides into the horizontal kicker above Events, rather than
 * one fading out while a second, independent copy fades in elsewhere.
 *
 * Under reduced motion this stays hidden: each section renders its own
 * static, always-visible label instead (see About.tsx / Events.tsx), so
 * nothing here needs to move for that to remain correct.
 */
function FloatingAboutUsLabel({ slots }: { slots: Partial<Record<SlotId, Slot>> }) {
  const { activeSectionId, isTransitioning } = useSectionFlow();
  const shouldReduceMotion = useReducedMotion();
  const [target, setTarget] = useState<Target | null>(null);

  const activeSlotId: SlotId | null =
    activeSectionId === "about" || activeSectionId === "events" ? activeSectionId : null;
  const activeSlot = activeSlotId ? slots[activeSlotId] : undefined;

  useEffect(() => {
    if (shouldReduceMotion || !activeSlot) return;
    const { element, rotate } = activeSlot;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const fontSize = parseFloat(getComputedStyle(element).fontSize);
      setTarget({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, rotate, fontSize });
    };

    // getBoundingClientRect is viewport-relative, so the target must be
    // recomputed as the page scrolls — not just when the slot's own size
    // changes. Without this, activating a slot mid-transition (activeIndex
    // updates the instant the 800ms pinned scroll starts, well before it
    // finishes) freezes the target at whatever position the element happened
    // to be at that first instant, rather than where it actually lands.
    // Coalesced to one measurement per frame — scroll fires far more often
    // than that, and re-rendering on every tick was what made the label
    // visibly lag behind the actual scroll.
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
      className="pointer-events-none fixed top-0 left-0 z-20 will-change-transform"
      animate={{ x: target.x, y: target.y, opacity: activeSlotId ? 1 : 0 }}
      // A short tween only while actively pinned (isTransitioning): wheel
      // input arrives in discrete, fairly coarse ticks, and with no
      // interpolation at all each tick just snaps the label to its new spot
      // — technically correct, but reads as "not morphing," not as motion.
      // 120ms is enough to turn that into a visible glide without being
      // long enough to feel laggy. Once settled, position updates come from
      // ordinary scrolling and must stay instant (duration: 0) — a spring
      // or tween there measurably trails behind the reader's own scroll.
      transition={
        isTransitioning ? { duration: 0.12, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }
      }
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <motion.span
          className="block font-display leading-none font-semibold tracking-tight whitespace-nowrap text-accent"
          animate={{ rotate: target.rotate, fontSize: target.fontSize }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {about.label}
        </motion.span>
      </div>
    </motion.div>
  );
}
