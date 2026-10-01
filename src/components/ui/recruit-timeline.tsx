"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ROUNDS } from "@/lib/site";
import Decor from "@/components/v24/Decor";
import { SectionHead } from "@/components/v24/ui";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ design
 * Five polaroids either side of a road that runs the full width of the
 * screen. Hovering a polaroid or its numbered marker drives the key visual's
 * car along the road to that round; the last marker is the finish line.
 *
 * Phones get the road straightened into a vertical strip on the left with
 * the rounds stacked to its right, and the car drives down it as the page
 * scrolls.
 *
 * The car's desktop position is read off the road path with getPointAtLength,
 * so it follows the curve and can never drift from it if the road is redrawn.
 */

const TOKENS = {
  accent: "#E0115F",
  heading: "#3F0A26",
  body: "#8A3A5E",
  // The cover's own road: pink tarmac, a deeper pink kerb, butter dashes.
  asphalt: "#FF9FB4",
  asphaltEdge: "#F0708F",
  centreLine: "#FFF3B8",
  stake: "#F0708F",
  polaroid: "#FFFDF8",
} as const;

/** The board is authored at this size and scaled down to fit, never reflowed. */
const DESIGN_W = 1120;
const DESIGN_H = 860;

const ROAD_W = 140;
/** The top-down car: its length along the road, and how far it parks behind a marker (0: right on top of it). */
const CAR_W = 150;
const CAR_BEHIND = 0;
const POLA_W = 256;
const IMG_H = 168;
const POLA_H = 262;
/** Clear air between the road's centre line and the nearest polaroid edge. */
const POLA_GAP = 122;
const MARKER = 40;

/**
 * The part of the road the rounds sit on; markers are sampled along it at
 * runtime. The drawn road is this same curve carried on off both edges of the
 * screen, joined with matching tangents so there is no kink.
 */
const ROUTE_D =
  "M 74,432 C 214,348 322,348 440,418 C 558,488 628,510 742,438 C 856,366 944,356 1052,424";
const ROAD_D =
  "M -1100,470 C -500,470 -66,516 74,432 " +
  "C 214,348 322,348 440,418 C 558,488 628,510 742,438 C 856,366 944,356 1052,424 " +
  "C 1160,492 1600,510 2220,480";

/** Where along the route each round sits, as a fraction of its length. */
const STOPS = [0.04, 0.27, 0.5, 0.73, 0.96];

type Step = { name: string; date: string; level: string; image: string; video?: string };

/** TODO(images): a real photo per round; these cycle the gallery placeholders. */
const PHOTOS = ["/gallery/p1.jpg", "/gallery/p2.jpg", "/gallery/p3.png", "/gallery/p4.webp"];
const STEPS: Step[] = ROUNDS.map((r, i) => ({
  name: r.name,
  date: r.date,
  level: r.level,
  image: r.photo ?? PHOTOS[i % PHOTOS.length],
  video: r.video,
}));
const LAST = STEPS.length - 1;

/** A name set on two lines, read as one (for labels and the video title). */
const oneLine = (s: string) => s.replace(/\s*\n\s*/g, " ");

/**
 * The round's level, scribbled on the page in felt-tip like a note beside a
 * pinned photo.
 */
function LevelNote({ i, className = "", style }: { i: number; className?: string; style?: React.CSSProperties }) {
  return (
    <p
      className={`pointer-events-none select-none font-accent font-normal [font-synthesis:none] leading-[1.08] text-plum-900 ${className}`}
      style={style}
    >
      <span className="block text-[0.72em] text-pink-600">{i === LAST ? "Goal" : `Level ${i + 1}`}</span>
      {STEPS[i].level}
    </p>
  );
}

/** Notes sit across the road from their photo, this far out from its centre. */
const NOTE_W = 158;
const NOTE_GAP = 10;
/**
 * Which side of its photo each note sits on, and how far down the photo. The
 * above-road photos share their gaps, so each note sits at the height where
 * only its own photo borders the gap.
 */
const NOTE_AT: { side: "left" | "right" | "above-left" | "above-center"; y: number; dx?: number }[] = [
  { side: "right", y: 8 },
  { side: "left", y: 70 },
  // Above its photo, centred.
  { side: "above-center", y: 0 },
  // 5px further out: the photo grows on hover and would touch it.
  { side: "right", y: 70, dx: 5 },
  // Left of its photo, in the gap Level 3 left free: to its right runs off the screen.
  { side: "left", y: 5, dx: 30 },
];

