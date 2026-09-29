/* eslint-disable @next/next/no-img-element -- static export; every file here is
   already sized and compressed for its slot, and next/image would only add a
   wrapper around art that must sit at exact positions. */
import type { CSSProperties } from "react";
import Countdown from "./Countdown";
import { ArrowRight, ButtonLink } from "./ui";
import { APPLY_HREF, GENERATION } from "@/lib/site";

/**
 * The official cover (COVER.png, 9000×3000), rebuilt as a live scene.
 *
 * The background is the cover exactly: every cloud, both cliffs, the ground
 * and road, the pole, Bi, the paraglider and the car, each at its own cover
 * spot and at the cover's own scale (one number, --H, the scene's height).
 *
 * A screen is rarely 3:1, so the one thing that gives is the open sky between
 * the two mountains: the left side (cliff, pole, Bi) is anchored to the
 * screen's left edge, the right cliff and car to its right edge, and whatever
 * sits in between is drawn in proportionally. The lettering is then set in
 * that space, between the pole and the car.
 *
 * Every box below is in cover pixels, measured from the .ai (scene) or by
 * matching the Title/ pieces against COVER.png (text).
 */

type Box = readonly [number, number, number, number];
type Anchor = "left" | "mid" | "right";

const COVER_W = 9000;
const COVER_H = 3000;

const BOX = {
  cloudA: [3224, 67, 3971, 373],
  cloudB: [4618, 204, 5360, 664],
  cloudC: [5358, 191, 7053, 1313],
  cliffLeft: [0, 182, 2398, 2630],
  cliffRight: [6554, 0, 9000, 2526],
  ground: [0, 1807, 9000, 3000],
  signpost: [1924, 239, 3652, 3000],
  bi: [444, 1631, 1988, 2958],
  paraglider: [1120, 241, 1894, 1134],
  car: [7540, 750, 8310, 1350],
  anger: [800, 1560, 1220, 1910],
  titleOrg: [4096, 404, 6955, 854],
  titleMain: [3827, 527, 7362, 1480],
  titleGen: [4799, 1417, 6398, 1786],
} as const satisfies Record<string, Box>;

/** The sky between the mountains — the stretch that gets drawn in. */
const GAP_L = 3700; // just past the pole's lamps and the K65 plate
const GAP_R = BOX.cliffRight[0];

/** A length of `n` cover pixels at the scene's current scale. */
const cover = (n: number) => `calc(var(--H) * ${(n / COVER_H).toFixed(5)})`;

/**
 * Where a cover box lands on screen. `left` pieces keep their distance from
 * the screen's left edge, `right` pieces from its right edge, and `mid`
 * pieces slide in proportion to where they sit in the gap. `--squeeze` is the
 * cover's overflow (3H minus the screen width), and `--x0` nudges the whole
 * left side on phones.
 */
function place(b: Box, anchor: Anchor): CSSProperties {
  const style: CSSProperties = {
    position: "absolute",
    top: `${((b[1] / COVER_H) * 100).toFixed(4)}%`,
    width: cover(b[2] - b[0]),
  };
  if (anchor === "right") {
    style.right = cover(COVER_W - b[2]);
  } else {
    const f = anchor === "mid" ? Math.min(1, Math.max(0, ((b[0] + b[2]) / 2 - GAP_L) / (GAP_R - GAP_L))) : 0;
    style.left = `calc(var(--x0) + var(--H) * ${(b[0] / COVER_H).toFixed(5)} - var(--squeeze) * ${f.toFixed(4)})`;
  }
  return style;
}

/** A box's place inside a frame, as percentages of that frame. */
function within(b: Box, frame: Box): CSSProperties {
  const fw = frame[2] - frame[0];
  const fh = frame[3] - frame[1];
  return {
    position: "absolute",
    left: `${((b[0] - frame[0]) / fw) * 100}%`,
    top: `${((b[1] - frame[1]) / fh) * 100}%`,
    width: `${((b[2] - b[0]) / fw) * 100}%`,
  };
}

