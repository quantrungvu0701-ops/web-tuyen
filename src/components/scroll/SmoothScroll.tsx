"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, useGSAP);

/**
 * Site-wide smoothed scrolling.
 *
 * Native wheel scrolling on Windows advances a fixed number of text lines per
 * notch with nothing in between, which reads as the page teleporting rather
 * than moving. ScrollSmoother keeps the real scrollbar but eases the content
 * toward it, so one notch glides instead of jumping.
 *
 * ScrollSmoother transforms #smooth-content, and a transformed ancestor becomes
 * the containing block for `position: fixed` descendants — so fixed overlays
 * (the nav, the loading screen) must be rendered as siblings of this component,
 * never inside it.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // The browser restores the last scroll position on reload by default,
    // which a page like this — long, and read top to bottom — should never
    // do. `manual` opts this history entry out for its own future reloads;
    // the explicit scrollTo is what fixes the reload that got us here, since
    // that opt-out only takes effect going forward. Runs before the
    // reduced-motion branch below so it applies either way.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // Readers who ask for less motion get the plain native scroll — the markup
    // below is inert without a smoother attached to it.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      // Seconds the content takes to catch up to the scrollbar. Past ~1.5 the
      // page starts to feel detached from the wheel.
      smooth: 1,
      // Enables data-speed / data-lag on descendants for later parallax work;
      // costs nothing while unused.
      effects: true,
      // Mobile browsers fire a resize when the address bar hides, which
      // otherwise jolts pinned sections mid-scroll.
      ignoreMobileResize: true,
    });

    // Every in-page "#section" link glides through the smoother instead of
    // jumping — one delegated listener rather than a handler on each button.
    // The nav handles its own clicks (with its own clearance) and marks them
    // defaultPrevented, so it is left alone here.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      const href = a?.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      smoother.scrollTo(target, true, "top top");
    };
    document.addEventListener("click", onClick);

    // Killed by instance rather than via ScrollSmoother.get(): in development
    // React mounts effects twice, and a cleanup that looked up "the current
    // smoother" would kill the second instance instead of its own.
    return () => {
      document.removeEventListener("click", onClick);
      smoother.kill();
    };
  });

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
