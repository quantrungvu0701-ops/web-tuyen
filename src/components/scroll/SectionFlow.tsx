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
};

type Registration = {
  id: string;
  index: number;
  element: HTMLElement;
  anchor: MascotAnchor;
};

type SectionFlowValue = {
  activeIndex: number;
  isTransitioning: boolean;
  /** Anchor the mascot should currently occupy (override wins over section). */
  mascotAnchor: MascotAnchor;
  registerSection: (registration: Registration) => () => void;
  goToSection: (id: string) => void;
  /** Lets a section drive the mascot directly (e.g. the Tuyển timeline). */
  setMascotOverride: (anchor: MascotAnchor | null) => void;
};

const SectionFlowContext = createContext<SectionFlowValue | null>(null);

const TRANSITION_MS = 800;
const COOLDOWN_MS = 450;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

  /** Animates the window to `targetY`, blocking user scroll for the duration. */
  const animateScrollTo = useCallback(
    (targetY: number, onDone?: () => void) => {
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
      const watchdog = setTimeout(() => finish(true), TRANSITION_MS + 600);

      const start = performance.now();
      const step = (now: number) => {
        if (finished) return;
        const progress = Math.min(1, (now - start) / TRANSITION_MS);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));
        if (progress < 1) {
          requestAnimationFrame(step);
          return;
        }
        finish(false);
      };
      requestAnimationFrame(step);
    },
    [],
  );

  const transitionTo = useCallback(
    (nextIndex: number, direction: "down" | "up") => {
      const sections = sectionsRef.current;
      const next = sections[nextIndex];
      if (!next) return;

      transitioningRef.current = true;
      setIsTransitioning(true);
      setOverride(null);
      // Move the mascot as the scroll starts so both land together.
      setActive(nextIndex);

      const pageTop = next.element.getBoundingClientRect().top + window.scrollY;
      const targetY =
        direction === "down"
          ? pageTop
          : Math.max(0, pageTop + next.element.offsetHeight - window.innerHeight);

      animateScrollTo(targetY, () => {
        transitioningRef.current = false;
        setIsTransitioning(false);
        cooldownUntilRef.current = performance.now() + COOLDOWN_MS;
      });
    },
    [animateScrollTo, setActive],
  );

  const goToSection = useCallback(
    (id: string) => {
      const sections = sectionsRef.current;
      const target = sections.find((s) => s.id === id);
      if (!target) return;
      if (shouldReduceMotion) {
        target.element.scrollIntoView({ behavior: "smooth", block: "start" });
        setActive(target.index);
        return;
      }
      transitionTo(target.index, "down");
    },
    [setActive, shouldReduceMotion, transitionTo],
  );

  // Pinned auto-advance: when a section's end passes the middle of the screen,
  // lock scrolling and play the transition into the neighbouring section.
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
        transitionTo(activeIndexRef.current + 1, "down");
      } else if (direction === "up" && rect.top >= middle && activeIndexRef.current > 0) {
        transitionTo(activeIndexRef.current - 1, "up");
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
  }, [shouldReduceMotion, transitionTo]);

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

  const value = useMemo<SectionFlowValue>(() => {
    const sectionAnchor = sections.find((s) => s.index === activeIndex)?.anchor ?? {
      x: 50,
      y: 50,
      hidden: true,
    };

    return {
      activeIndex,
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