const TITLE: Box = [BOX.titleMain[0], BOX.titleOrg[1], BOX.titleMain[2], BOX.titleGen[3]];
// The right cliff's own ground: from the cliff's foot to the cover's edge.
const GROUND_RIGHT: Box = [GAP_R, BOX.ground[1], COVER_W, BOX.ground[3]];

// Where the three lamp faces sit inside signpost.webp, measured from the .ai.
const LAMPS = [
  { x: 87.3, y: 39.5, color: "255,90,130", delay: "0s" },
  { x: 82.7, y: 54.5, color: "255,222,90", delay: "1.2s" },
  { x: 77.0, y: 70.1, color: "140,240,110", delay: "2.4s" },
];

/** Cover-style outlined lettering: a thick stroke copy behind a clean fill. */
function Outlined({ text, fill, stroke }: { text: string; fill: string; stroke: string }) {
  return (
    <span className="grid leading-none">
      <span aria-hidden="true" className="[grid-area:1/1]" style={{ color: stroke, WebkitTextStroke: `0.22em ${stroke}` }}>
        {text}
      </span>
      <span className="[grid-area:1/1]" style={{ color: fill }}>
        {text}
      </span>
    </span>
  );
}

/** On laptop widths the gap between pole and car is narrow; the buttons tuck in to share one row. */
const SNUG = "lg:max-[1400px]:h-14 lg:max-[1400px]:px-7 lg:max-[1400px]:text-[1.2rem]";

/** Height of the band under the first screen that the next section's curve rolls over. */
const BAND = 24;