/** A scattered-collage tilt, fixed per index so it never reshuffles. */
const TILT = [-3.2, 2.4, -1.8, 3.1, -2.6];

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

type Point = { x: number; y: number };

/* ------------------------------------------------------------- pieces */

/** The round's date in the same felt-tip hand as the level notes. */
function DateLine({ date, big = false }: { date: string; big?: boolean }) {
  return (
    <div className={`mt-[5.3px] font-accent font-normal [font-synthesis:none] leading-none ${big ? "text-[17px]" : "text-[16px]"}`} style={{ color: TOKENS.body }}>
      {date}
    </div>
  );
}

/** A checkered flag: the finish line. */
function FinishFlag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 3v19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="6" y="4" width="14" height="10" rx="1" fill="#fff" stroke="currentColor" strokeWidth="1.4" />
      {[0, 1, 2, 3].map((c) =>
        [0, 1].map((r) => (
          <rect
            key={`${c}${r}`}
            x={6 + c * 3.5}
            y={4 + r * 5 + ((c % 2) * 2.5)}
            width="3.5"
            height="2.5"
            fill="currentColor"
          />
        )),
      )}
    </svg>
  );
}

function PlayButton({
  onClick,
  className = "",
  style,
}: {
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      aria-label="Xem video"
      className={`grid size-16 cursor-pointer place-items-center rounded-full bg-white/92 text-[#E0115F] shadow-[0_10px_28px_-8px_rgba(63,10,38,0.55)] ring-4 ring-white/40 transition-transform duration-300 ease-[var(--ease-spring)] hover:scale-110 active:scale-95 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="ml-1 size-7" fill="currentColor" aria-hidden="true">
        <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
      </svg>
    </button>
  );
}

/** A YouTube link (any form) to its embed URL; anything else is played as a file. */
function toEmbed(url: string): { kind: "youtube" | "file"; src: string } {
  const m =
    url.match(/youtu\.be\/([\w-]{6,})/) ??
    url.match(/[?&]v=([\w-]{6,})/) ??
    url.match(/youtube\.com\/(?:embed|shorts)\/([\w-]{6,})/);
  return m
    ? { kind: "youtube", src: `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` }
    : { kind: "file", src: url };
}

/**
 * The video window. Portalled to <body>: the page's smooth scroller transforms
 * its content, which would otherwise pin a fixed overlay to that content
 * instead of the screen. The page stops scrolling while it is open.
 */
function VideoModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Pausing the smoother holds the page still; hiding the body's overflow
    // instead would drop the scroll position back to the top.
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      smoother?.paused(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const media = url ? toEmbed(url) : null;

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[200] grid place-items-center bg-[rgba(63,10,38,0.72)] p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-4xl"
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Đóng video"
          className="absolute -top-12 right-0 grid size-10 cursor-pointer place-items-center rounded-full bg-white text-[#3F0A26] shadow-lg transition-transform hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
          {media?.kind === "youtube" ? (
            <iframe
              src={media.src}
              title={title}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : media ? (
            <video src={media.src} className="h-full w-full" controls autoPlay playsInline />
          ) : (
            <div className="grid h-full w-full place-items-center p-6 text-center font-display text-xl text-white/85">
              Video {title} sẽ sớm được cập nhật!
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/**
 * The key visual's car seen from above, nose pointing right, in red:
 * plum tyres, sky-blue glass and butter-yellow panel, with Bi smiling
 * up through the sunroof.
 */
function TopCar({ className = "" }: { className?: string }) {
  // Gradient ids are per instance: the phone and desktop cars are both in the
  // page, and a url(#id) that resolves to a gradient inside the hidden one
  // paints nothing — which left the phone's car see-through.
  const uid = useId().replace(/:/g, "");
  const id = (n: string) => `${n}-${uid}`;
  return (
    <svg viewBox="0 0 200 112" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id("tc-body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF7B7B" />
          <stop offset="0.5" stopColor="#F03E4E" />
          <stop offset="1" stopColor="#D2263A" />
        </linearGradient>
        <linearGradient id={id("tc-glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E4FBFF" />
          <stop offset="1" stopColor="#8FD8F2" />
        </linearGradient>
        <linearGradient id={id("tc-panel")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE98A" />
          <stop offset="1" stopColor="#FFBE3D" />
        </linearGradient>
        <radialGradient id={id("tc-tyre")} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#7A2E4E" />
          <stop offset="1" stopColor="#3F0A26" />
        </radialGradient>
      </defs>
      {/* shadow on the road */}
      <rect x="10" y="14" width="186" height="92" rx="40" fill="rgb(120 0 40 / 0.18)" />
      {/* tyres */}
      {[
        [34, 2],
        [136, 2],
        [34, 88],
        [136, 88],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="34" height="20" rx="9" fill={`url(#${id("tc-tyre")})`} />
      ))}
      {/* body */}
      <rect x="6" y="10" width="188" height="88" rx="38" fill={`url(#${id("tc-body")})`} stroke="#A81B2E" strokeWidth="2" />
      <path d="M40 18 H156" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
      {/* bonnet panel, as on the cover's car */}
      <path d="M150 26 Q184 30 186 54 Q184 78 150 82 Z" fill={`url(#${id("tc-panel")})`} />
      {/* headlights and tail lights */}
      <ellipse cx="187" cy="30" rx="4" ry="7" fill="#FFF6C8" />
      <ellipse cx="187" cy="78" rx="4" ry="7" fill="#FFF6C8" />
      <rect x="6" y="24" width="6" height="14" rx="3" fill="#E0115F" />
      <rect x="6" y="70" width="6" height="14" rx="3" fill="#E0115F" />
      {/* windscreen and rear window */}
      <path d="M126 22 Q148 28 148 54 Q148 80 126 86 Q132 54 126 22 Z" fill={`url(#${id("tc-glass")})`} />
      <path d="M52 26 Q36 32 36 54 Q36 76 52 82 Q47 54 52 26 Z" fill={`url(#${id("tc-glass")})`} />
      {/* roof with a sunroof */}
      <rect x="54" y="20" width="72" height="68" rx="22" fill="#F4545F" />
      <circle cx="90" cy="54" r="25" fill="#7A2E4E" />
      {/* Bi: orange hair, peach face, happy squint */}
      <circle cx="90" cy="54" r="21" fill="#F2A85F" />
      <path d="M72 46 Q78 30 94 33 Q110 34 108 50 Q100 40 90 42 Q80 40 72 46 Z" fill="#E8913F" />
      <circle cx="90" cy="58" r="13" fill="#FFE1CF" />
      <path
        d="M82 55 l4 2.5 l-4 2.5 M98 55 l-4 2.5 l4 2.5"
        stroke="#6F0A3D"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M86 64 Q90 67.5 94 64" stroke="#6F0A3D" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* --------------------------------------------------------- component */

export default function RecruitTimeline() {
  const [active, setActive] = useState(0);
  const [points, setPoints] = useState<Point[]>([]);
  // The car's place along the route, in px of road; its position and heading
  // are read off the road at that length, so it drives the curve.
  const [routeLen, setRouteLen] = useState(0);
  const along = useMotionValue(0);
  const carX = useMotionValue(0);
  const carY = useMotionValue(0);
  const carR = useMotionValue(0);
  const [scale, setScale] = useState(1);
  const [video, setVideo] = useState<Step | null>(null);

  const routeRef = useRef<SVGPathElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const go = useCallback((i: number) => setActive(i), []);

  // Sample the five marker positions off the route itself.
  useEffect(() => {
    const path = routeRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    setPoints(
      STOPS.map((t) => {
        const p = path.getPointAtLength(len * t);
        return { x: p.x, y: p.y };
      }),
    );

    const at = (l: number) => path.getPointAtLength(Math.min(len, Math.max(0, l)));
    const pose = (l: number) => {
      const a = at(l - 2);
      const b = at(l + 2);
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      // Before the route's start, carry on back along its first heading.
      const pt = l >= 0 ? at(l) : { x: at(0).x + Math.cos(angle) * l, y: at(0).y + Math.sin(angle) * l };
      carX.set(pt.x - CAR_W / 2);
      carY.set(pt.y - (CAR_W * 0.56) / 2);
      carR.set((angle * 180) / Math.PI);
    };
    const unsub = along.on("change", pose);
    along.set(len * STOPS[0] - CAR_BEHIND);
    pose(along.get());
    setRouteLen(len);
    return unsub;
  }, [along, carX, carY, carR]);

  // Drive to the chosen round along the road and stop on its marker.
  useEffect(() => {
    if (!routeLen) return;
    const target = routeLen * STOPS[active] - CAR_BEHIND;
    const dist = Math.abs(target - along.get());
    const ctl = animate(
      along,
      target,
      reduceMotion ? { duration: 0 } : { duration: Math.min(2.2, Math.max(0.6, dist / 420)), ease: [0.65, 0, 0.35, 1] },
    );
    return () => ctl.stop();
  }, [active, routeLen, along, reduceMotion]);

  // Scale the whole board down rather than reflowing it.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const sync = () => setScale(Math.min(1, el.clientWidth / DESIGN_W));
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const closeVideo = useCallback(() => setVideo(null), []);

  return (
    <section id="hanh-trinh" className="relative w-full overflow-hidden">
      <Decor src="/kv/cloud-5.webp" className="-right-10 bottom-0 hidden w-60 opacity-90 lg:block" dur="30s" />
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-28 lg:px-10 lg:pb-12 lg:pt-36">
        <SectionHead
          tone="ink"
          title="Hành trình ứng tuyển"
          lead="4 cột mốc, 1 đích đến. Chạm vào từng mốc để Bi dẫn em đi!"
        />

        {/* ======================================== desktop and tablet board */}
        {/* The road runs past the board on both sides to the screen edges;
            the section clips it. */}
        <div ref={wrapRef} className="mt-6 hidden w-full justify-center md:flex">
          <div
            style={{
              width: DESIGN_W,
              height: DESIGN_H,
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              marginBottom: -(DESIGN_H * (1 - scale)),
            }}
            className="relative shrink-0"
          >
            {/* ------------------------------------------------------ road */}
            <svg
              width={DESIGN_W}
              height={DESIGN_H}
              viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}
              className="absolute inset-0 overflow-visible"
              aria-hidden="true"
            >
              <path ref={routeRef} d={ROUTE_D} fill="none" stroke="none" />
              {/* Kerb, tarmac, centre line — three passes over one path. */}
              <path d={ROAD_D} fill="none" stroke={TOKENS.asphaltEdge} strokeWidth={ROAD_W} strokeLinecap="round" />
              <path d={ROAD_D} fill="none" stroke={TOKENS.asphalt} strokeWidth={ROAD_W - 12} strokeLinecap="round" />
              <path
                d={ROAD_D}
                fill="none"
                stroke={TOKENS.centreLine}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray="30 26"
                opacity={0.9}
              />

              {/* Stake from each marker out to its polaroid */}
              {points.map((p, i) => {
                const above = i % 2 === 0;
                const y2 = above ? p.y - POLA_GAP : p.y + POLA_GAP;
                return (
                  <line
                    key={i}
                    x1={p.x}
                    y1={p.y + (above ? -ROAD_W / 2 : ROAD_W / 2)}
                    x2={p.x}
                    y2={y2}
                    stroke={TOKENS.stake}
                    strokeWidth={2.5}
                    strokeDasharray="6 6"
                    opacity={active === i ? 0.8 : 0.35}
                  />
                );
              })}
            </svg>

            {/* -------------------------------------------------- polaroids */}
            {points.map((p, i) => {
              const step = STEPS[i];
              const above = i % 2 === 0;
              // The last photo sits 40px further right, clear of its note.
              const left = clamp(p.x - POLA_W / 2, 4, DESIGN_W - POLA_W - 4) + (i === LAST ? 40 : 0);
              const top = above ? p.y - POLA_GAP - POLA_H : p.y + POLA_GAP;
              const isActive = active === i;

              return (
                <div
                  key={step.name}
                  className="absolute transition-transform duration-300 ease-out"
                  style={{
                    left,
                    top,
                    width: POLA_W,
                    transform: `rotate(${TILT[i]}deg) scale(${isActive ? 1.045 : 1})`,
                  }}
                  onMouseEnter={() => go(i)}
                  onFocus={() => go(i)}
                >
                  <button
                    type="button"
                    aria-label={step.date ? `${oneLine(step.name)}: ${step.date}` : oneLine(step.name)}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => go(i)}
                    className="block w-full cursor-pointer rounded-[3px] p-3 pb-0 text-left outline-none transition-shadow duration-300 ease-out focus-visible:ring-2 focus-visible:ring-[#241F1C]"
                    style={{
                      backgroundColor: TOKENS.polaroid,
                      boxShadow: isActive
                        ? "0 24px 44px -18px rgba(60,45,20,0.55)"
                        : "0 12px 26px -16px rgba(60,45,20,0.4)",
                    }}
                  >
                    <div className="overflow-hidden rounded-[2px] bg-black/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={step.image}
                        alt=""
                        draggable={false}
                        className="block w-full select-none object-cover"
                        style={{
                          height: IMG_H,
                          filter: isActive ? "none" : "saturate(0.82)",
                          transition: "filter .35s ease",
                        }}
                      />
                    </div>
                    <div className="px-0.5 py-3.5">
                      <div
                        className={`whitespace-pre-line font-accent font-normal [font-synthesis:none] text-[19px] leading-[23px] transition-colors duration-300 ${step.date ? "" : "text-center"}`}
                        style={{ color: isActive ? TOKENS.accent : TOKENS.heading }}
                      >
                        {step.name}
                      </div>
                      {step.date ? <DateLine date={step.date} big /> : null}
                    </div>
                  </button>
                  {/* Beside the polaroid button, not in it: a button inside a
                      button is invalid. Centred on the photo. */}
                  {step.video !== undefined ? (
                    <PlayButton
                      onClick={() => setVideo(step)}
                      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                      // The polaroid's 12px padding, then half the photo.
                      style={{ top: 12 + IMG_H / 2 }}
                    />
                  ) : null}
                </div>
              );
            })}

            {/* ------------------------------------------------------ notes */}
            {points.map((p, i) => {
              const above = i % 2 === 0;
              const polaLeft = clamp(p.x - POLA_W / 2, 4, DESIGN_W - POLA_W - 4);
              const polaTop = above ? p.y - POLA_GAP - POLA_H : p.y + POLA_GAP;
              const at = NOTE_AT[i];
              const right = at.side === "right";
              const onTop = at.side.startsWith("above");
              return (
                <LevelNote
                  key={`n${i}`}
                  i={i}
                  className={`absolute whitespace-nowrap text-[20px] ${
                    onTop ? (at.side === "above-center" ? "text-center" : "text-left") : right ? "text-left" : "text-right"
                  }`}
                  style={{
                    left:
                      (at.side === "above-center"
                        ? polaLeft + (POLA_W - NOTE_W) / 2
                        : at.side === "above-left"
                          ? polaLeft
                          : right
                            ? polaLeft + POLA_W + NOTE_GAP
                            : polaLeft - NOTE_GAP - NOTE_W) + (at.dx ?? 0),
                    ...(onTop ? { bottom: DESIGN_H - polaTop + 8 } : { top: polaTop + at.y }),
                    width: NOTE_W,
                    transform: `rotate(${-TILT[i] * 0.8}deg)`,
                  }}
                />
              );
            })}

            {/* ---------------------------------------------------- markers */}
            {points.map((p, i) => {
              const isActive = active === i;
              const finish = i === LAST;
              return (
                <button
                  key={`m${i}`}
                  type="button"
                  aria-label={`${oneLine(STEPS[i].name)}${finish ? " — đích đến" : ""}`}
                  onMouseEnter={() => go(i)}
                  onFocus={() => go(i)}
                  onClick={() => go(i)}
                  className="absolute z-10 grid cursor-pointer place-items-center rounded-full text-[16px] font-bold transition-[background-color,color,transform] duration-300 hover:scale-110"
                  style={{
                    left: p.x - MARKER / 2,
                    top: p.y - MARKER / 2,
                    width: MARKER,
                    height: MARKER,
                    backgroundColor: isActive ? TOKENS.accent : TOKENS.polaroid,
                    color: isActive ? "#fff" : TOKENS.heading,
                    border: `3px solid ${isActive ? TOKENS.accent : TOKENS.asphaltEdge}`,
                    transform: `scale(${isActive ? 1.15 : 1})`,
                  }}
                >
                  {finish ? <FinishFlag className="size-6" /> : i + 1}
                </button>
              );
            })}

            {/* -------------------------------------------------------- car */}
            {routeLen > 0 && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute z-20"
                style={{ width: CAR_W, left: 0, top: 0, x: carX, y: carY, rotate: carR }}
              >
                <TopCar className="w-full" />
              </motion.div>
            )}
          </div>
        </div>

        {/* ================================================ phones: vertical */}
        <MobileRoad onVideo={setVideo} />
      </div>

      {video ? <VideoModal url={video.video ?? ""} title={video.name} onClose={closeVideo} /> : null}
    </section>
  );
}

