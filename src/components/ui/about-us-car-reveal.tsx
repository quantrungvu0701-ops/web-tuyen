"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FRAME_COUNT = 120;
const FRAME_W = 1280;
const FRAME_H = 720;

// Bumped whenever the frames are re-exported: the filenames stay the same, so
// without this browsers keep serving the previous render from cache.
const FRAMES_VERSION = 3;

const framePath = (i: number) =>
  `/car/frames/frame-${String(i).padStart(3, "0")}.webp?v=${FRAMES_VERSION}`;

// The car faces left, so it drives in nose-first from the right.
const ENTER_FROM_X = 120;

// Sampled from the frames' own corners, so the canvas edge is invisible
// against the section.
const BACKGROUND = "#FAE7BA";

// The frames carry the zoom, the door and the copy. The scrub ends before the
// pin releases so the finished frame — the one with the text — holds on screen
// long enough to read.
const T_FRAMES_START = 0.5;
const T_FRAMES_END = 0.9;

type Props = {
  scrollMultiplier?: number;
};

export default function AboutUsCarReveal({ scrollMultiplier = 1.8 }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frames: HTMLImageElement[] = [];
    let disposed = false;

    const draw = (index: number) => {
      const img = frames[Math.max(0, Math.min(FRAME_COUNT - 1, index))];
      if (!img?.complete || img.naturalWidth === 0) return;
      ctx.drawImage(img, 0, 0, FRAME_W, FRAME_H);
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i + 1);
      if (i === 0) img.onload = () => !disposed && draw(0);
      frames.push(img);
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      const last = frames[FRAME_COUNT - 1];
      const showLast = () => draw(FRAME_COUNT - 1);
      if (last.complete) showLast();
      else last.onload = showLast;
      return () => {
        disposed = true;
      };
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctxGsap = gsap.context(() => {
      const playhead = { frame: 0 };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => "+=" + window.innerHeight * scrollMultiplier,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 0%-40%: drive in. x:0 is explicit so the Tailwind start-state
      // translate isn't read as a baseline and stacked onto xPercent.
      tl.fromTo(
        stageRef.current,
        { xPercent: ENTER_FROM_X, x: 0 },
        { xPercent: 0, x: 0, duration: 0.4 },
        0,
      );

      // 40%-50%: hold.

      // 50%-90%: scrub the frames (zoom, door, copy all baked in).
      tl.to(
        playhead,
        {
          frame: FRAME_COUNT - 1,
          snap: "frame",
          duration: T_FRAMES_END - T_FRAMES_START,
          onUpdate: () => draw(Math.round(playhead.frame)),
        },
        T_FRAMES_START,
      );

      // Keeps the timeline a full 1.0 long, so the final frame holds instead of
      // GSAP rescaling every phase to end at the last tween.
      tl.to({}, { duration: 1 - T_FRAMES_END }, T_FRAMES_END);
    }, sectionRef);

    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      disposed = true;
      cancelAnimationFrame(refresh);
      ctxGsap.revert();
    };
  }, [scrollMultiplier]);

  return (
    // Plain block wrapper: the app layout makes <body> a flex column, and
    // GSAP's pin-spacer gets flex-shrink inside it, collapsing the padding it
    // adds for scroll distance. This isolates the pin in a block context.
    <div id="about">
      <section
        ref={sectionRef}
        className="relative h-screen w-full overflow-hidden"
        style={{ backgroundColor: BACKGROUND }}
      >
        <div
          ref={stageRef}
          className="absolute inset-0 translate-x-[120%] will-change-transform motion-reduce:translate-x-0"
        >
          <canvas
            ref={canvasRef}
            width={FRAME_W}
            height={FRAME_H}
            className="h-full w-full object-cover"
          />
        </div>
      </section>
    </div>
  );
}