export default function Hero() {
  return (
    <section
      id="top"
      className="hero relative isolate overflow-hidden bg-[var(--sky-peach)] [--enter-offset:1.05s]"
      style={{ ["--band" as string]: `${BAND}px` }}
    >
      {/* The cover's sky, at the scene's scale, its top row carried on up to
          the top of the screen. Two copies, like the mountains: one pinned
          left, one pinned right and faded in over the open middle. */}
      <div aria-hidden="true" className="hero-sky absolute inset-y-0 -z-20" />
      <div aria-hidden="true" className="hero-sky hero-sky-right hero-right-only absolute inset-y-0 right-0 -z-20" />

      {/* The cover's scene, standing on the section's foot. Its bottom rows
          (road, grass, pole foot) run under the next section's curve. */}
      <div aria-hidden="true" className="hero-scene pointer-events-none absolute inset-x-0 bottom-0 -z-10">
        <img src="/kv/cloud-a.webp" alt="" className="anim-drift" style={{ ...place(BOX.cloudA, "left"), ["--dur" as string]: "22s" }} />
        <img src="/kv/cloud-b.webp" alt="" className="anim-drift" style={{ ...place(BOX.cloudB, "mid"), ["--dur" as string]: "28s" }} />
        <img src="/kv/cloud-c.webp" alt="" className="anim-drift hero-right-only" style={{ ...place(BOX.cloudC, "mid"), ["--dur" as string]: "34s" }} />

        <img src="/kv/cliff-left.webp" alt="" style={place(BOX.cliffLeft, "left")} />
        <img src="/kv/cliff-right.webp" alt="" className="hero-right-only" style={place(BOX.cliffRight, "right")} />

        <img src="/kv/ground.webp" alt="" className="max-w-none" style={place(BOX.ground, "left")} />
        {/* The right cliff's hills, carried with the cliff: the same ground
            plate cut to the cliff's stretch, fading in from the left so it
            melts into the main ground instead of seaming. */}
        <div
          className="hero-right-only overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_40%)]"
          style={{ ...place(GROUND_RIGHT, "right"), height: `${((GROUND_RIGHT[3] - GROUND_RIGHT[1]) / COVER_H) * 100}%` }}
        >
          <img src="/kv/ground.webp" alt="" className="absolute top-0 max-w-none" style={{ ...within(BOX.ground, GROUND_RIGHT) }} />
        </div>

        <div className="enter" style={{ ...place(BOX.paraglider, "left"), ["--d" as string]: "0.5s" }}>
          <img src="/kv/paraglider.webp" alt="" className="anim-glide w-full" />
        </div>

        <div className="enter" style={{ ...place(BOX.signpost, "left"), ["--d" as string]: "0.15s" }}>
          <div className="relative">
            <img src="/kv/signpost.webp" alt="" className="w-full" />
            {LAMPS.map((l, i) => (
              <span
                key={i}
                className="absolute aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
                style={{
                  left: `${l.x}%`,
                  top: `${l.y}%`,
                  background: `radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(${l.color},0.55) 38%, rgba(${l.color},0) 70%)`,
                  animation: `lamp 3.6s ${l.delay} ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="enter" style={{ ...place(BOX.bi, "left"), ["--d" as string]: "0.3s" }}>
          <div className="anim-bob relative" style={{ ["--dur" as string]: "3.6s" }}>
            <img src="/kv/bi.webp" alt="" className="w-full" />
            <img src="/kv/bi-anger.webp" alt="" className="anim-pulse" style={within(BOX.anger, BOX.bi)} />
          </div>
        </div>

        <div className="enter hero-right-only" style={{ ...place(BOX.car, "right"), ["--d" as string]: "0.6s" }}>
          <img src="/kv/car.webp" alt="" className="anim-hop w-full" />
        </div>
      </div>

      {/* ------------------------------------------------ the first screen */}
      <div className="relative flex min-h-[100svh] flex-col">
        {/* The lettering and the action, set in the sky between the pole and
            the car. */}
        <div className="hero-copy relative z-10 flex flex-col items-center px-5 pt-24 text-center">
          <h1 className="hero-title enter relative w-full" style={{ ["--d" as string]: "0.2s" }}>
            <span className="sr-only">
              Hội Sinh viên trường Đại học Ngoại thương — Tuyển Cộng tác viên Thế hệ thứ {GENERATION}
            </span>
            {/* The cover's three lettering pieces, each at its own measured
                place inside the block (already level; no rotation on top). */}
            <span
              aria-hidden="true"
              className="relative block w-full"
              style={{ aspectRatio: `${TITLE[2] - TITLE[0]} / ${TITLE[3] - TITLE[1]}` }}
            >
              <img src="/kv/title-org-v2.webp" alt="" style={within(BOX.titleOrg, TITLE)} />
              <img src="/kv/title-main-v2.webp" alt="" style={within(BOX.titleMain, TITLE)} />
              <img src="/kv/title-gen-v2.webp" alt="" style={within(BOX.titleGen, TITLE)} />
            </span>
          </h1>

          {/* The first round in the cover's round lettering (LF Negrita, the
              same outlines), set straight on one line. */}
          <p className="enter mt-5 flex items-baseline justify-center gap-3 font-accent text-[1.35rem] sm:text-[1.6rem]" style={{ ["--d" as string]: "0.4s" }}>
            <Outlined text="Vòng đơn" fill="#FF4F86" stroke="#FFFFFF" />
            <Outlined text="01/10 – 20/10" fill="#FFFFFF" stroke="#FF4F86" />
          </p>

          <Countdown className="enter mt-3" />

          <div className="enter mt-7 flex flex-wrap items-center justify-center gap-3" style={{ ["--d" as string]: "0.55s" }}>
            <ButtonLink href={APPLY_HREF} size="lg" className={SNUG}>
              Ứng tuyển ngay
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="#hanh-trinh" variant="secondary" size="lg" className={SNUG}>
              Xem hành trình
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Below the fold: the scene keeps painting here, and the next
          section's curve rolls over it — so the first screen is all hero. */}
      <div aria-hidden="true" style={{ height: BAND }} />
    </section>
  );
}