/* -------------------------------------------------------------- phones */

const M_ROAD_X = 36; // road centre, px from the list's left edge
const M_ROAD_W = 60;
const M_CAR_W = 84;

/**
 * The road straightened into a vertical strip on the left, the rounds stacked
 * to its right. The car drives down the strip with the page's scroll, and the
 * round it has reached lights up.
 */
function MobileRoad({ onVideo }: { onVideo: (s: Step) => void }) {
  const listRef = useRef<HTMLOListElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    const car = carRef.current;
    if (!list || !car) return;
    const mm = gsap.matchMedia();
    mm.add("(max-width: 767px)", () => {
      // Each marker's centre, in px down the list (each sits in its own <li>,
      // so offsetTop would only give its place inside that).
      const centre = (m: HTMLElement) => {
        const r = m.getBoundingClientRect();
        return r.top + r.height / 2 - list.getBoundingClientRect().top;
      };
      const place = (progress: number) => {
        const marks = markerRefs.current.filter((m): m is HTMLSpanElement => !!m);
        if (marks.length < 2) return;
        const ys = marks.map(centre);
        const y = ys[0] + (ys[ys.length - 1] - ys[0]) * progress;
        // Nose down the road, parked on top of the marker it has reached.
        car.style.transform = `translate(-50%, ${y}px) translateY(-50%) rotate(90deg)`;
        let r = 0;
        ys.forEach((my, i) => {
          if (my <= y + 1) r = i;
        });
        setReached(r);
      };
      // Progress is measured live on every scroll, not from trigger
      // positions cached at load: the photos above this section load late
      // and move it, which left cached start/end points stale. The car sets
      // off when the list's top passes 55% down the screen and arrives as
      // its bottom passes 65%.
      const update = () => {
        const r = list.getBoundingClientRect();
        const vh = window.innerHeight;
        const span = r.height - vh * 0.1;
        place(Math.min(1, Math.max(0, (vh * 0.55 - r.top) / span)));
      };
      update();
      const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: update, onRefresh: update });
      return () => st.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <ol ref={listRef} className="relative mt-12 md:hidden" aria-label="Các vòng ứng tuyển">
      {/* The road: kerb, tarmac, dashed centre line. */}
      <div
        aria-hidden="true"
        className="absolute -bottom-6 -top-6 rounded-full"
        style={{
          left: M_ROAD_X - M_ROAD_W / 2,
          width: M_ROAD_W,
          background: TOKENS.asphalt,
          boxShadow: `inset 0 0 0 4px ${TOKENS.asphaltEdge}`,
        }}
      >
        <div
          className="absolute inset-y-4 left-1/2 w-[4px] -translate-x-1/2 opacity-90"
          style={{
            backgroundImage: `repeating-linear-gradient(180deg, ${TOKENS.centreLine} 0 16px, transparent 16px 30px)`,
          }}
        />
      </div>

      {STEPS.map((step, i) => {
        const on = i <= reached;
        const finish = i === LAST;
        return (
          <li key={step.name} className="relative pb-10 pl-[86px] last:pb-0">
            <LevelNote i={i} className="mb-1.5 ml-2 -rotate-2 text-[19px]" />
            <span
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              aria-hidden="true"
              className="absolute top-6 z-10 grid size-9 -translate-x-1/2 place-items-center rounded-full text-[15px] font-bold transition-[background-color,color] duration-300"
              style={{
                left: M_ROAD_X,
                backgroundColor: on ? TOKENS.accent : TOKENS.polaroid,
                color: on ? "#fff" : TOKENS.heading,
                border: `3px solid ${on ? TOKENS.accent : TOKENS.asphaltEdge}`,
              }}
            >
              {finish ? <FinishFlag className="size-5" /> : i + 1}
            </span>
            <div
              className="relative rounded-[4px] p-2.5 pb-0 shadow-[0_12px_26px_-16px_rgba(60,45,20,0.45)]"
              style={{ backgroundColor: TOKENS.polaroid }}
            >
              <div className="relative overflow-hidden rounded-[2px] bg-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={step.image} alt="" className="block aspect-video w-full object-cover" />
                {step.video !== undefined ? (
                  <PlayButton
                    onClick={() => onVideo(step)}
                    className="absolute left-1/2 top-1/2 !size-14 -translate-x-1/2 -translate-y-1/2"
                  />
                ) : null}
              </div>
              <div className="px-0.5 py-3">
                <div className={`whitespace-pre-line font-accent font-normal [font-synthesis:none] text-[18px] leading-[22px] ${step.date ? "" : "text-center"}`} style={{ color: TOKENS.heading }}>
                  {step.name}
                </div>
                {step.date ? <DateLine date={step.date} /> : null}
              </div>
            </div>
          </li>
        );
      })}

      {/* The car, driven by the scroll. */}
      <div
        ref={carRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 z-20"
        style={{ left: M_ROAD_X, width: M_CAR_W }}
      >
        <TopCar className="w-full" />
      </div>
    </ol>
  );
}
