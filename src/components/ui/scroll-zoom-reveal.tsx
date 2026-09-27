"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type ParallaxPhoto = {
  src: string;
  /** Where it sits in the stage, as CSS values. */
  top: string;
  left?: string;
  right?: string;
  width: string;
  /** Travel in px across the pinned scroll: positive starts low, ends high. */
  start: number;
  end: number;
  rotate?: number;
};

/**
 * Adapted from the supplied `modern-hero` component, in four ways:
 *
 *  1. It runs on GSAP ScrollTrigger, not framer-motion's `useScroll`. Not a
 *     preference — this site runs GSAP ScrollSmoother, which keeps the real
 *     scrollbar authoritative and eases the content toward it. Measured before
 *     changing it: `window.scrollY`, which is what `useScroll` reads, runs up
 *     to 300px ahead of what is actually on screen, so the image would finish
 *     expanding while the copy was still mid-screen. ScrollTrigger is the same
 *     library as the smoother and stays in lockstep with it.
 *  2. No `ReactLenis`. That is a second, competing page-wide scroll smoother,
 *     and this site already has one.
 *  3. The demo's SpaceX nav and launch-schedule list are dropped — page
 *     scaffolding for the standalone demo, not part of the effect.
 *  4. The zoom stops at a large centred frame rather than going full-bleed,
 *     which is what was asked for.
 */
export default function ScrollZoomReveal({
  image,
  imageAlt = "",
  parallax = [],
  fadeTo,
  children,
}: {
  image: string;
  imageAlt?: string;
  parallax?: ParallaxPhoto[];
  /** Colour the bottom edge dissolves into — the next section's background. */
  fadeTo: string;
  /** The copy. Occupies the left half and scrolls away normally. */
  children: ReactNode;
}) {
  const stage = useRef<HTMLDivElement | null>(null);
  const pinned = useRef<HTMLDivElement | null>(null);
  const frame = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLImageElement | null>(null);

  useGSAP(
    () => {
      const stageEl = stage.current;
      const pinnedEl = pinned.current;
      const frameEl = frame.current;
      if (!stageEl || !pinnedEl || !frameEl) return;

      const mm = gsap.matchMedia();

      // Below lg the copy sits above the photo in one column; pinning and
      // sliding a half-width frame has nothing to slide across.
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stageEl,
            // The copy is centred in the stage's first viewport-height, so the
            // moment the stage's top meets the viewport's top is exactly the
            // moment the copy is centred — which is where this should begin.
            start: "top top",
            end: () => "+=" + window.innerHeight * SCROLL_LENGTH,
            pin: pinnedEl,
            // The copy is NOT pinned: it keeps scrolling up and out while the
            // photo holds and grows behind it.
            pinSpacing: false,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // The frame is authored at its FINAL size and scaled *down* to start,
        // so the whole move is transform-only — animating width would relayout
        // the frame on every scroll frame.
        // Spread over most of the pin rather than the default half, so the
        // growth uses the scroll instead of finishing early and leaving a
        // long stretch of nothing happening.
        tl.fromTo(
          frameEl,
          {
            scale: START_SCALE,
            x: () => pinnedEl.clientWidth * START_OFFSET_RATIO,
          },
          { scale: 1, x: 0, duration: GROW_DURATION },
          0,
        );

        // The photo itself starts over-zoomed and settles back, the way the
        // original's background-size ran 170% down to 100%.
        if (inner.current) {
          tl.fromTo(
            inner.current,
            { scale: INNER_ZOOM },
            { scale: 1, duration: GROW_DURATION },
            0,
          );
        }

        parallax.forEach((photo, i) => {
          const el = stageEl.querySelector<HTMLElement>(`[data-parallax="${i}"]`);
          if (!el) return;
          tl.fromTo(
            el,
            { y: photo.start, opacity: 0 },
            { y: photo.end, opacity: 1, duration: GROW_DURATION },
            0,
          );
          // Gone before the frame finishes, so they never crowd the photo at
          // its largest.
          tl.to(el, { opacity: 0, duration: 0.2 }, GROW_DURATION * 0.72);
        });
      });

      return () => mm.revert();
    },
    { scope: stage, dependencies: [image, parallax.length] },
  );

  return (
    <div
      ref={stage}
      // 220vh = one viewport at rest + SCROLL_LENGTH (1.2) of pinned scroll.
      // Written as a literal because `calc(100vh+120vh)` is invalid CSS —
      // calc needs whitespace around the +, and without it the declaration is
      // dropped, the stage collapses and the pinned photo runs straight over
      // the next section. Keep this in step with SCROLL_LENGTH below.
      className="relative w-full lg:h-[220vh]"
    >
      {/* The layer that holds still while the copy rides up over it. */}
      <div
        ref={pinned}
        className="relative w-full overflow-hidden lg:h-screen"
      >
        {/* Photo. Centred and full size in the markup; GSAP scales it down to
            its half-width resting position and back up again. */}
        <div
          ref={frame}
          className="absolute left-1/2 top-1/2 hidden aspect-[16/9] h-[70vh] max-w-[86vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-[0_30px_80px_-40px_rgba(60,45,20,0.55)] lg:block"
          style={{ willChange: "transform" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={inner}
            src={image}
            alt={imageAlt}
            draggable={false}
            className="h-full w-full select-none object-cover"
            style={{ willChange: "transform" }}
          />
        </div>

        {parallax.map((photo, i) => (
          <div
            key={i}
            data-parallax={i}
            aria-hidden="true"
            className="pointer-events-none absolute hidden overflow-hidden rounded-xl bg-white p-2 shadow-[0_18px_44px_-18px_rgba(60,45,20,0.45)] lg:block"
            style={{
              top: photo.top,
              left: photo.left,
              right: photo.right,
              width: photo.width,
              transform: photo.rotate ? `rotate(${photo.rotate}deg)` : undefined,
              willChange: "transform, opacity",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt=""
              draggable={false}
              className="block w-full select-none rounded-lg object-cover"
            />
          </div>
        ))}

        {/* The bottom edge dissolving into whatever comes next. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden h-56 lg:block"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${hexToRgba(fadeTo, 0)}, ${fadeTo})`,
          }}
        />
      </div>

      {/* Copy: left half, in normal flow, scrolling past the held photo. It
          sits above it so the two never fight while they overlap. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 lg:h-screen">
        <div className="mx-auto grid h-full max-w-7xl items-center px-6 lg:grid-cols-2 lg:px-10">
          <div className="pointer-events-auto py-20 lg:py-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** How far the pin runs, in viewport heights. */
const SCROLL_LENGTH = 1.2;
/**
 * Share of the pin the growth occupies. The rest is the photo holding at full
 * size while the copy finishes clearing and the bottom edge dissolves.
 */
const GROW_DURATION = 0.82;
/** Resting size, as a fraction of the frame's final size. */
const START_SCALE = 0.56;
/** How far right of centre it rests, as a fraction of the stage's width. */
const START_OFFSET_RATIO = 0.24;
/** The photo's own starting zoom inside the frame. */
const INNER_ZOOM = 1.25;

function hexToRgba(hex: string, alpha: number) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return hex;
  return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, ${alpha})`;
}
