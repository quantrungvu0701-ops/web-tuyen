"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";

/** Where the mascot sits while a section is active, in viewport percentages. */
export type MascotAnchor = {
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  flip?: boolean;
  hidden?: boolean;
  /**
   * Skip the spring and snap directly to this position. For overrides that
   * re-fire continuously to stay glued to a moving target (e.g. the Tuyển
   * timeline re-measuring on scroll) — a spring chasing a target that
   * updates every frame just makes the mascot visibly lag behind. Leave
   * unset for a deliberate hop (hovering a different point), which should
   * still glide.
   */
  instant?: boolean;
};

type Registration = {
  id: string;
  index: number;
  element: HTMLElement;
  anchor: MascotAnchor;
};

type SectionFlowValue = {
  activeIndex: number;
  activeSectionId: string | null;
  isTransitioning: boolean;
  /** Anchor the mascot should currently occupy (override wins over section). */
  mascotAnchor: MascotAnchor;
  registerSection: (registration: Registration) => () => void;
  goToSection: (id: string) => void;
  /** Lets a section drive the mascot directly (e.g. the Tuyển timeline). */
  setMascotOverride: (anchor: MascotAnchor | null) => void;
};

const SectionFlowContext = createContext<SectionFlowValue | null>(null);

// Nav-triggered jumps (clicking "About" / "Tuyển") still autoplay — an
// explicit "take me there" click isn't a scroll gesture to scrub through.
const JUMP_MS = 800;
const COOLDOWN_MS = 450;

// How much accumulated wheel/touch/key input (in scroll-equivalent pixels)
// it takes to scrub one pinned transition fully from one section to the
// next. Independent of how many actual pixels of page scroll that covers.
const SCRUB_INPUT_DISTANCE = 600;
// Which side of the scrub the active section (and so the mascot / morphs)
// counts as belonging to — flips at the midpoint so scrubbing partway and
// reversing lands you back exactly where you started, in both directions.
const SCRUB_FLIP_AT = 0.5;
const KEY_STEP = 0.32;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

type ScrubState = {
  fromIndex: number;
  toIndex: number;
  direction: "down" | "up";
  startY: number;
  targetY: number;
  progress: number;
};

