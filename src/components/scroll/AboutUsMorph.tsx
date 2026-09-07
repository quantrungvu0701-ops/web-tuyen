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

type Measurement = { x: number; y: number; top: number; rotate: number; fontSize: number };

function measureSlot(slot: Slot): Measurement {
  const rect = slot.element.getBoundingClientRect();
  const fontSize = parseFloat(getComputedStyle(slot.element).fontSize);
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    top: rect.top,
    rotate: slot.rotate,
    fontSize,
  };
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

// How much further (as a fraction of viewport height) the "About us" rail's
// top has to travel past the viewport's own top edge before the morph is
// fully complete. Kept well inside one viewport so the whole transformation
// plays out somewhere the reader can actually watch it, instead of starting
// once the rail is already almost gone and finishing even further above.
const MORPH_TRAVEL_FRACTION = 0.45;

/**
 * The single "About us" label that actually renders. It tracks whichever
 * registered slot belongs to the active section, and while a pinned scrub is
 * actively crossing between About and Events, interpolates continuously
 * between both slots' measured position/rotation/size using the scrub's own
 * progress (not a timer) — the vertical rail in About visibly, continuously
 * rotates and slides into the horizontal kicker above Events in step with
 * the reader's own wheel/touch input, rather than snapping the instant
 * activeSectionId flips at the scrub's halfway mark (which reads as an
 * abrupt cut/fade, not a morph).
 *
 * Under reduced motion this stays hidden: each section renders its own
 * static, always-visible label instead (see About.tsx / Events.tsx), so
 * nothing here needs to move for that to remain correct.
 */
function FloatingAboutUsLabel({ slots }: { slots: Partial<Record<SlotId, Slot>> }) {
  const { activeSectionId, scrub } = useSectionFlow();
  const shouldReduceMotion = useReducedMotion();
  const [measurements, setMeasurements] = useState<Partial<Record<SlotId, Measurement>>>({});

  const aboutSlot = slots.about;
  const eventsSlot = slots.events;

  // Both slots are measured continuously (not just whichever is "active"):
  // a scrub between them needs both endpoints available every frame to
  // interpolate, and getBoundingClientRect is viewport-relative so this has
  // to track scroll regardless of which slot ends up being shown.
  useEffect(() => {
    if (shouldReduceMotion) return;

    const measure = () => {
      setMeasurements({
        about: aboutSlot ? measureSlot(aboutSlot) : undefined,
        events: eventsSlot ? measureSlot(eventsSlot) : undefined,
      });
    };

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
    if (aboutSlot) observer.observe(aboutSlot.element);
    if (eventsSlot) observer.observe(eventsSlot.element);
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [aboutSlot, eventsSlot, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  // Scrubbing directly between About and Events (either direction): morph
  // continuously between both measured endpoints, driven by the scrub's own
  // progress rather than activeSectionId's discrete flip.
  const isAboutEventsScrub =
    scrub && ((scrub.fromId === "about" && scrub.toId === "events") ||
      (scrub.fromId === "events" && scrub.toId === "about"));

  let target: Measurement | null = null;
  let visible = false;

  if (isAboutEventsScrub && measurements.about && measurements.events) {
    // Driven by the rail's own live on-screen position rather than the
    // scrub's raw wheel-accumulated progress: scrub.progress reflects
    // arbitrary input distance, not where the rail actually is, so using it
    // directly could start the morph after the rail's top has already
    // scrolled past the viewport's top edge (invisible) and finish it even
    // further above. Anchoring to the measured top keeps the visible morph
    // window pinned to "top edge -> a bit further up", regardless of how
    // much wheel/touch input it took to get there.
    const span = window.innerHeight * MORPH_TRAVEL_FRACTION;
    const t = clamp01(-measurements.about.top / span);
    const from = measurements.about;
    const to = measurements.events;
    target = {
      x: lerp(from.x, to.x, t),
      y: lerp(from.y, to.y, t),
      top: lerp(from.top, to.top, t),
      rotate: lerp(from.rotate, to.rotate, t),
      fontSize: lerp(from.fontSize, to.fontSize, t),
    };
    visible = true;
  } else {
    const activeSlotId: SlotId | null =
      activeSectionId === "about" || activeSectionId === "events" ? activeSectionId : null;
    target = activeSlotId ? (measurements[activeSlotId] ?? null) : null;
    visible = Boolean(activeSlotId && target);
  }

  if (!target) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-20 will-change-transform"
      animate={{ x: target.x, y: target.y, opacity: visible ? 1 : 0 }}
      // Short eased tween rather than an instant snap: the source signal
      // (measured position) already updates every frame during a scrub, but
      // applying each update instantly still reads as a stepped teleport
      // between measurements rather than a continuous morph — a brief tween
      // blends consecutive updates into one smooth motion instead.
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <motion.span
          className="block font-display leading-none font-semibold tracking-tight whitespace-nowrap text-accent"
          animate={{ rotate: target.rotate, fontSize: target.fontSize }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {about.label}
        </motion.span>
      </div>
    </motion.div>
  );
}
