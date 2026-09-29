"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ROUNDS } from "@/lib/site";
import { SectionHead } from "@/components/v24/ui";

/* ------------------------------------------------------------------ design
 * Five polaroids scattered either side of a road that winds across the
 * section — the reference's thread, rebuilt as tarmac. Every round's photo is
 * on screen at once; hovering one walks the mascot along the road to that
 * round's marker.
 *
 * The mascot's position is read off the road path itself with
 * getPointAtLength, not from a table of coordinates, so it genuinely follows
 * the curve and the two can never drift apart if the road is redrawn.
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

/** The timeline is authored at this size and scaled down to fit — never
 *  reflowed, and never handed a horizontal scrollbar. */
const DESIGN_W = 1120;
const DESIGN_H = 660;

const MASCOT = 104;
const POLA_W = 196;
const POLA_H = 206;
/** Clear air between the road's centre line and the nearest polaroid edge. */
const POLA_GAP = 92;

/**
 * The road. Points for the five markers are sampled along this at runtime, so
 * the shape can be redrawn freely without touching anything else.
 */
const ROAD_D =
  "M 74,352 C 214,268 322,268 440,338 C 558,408 628,430 742,358 C 856,286 944,276 1052,344";

/** Where along the road each round sits, as a fraction of its length. */
const STOPS = [0.04, 0.27, 0.5, 0.73, 0.96];

type Step = { name: string; date: string; image: string };

/** TODO(images): a real photo per round; these cycle the gallery placeholders. */
const PHOTOS = ["/gallery/p1.jpg", "/gallery/p2.jpg", "/gallery/p3.png", "/gallery/p4.webp"];
const STEPS: Step[] = ROUNDS.map((r, i) => ({
  name: r.name,
  date: r.date,
  image: r.photo ?? PHOTOS[i % PHOTOS.length],
}));

/** A scattered-collage tilt, fixed per index so it never reshuffles. */
const TILT = [-3.2, 2.4, -1.8, 3.1, -2.6];

const clamp = (n: number, lo: number, hi: number) =>
  n < lo ? lo : n > hi ? hi : n;

type Point = { x: number; y: number };

