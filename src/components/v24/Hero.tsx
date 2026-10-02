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
 * Everything that does not move — sky, clouds, both cliffs, the ground, the
 * grass and the road — is ONE plate exported straight from COVER.ai
 * (/kv/cover-plate.webp), so its composition is the designer's exactly. It is
 * as tall as the screen allows (--H), which puts the ground and road where the
 * cover has them. A screen is narrower than 3:1, so the plate is squeezed
 * slightly across (--Wp), losing only the cover's empty outer edges.
 *
 * What moves — the paraglider, the sign pole and its lamps, Bi, the car — sits
 * on top at its own cover spot and true shape, never squeezed.
 *
 * Every box below is in cover pixels, measured from the .ai (scene) or by
 * matching the Title/ pieces against COVER.png (text).
 */

type Box = readonly [number, number, number, number];

const COVER_W = 9000;
const COVER_H = 3000;

const BOX = {
  signpost: [1924, 239, 3652, 3000],
  bi: [444, 1631, 1988, 2958],
  paraglider: [1120, 241, 1894, 1134],
  car: [7540, 750, 8310, 1350],
  anger: [800, 1560, 1220, 1910],
  // Lifted 120 above and 32 right of its cover spot (≈5px on a laptop), per review: more air above "Tuyển Cộng tác viên".
  titleOrg: [4128, 284, 6987, 734],
  titleMain: [3827, 527, 7362, 1480],
  titleGen: [4799, 1417, 6398, 1786],
} as const satisfies Record<string, Box>;

const n = (v: number) => v.toFixed(5);

/** Where cover x lands on screen: through the plate's squeeze. */
const mapX = (x: number) => `var(--x0) + var(--Wp) * ${n(x / COVER_W)}`;
/** A length of `v` cover pixels, unsqueezed. */
const len = (v: number) => `var(--H) * ${n(v / COVER_H)}`;

/**
 * The left group — paraglider, sign pole, Bi — keeps the cover's own spacing
 * (the squeeze would crowd Bi onto the GO sign) and is pinned to the plate as
 * one piece at cover x 1300, which keeps Bi on screen and the pole's foot on
 * the grass just left of where the road begins.
 */
const LEFT_PIN = 1300;
function placeLeft(b: Box): CSSProperties {
  return {
    position: "absolute",
    top: `${((b[1] / COVER_H) * 100).toFixed(4)}%`,
    left: `calc(${mapX(LEFT_PIN)} + ${len(b[0] - LEFT_PIN)})`,
    width: `calc(${len(b[2] - b[0])})`,
  };
}

/**
 * A lone moving piece at its cover spot: centred where the plate puts its
 * centre, at its own true size so nothing round turns oval.
 */
function place(b: Box): CSSProperties {
  const cx = (b[0] + b[2]) / 2;
  const w = b[2] - b[0];
  return {
    position: "absolute",
    top: `${((b[1] / COVER_H) * 100).toFixed(4)}%`,
    left: `calc(${mapX(cx)} - ${len(w / 2)})`,
    width: `calc(${len(w)})`,
  };
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

/**
 * The lettering's column on wide screens: from the traffic light's right edge
 * to the car's left edge, both as the plate places them.
 */
const carCx = (BOX.car[0] + BOX.car[2]) / 2;
const COPY_LEFT = `calc(${mapX(LEFT_PIN)} + ${len(BOX.signpost[2] - LEFT_PIN)} + 12px)`;
const COPY_RIGHT = `calc(100% - (${mapX(carCx)} - ${len((BOX.car[2] - BOX.car[0]) / 2)}) + 12px)`;

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

/** On desktop the column between pole and car is narrow; the buttons tuck in to share one row. */
const SNUG = "lg:h-14 lg:px-7 lg:text-[1.2rem]";

export default function Hero() {
  return (
    <section
      id="top"
      className="hero relative isolate overflow-hidden bg-[var(--sky-peach)] [--enter-offset:3.05s] lg:[--enter-offset:1.05s]"
      style={
        {
          ["--copy-left" as string]: COPY_LEFT,
          ["--copy-right" as string]: COPY_RIGHT,
        } as CSSProperties
      }
    >
      {/* The cover plate: sky, clouds, cliffs, ground, road — one piece. Its
          top row carries on up the screen above it. */}
      <div aria-hidden="true" className="hero-plate absolute inset-y-0 -z-20">
        <div />
      </div>

      {/* What moves, each at its cover spot on the plate. */}
      <div aria-hidden="true" className="hero-scene pointer-events-none absolute inset-x-0 bottom-0 -z-10">
        <div className="enter" style={{ ...placeLeft(BOX.paraglider), ["--d" as string]: "0.5s" }}>
          <img src="/kv/paraglider.webp" alt="" className="anim-glide w-full" />
        </div>

        <div className="enter" style={{ ...placeLeft(BOX.signpost), ["--d" as string]: "0.15s" }}>
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

        <div className="enter" style={{ ...placeLeft(BOX.bi), ["--d" as string]: "0.3s" }}>
          <div className="anim-bob relative" style={{ ["--dur" as string]: "3.6s" }}>
            <img src="/kv/bi.webp" alt="" className="w-full" />
            <img src="/kv/bi-anger.webp" alt="" className="anim-pulse" style={within(BOX.anger, BOX.bi)} />
          </div>
        </div>

        <div className="enter hero-right-only" style={{ ...place(BOX.car), ["--d" as string]: "0.6s" }}>
          <img src="/kv/car.webp" alt="" className="anim-hop w-full" />
        </div>
      </div>

      {/* ------------------------------------------------ the first screen */}
      <div className="relative flex min-h-[100svh] flex-col">
        {/* The lettering and the action, between the pole and the car. */}
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
              Điền đơn ngay
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="#hanh-trinh" variant="secondary" size="lg" className={SNUG}>
              Hành trình ứng tuyển
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