export function SectionFlowProvider({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [override, setOverride] = useState<MascotAnchor | null>(null);

  // Sections live in state (the mascot renders from them) and are mirrored
  // into a ref so the scroll handler always reads the current list.
  const [sections, setSections] = useState<Registration[]>([]);
  const sectionsRef = useRef<Registration[]>([]);
  const activeIndexRef = useRef(0);
  const transitioningRef = useRef(false);
  const cooldownUntilRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const scrubRef = useRef<ScrubState | null>(null);
  const scrubCleanupRef = useRef<(() => void) | null>(null);

  const commitSections = useCallback((next: Registration[]) => {
    sectionsRef.current = next;
    setSections(next);
  }, []);

  const registerSection = useCallback(
    (registration: Registration) => {
      commitSections(
        [...sectionsRef.current.filter((s) => s.id !== registration.id), registration].sort(
          (a, b) => a.index - b.index,
        ),
      );

      return () => {
        commitSections(sectionsRef.current.filter((s) => s.id !== registration.id));
      };
    },
    [commitSections],
  );

  const setActive = useCallback((index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

  // Ends a pinned scrub, whichever way it resolved — either the reader
  // pushed it all the way through (landing on the target section) or
  // reversed it back to zero (cancelling, staying on the section they
  // started from). Either way scrolling unlocks and a short cooldown stops
  // residual input from immediately re-triggering the next boundary.
  const endScrub = useCallback(
    (finalIndex: number) => {
      scrubCleanupRef.current?.();
      scrubCleanupRef.current = null;
      scrubRef.current = null;
      transitioningRef.current = false;
      setActive(finalIndex);
      setIsTransitioning(false);
      cooldownUntilRef.current = performance.now() + COOLDOWN_MS;
      lastScrollYRef.current = window.scrollY;
    },
    [setActive],
  );

  const expectedYRef = useRef(0);

  const applyScrub = useCallback(() => {
    const scrub = scrubRef.current;
    if (!scrub) return;

    const y = scrub.startY + (scrub.targetY - scrub.startY) * scrub.progress;
    expectedYRef.current = y;
    window.scrollTo(0, y);

    const shouldShowTarget = scrub.progress >= SCRUB_FLIP_AT;
    const nextActive = shouldShowTarget ? scrub.toIndex : scrub.fromIndex;
    if (nextActive !== activeIndexRef.current) setActive(nextActive);

    if (scrub.progress >= 1) endScrub(scrub.toIndex);
    else if (scrub.progress <= 0) endScrub(scrub.fromIndex);
  }, [endScrub, setActive]);

  const cancelScrub = useCallback(() => {
    if (!scrubRef.current) return;
    scrubCleanupRef.current?.();
    scrubCleanupRef.current = null;
    scrubRef.current = null;
    transitioningRef.current = false;
    setIsTransitioning(false);
  }, []);

  // Pins the page at the current scroll position and hands control of
  // further movement to the reader's own wheel/touch/key input — advancing
  // toward the next section, reversible at any point, nothing plays on its
  // own. A drag or scroll the "wrong" way cancels back to exactly where it
  // started rather than committing partway through.
  const beginScrub = useCallback(
    (nextIndex: number, direction: "down" | "up") => {
      const sections = sectionsRef.current;
      const next = sections[nextIndex];
      if (!next) return;

      const pageTop = next.element.getBoundingClientRect().top + window.scrollY;
      const targetY =
        direction === "down"
          ? pageTop
          : Math.max(0, pageTop + next.element.offsetHeight - window.innerHeight);

      scrubRef.current = {
        fromIndex: activeIndexRef.current,
        toIndex: nextIndex,
        direction,
        startY: window.scrollY,
        targetY,
        progress: 0,
      };
      // Must be set now, not left to the first applyScrub() call: the drift
      // watchdog below starts listening immediately, and until this is set
      // it holds whatever stale value was last written — for a scrub deep
      // in the page that's thousands of pixels from the real position,
      // reading as a false-positive "native scroll broke free" and
      // cancelling the scrub before a single input event has even arrived.
      expectedYRef.current = window.scrollY;
      transitioningRef.current = true;
      setIsTransitioning(true);
      setOverride(null);

      // Without this, touchmove's preventDefault() is silently ignored the
      // moment the browser's compositor has already committed to a native
      // scroll for the current gesture (a documented perf fast-path) — the
      // pin would visually engage but touch input would keep scrolling the
      // page underneath it. Telling the browser upfront to hand touch
      // handling to JS avoids that fast-path being taken at all. Only
      // affects gestures that start after this point; restored on cleanup.
      const previousTouchAction = document.documentElement.style.touchAction;
      document.documentElement.style.touchAction = "none";

      // Normalized so positive always means "advancing toward the target,"
      // regardless of whether that's physically further down or up the page.
      const advance = (rawDelta: number) => {
        const scrub = scrubRef.current;
        if (!scrub) return;
        const signed = scrub.direction === "up" ? -rawDelta : rawDelta;
        scrub.progress = clamp01(scrub.progress + signed / SCRUB_INPUT_DISTANCE);
        applyScrub();
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        advance(event.deltaY);
      };

      let touchY = 0;
      const onTouchStart = (event: TouchEvent) => {
        // Also prevented here, not just on touchmove: some browsers commit
        // a touch sequence to native scrolling before JS ever sees a
        // touchmove if the start event wasn't already claimed.
        event.preventDefault();
        touchY = event.touches[0]?.clientY ?? 0;
      };
      const onTouchMove = (event: TouchEvent) => {
        event.preventDefault();
        const currentY = event.touches[0]?.clientY ?? touchY;
        // Dragging a finger up is the same intent as a positive wheel
        // deltaY: advance toward whatever is below.
        advance(touchY - currentY);
        touchY = currentY;
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (!SCROLL_KEYS.has(event.key)) return;
        event.preventDefault();
        const isBackward = event.key === "ArrowUp" || event.key === "PageUp" || event.key === "Home";
        advance((isBackward ? -1 : 1) * SCRUB_INPUT_DISTANCE * KEY_STEP);
      };

      // Safety net: some browsers/gestures ignore touchmove's preventDefault
      // once they've already committed to a native scroll for the current
      // touch sequence (a documented fast-path, and one that can't be
      // un-committed mid-gesture no matter what's called on it). If native
      // scroll is moving scrollY out from under our own writes, "pinned"
      // input handling is no longer meaningfully in control — release it
      // and resolve to whichever section the reader actually ended up
      // nearest, rather than staying stuck unable to detect any further
      // section boundaries for the rest of the visit.
      const onDriftCheck = () => {
        const scrub = scrubRef.current;
        if (!scrub) return;
        if (Math.abs(window.scrollY - expectedYRef.current) < 60) return;
        const middle = window.innerHeight / 2;
        const fromRect = sectionsRef.current[scrub.fromIndex]?.element.getBoundingClientRect();
        const nowPastMiddle = fromRect ? fromRect.bottom <= middle || fromRect.top >= middle : true;
        endScrub(nowPastMiddle ? scrub.toIndex : scrub.fromIndex);
      };

      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("touchstart", onTouchStart, { passive: false });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("scroll", onDriftCheck, { passive: true });

      scrubCleanupRef.current = () => {
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("scroll", onDriftCheck);
        window.removeEventListener("keydown", onKeyDown);
        document.documentElement.style.touchAction = previousTouchAction;
      };
    },
    [applyScrub, endScrub],
  );

  /** Animates the window to `targetY` — used only for nav-triggered jumps. */
  const animateScrollTo = useCallback((targetY: number, onDone?: () => void) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) {
      onDone?.();
      return;
    }

    const prevent = (event: Event) => event.preventDefault();
    const preventKeys = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) event.preventDefault();
    };

    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });
    window.addEventListener("keydown", preventKeys);

    let finished = false;
    const finish = (jumpToTarget: boolean) => {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      if (jumpToTarget) window.scrollTo(0, targetY);
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
      window.removeEventListener("keydown", preventKeys);
      lastScrollYRef.current = window.scrollY;
      onDone?.();
    };

    // Animation frames stop in a backgrounded tab. Without this the scroll
    // would stay locked for as long as the tab is away, so the transition is
    // force-completed rather than left half-finished.
    const watchdog = setTimeout(() => finish(true), JUMP_MS + 600);

    const start = performance.now();
    const step = (now: number) => {
      if (finished) return;
      const progress = Math.min(1, (now - start) / JUMP_MS);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
        return;
      }
      finish(false);
    };
    requestAnimationFrame(step);
  }, []);

  const goToSection = useCallback(
    (id: string) => {
      const sections = sectionsRef.current;
      const target = sections.find((s) => s.id === id);
      if (!target) return;

      cancelScrub();

      if (shouldReduceMotion) {
        target.element.scrollIntoView({ behavior: "smooth", block: "start" });
        setActive(target.index);
        return;
      }

      transitioningRef.current = true;
      setIsTransitioning(true);
      setOverride(null);
      setActive(target.index);

      const pageTop = target.element.getBoundingClientRect().top + window.scrollY;
      animateScrollTo(pageTop, () => {
        transitioningRef.current = false;
        setIsTransitioning(false);
        cooldownUntilRef.current = performance.now() + COOLDOWN_MS;
      });
    },
    [animateScrollTo, cancelScrub, setActive, shouldReduceMotion],
  );

  // Pinned scrub: when a section's end passes the middle of the screen,
  // lock scrolling and hand control to the reader's own input (see
  // beginScrub) instead of playing a transition on its own.
  useEffect(() => {
    if (shouldReduceMotion) return;

    lastScrollYRef.current = window.scrollY;
    let lastEvaluatedAt = 0;

    const evaluate = () => {
      if (transitioningRef.current) return;
      if (performance.now() < cooldownUntilRef.current) return;

      const sections = sectionsRef.current;
      const current = sections[activeIndexRef.current];
      if (!current) return;

      const scrollY = window.scrollY;
      const direction = scrollY >= lastScrollYRef.current ? "down" : "up";
      lastScrollYRef.current = scrollY;

      const middle = window.innerHeight / 2;
      const rect = current.element.getBoundingClientRect();

      if (direction === "down" && rect.bottom <= middle && activeIndexRef.current < sections.length - 1) {
        beginScrub(activeIndexRef.current + 1, "down");
      } else if (direction === "up" && rect.top >= middle && activeIndexRef.current > 0) {
        beginScrub(activeIndexRef.current - 1, "up");
      }
    };

    // Throttled on a clock rather than an animation frame: whether a boundary
    // has been crossed must stay correct even where frames are throttled.
    const onScroll = () => {
      const now = performance.now();
      if (now - lastEvaluatedAt < 60) return;
      lastEvaluatedAt = now;
      evaluate();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shouldReduceMotion, beginScrub]);

  // Without the pinned flow, still keep the mascot in step with whatever
  // section the reader is actually looking at.
  useEffect(() => {
    if (!shouldReduceMotion) return;

    const onScroll = () => {
      const middle = window.innerHeight / 2;
      const current = sectionsRef.current.find((section) => {
        const rect = section.element.getBoundingClientRect();
        return rect.top <= middle && rect.bottom >= middle;
      });
      if (current && current.index !== activeIndexRef.current) setActive(current.index);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [setActive, shouldReduceMotion]);

  // Leaving the page mid-scrub (route away, unmount) shouldn't leave global
  // wheel/touch/key listeners attached.
  useEffect(() => () => scrubCleanupRef.current?.(), []);

  const value = useMemo<SectionFlowValue>(() => {
    const sectionAnchor = sections.find((s) => s.index === activeIndex)?.anchor ?? {
      x: 50,
      y: 50,
      hidden: true,
    };

    return {
      activeIndex,
      activeSectionId: sections.find((s) => s.index === activeIndex)?.id ?? null,
      isTransitioning,
      mascotAnchor: override ?? sectionAnchor,
      registerSection,
      goToSection,
      setMascotOverride: setOverride,
    };
  }, [activeIndex, goToSection, isTransitioning, override, registerSection, sections]);

  return <SectionFlowContext.Provider value={value}>{children}</SectionFlowContext.Provider>;
}

export function useSectionFlow() {
  const context = useContext(SectionFlowContext);
  if (!context) throw new Error("useSectionFlow must be used inside <SectionFlowProvider>");
  return context;
}

/** For chrome shared with the standalone pages, which have no flow around them. */
export function useOptionalSectionFlow() {
  return useContext(SectionFlowContext);
}

/** Registers a section with the flow and reports when it is the active one. */
export function useRegisterSection(
  id: string,
  index: number,
  anchor: MascotAnchor,
  element: HTMLElement | null,
) {
  const { registerSection, activeIndex } = useSectionFlow();
  const anchorKey = JSON.stringify(anchor);

  useEffect(() => {
    if (!element) return;
    return registerSection({ id, index, element, anchor: JSON.parse(anchorKey) as MascotAnchor });
  }, [anchorKey, element, id, index, registerSection]);

  return activeIndex === index;
}