export default function RecruitTimeline() {
  const [active, setActive] = useState(0);
  const [points, setPoints] = useState<Point[]>([]);
  const [scale, setScale] = useState(1);

  const pathRef = useRef<SVGPathElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  // Sample the five marker positions off the road itself.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    setPoints(
      STOPS.map((t) => {
        const p = path.getPointAtLength(len * t);
        return { x: p.x, y: p.y };
      }),
    );
  }, []);

  // Scale the whole board down rather than reflowing it or overflowing into a
  // scrollbar, which is what the straight-line version used to do.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const sync = () =>
      setScale(Math.min(1, el.clientWidth / DESIGN_W));
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const activePoint = points[active];

  return (
    <section id="hanh-trinh" className="w-full bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
        <SectionHead
          tone="ink"
          title="Hành trình ứng tuyển"
          lead="Năm chặng đường, một điểm đến: BFF. Chạm vào từng mốc để Bi dẫn em đi."
        />

        {/* justify-center + origin top-center keeps the board centred at any
            scale; the layout box stays DESIGN_W wide whatever the transform
            does, so it overflows on narrow screens and needs the clip. */}
        <div
          ref={wrapRef}
          className="mt-10 flex w-full justify-center overflow-hidden"
        >
          <div
            style={{
              width: DESIGN_W,
              height: DESIGN_H,
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              // The scaled box still reserves its full untransformed height in
              // flow, so the section would otherwise end with a tall gap.
              marginBottom: -(DESIGN_H * (1 - scale)),
            }}
            className="relative shrink-0"
          >
            {/* ------------------------------------------------------ road */}
            <svg
              width={DESIGN_W}
              height={DESIGN_H}
              viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}
              className="absolute inset-0"
              aria-hidden="true"
            >
              {/* Kerb, tarmac, centre line — three passes over one path. */}
              <path
                ref={pathRef}
                d={ROAD_D}
                fill="none"
                stroke={TOKENS.asphaltEdge}
                strokeWidth={62}
                strokeLinecap="round"
              />
              <path
                d={ROAD_D}
                fill="none"
                stroke={TOKENS.asphalt}
                strokeWidth={54}
                strokeLinecap="round"
              />
              <path
                d={ROAD_D}
                fill="none"
                stroke={TOKENS.centreLine}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray="20 18"
                opacity={0.85}
              />

              {/* Stake from each marker out to its polaroid */}
              {points.map((p, i) => {
                const above = i % 2 === 0;
                const y2 = above ? p.y - POLA_GAP : p.y + POLA_GAP;
                return (
                  <line
                    key={i}
                    x1={p.x}
                    y1={p.y}
                    x2={p.x}
                    y2={y2}
                    stroke={TOKENS.stake}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    opacity={active === i ? 0.75 : 0.3}
                  />
                );
              })}
            </svg>

            {/* -------------------------------------------------- polaroids */}
            {points.map((p, i) => {
              const step = STEPS[i];
              const above = i % 2 === 0;
              const left = clamp(p.x - POLA_W / 2, 4, DESIGN_W - POLA_W - 4);
              const top = above ? p.y - POLA_GAP - POLA_H : p.y + POLA_GAP;
              const isActive = active === i;

              return (
                <div
                  key={step.name}
                  className="absolute"
                  style={{ left, top, width: POLA_W }}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <button
                    type="button"
                    aria-label={`${step.name}: ${step.date}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setActive(i)}
                    className="block w-full cursor-pointer rounded-[3px] p-3 pb-0 text-left outline-none transition-[transform,box-shadow] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-[#241F1C]"
                    style={{
                      backgroundColor: TOKENS.polaroid,
                      transform: `rotate(${TILT[i]}deg) scale(${
                        isActive ? 1.045 : 1
                      })`,
                      boxShadow: isActive
                        ? "0 22px 40px -18px rgba(60,45,20,0.55)"
                        : "0 12px 26px -16px rgba(60,45,20,0.4)",
                    }}
                  >
                    <div className="overflow-hidden rounded-[2px] bg-black/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={step.image}
                        alt=""
                        draggable={false}
                        className="block h-[132px] w-full select-none object-cover"
                        style={{
                          filter: isActive ? "none" : "saturate(0.82)",
                          transition: "filter .35s ease",
                        }}
                      />
                    </div>

                    {/* Caption. The date is the line the user fills; the round
                        name rides above it because otherwise these five
                        photographs are unlabelled — see checklist item 11. */}
                    <div className="px-0.5 py-3">
                      <div
                        className="font-display text-[15px] leading-tight transition-colors duration-300"
                        style={{
                          color: isActive ? TOKENS.accent : TOKENS.heading,
                        }}
                      >
                        {step.name}
                      </div>
                      {/* PS Bolden only for real dates: it has no en dash (a
                          hyphen is its own) and no Vietnamese, so a placeholder
                          like "[Ngày]" falls back to the body face. */}
                      <div
                        className={`mt-1.5 leading-none ${
                          /^[\d/\s–-]+$/.test(step.date)
                            ? "font-sign text-[19px] tracking-wide"
                            : "text-[13px] font-semibold"
                        }`}
                        style={{ color: TOKENS.body }}
                      >
                        {step.date.replace("–", "-")}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}

            {/* ---------------------------------------------------- markers */}
            {points.map((p, i) => {
              const isActive = active === i;
              return (
                <div
                  key={`m${i}`}
                  className="pointer-events-none absolute grid place-items-center rounded-full text-[13px] font-bold transition-[background-color,color,transform] duration-300"
                  style={{
                    left: p.x - 15,
                    top: p.y - 15,
                    width: 30,
                    height: 30,
                    backgroundColor: isActive ? TOKENS.accent : TOKENS.polaroid,
                    color: isActive ? "#fff" : TOKENS.heading,
                    border: `2px solid ${isActive ? TOKENS.accent : TOKENS.asphaltEdge}`,
                    transform: `scale(${isActive ? 1.15 : 1})`,
                  }}
                >
                  {i + 1}
                </div>
              );
            })}

            {/* ----------------------------------------------------- mascot */}
            {activePoint && (
              <motion.img
                src="/kv/bi.webp"
                alt=""
                aria-hidden="true"
                width={MASCOT}
                height={MASCOT}
                className="pointer-events-none absolute select-none"
                style={{ width: MASCOT, height: "auto", left: 0, top: 0 }}
                initial={false}
                animate={{
                  x: activePoint.x - MASCOT / 2,
                  // Stands on the road rather than centred on it.
                  // Feet on the tarmac: Bi stands in the road rather than above
                  // it, which keeps his head clear of the polaroid overhead.
                  y: activePoint.y - MASCOT * 0.78,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 190, damping: 22, mass: 0.8 }
                }
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
