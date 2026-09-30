"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { APPLY_HREF, CHARACTERS } from "@/lib/site";
import Decor from "./Decor";
import { ArrowRight, ButtonLink, SectionHead } from "./ui";

/**
 * The three Ban as a character select, drawn on the key visual's whole sign
 * pole (Key visual/extra.png) standing in its base (Key visual/7.png): each
 * lamp face is a character. The lamp cutouts sit exactly on the pole's own
 * lamps — positions and widths matched against the art, relative to
 * pole-full.webp.
 */
const LAMP = {
  red: { x: 90.94, y: 24.58, w: 14.61, src: "/kv/lamp-red.webp" },
  yellow: { x: 87.15, y: 33.97, w: 15.69, src: "/kv/lamp-yellow.webp" },
  green: { x: 82.37, y: 43.67, w: 15.64, src: "/kv/lamp-green.webp" },
} as const;

const TONE = {
  red: { chip: "bg-pink-600 text-white", band: "from-[#FF6F8E] to-[#E0115F]", glow: "255,90,130" },
  yellow: { chip: "bg-[#FFD84D] text-plum-900", band: "from-[#F2D46E] to-[#E8AE1C]", glow: "255,214,80" },
  green: { chip: "bg-grass-deep text-white", band: "from-[#9BE27A] to-[#3DA35A]", glow: "130,230,100" },
} as const;

export default function Characters() {
  const [active, setActive] = useState(0);
  const c = CHARACTERS[active];
  const tone = TONE[c.lamp];

  return (
    <section
      id="nhan-vat"
      className="relative overflow-x-clip py-28 lg:py-36"
    >
      <Decor src="/kv/cloud-b.webp" className="left-[34%] top-10 hidden w-32 lg:block" dur="26s" />
      {/* Levelled and parked on the left edge, over the foot of the section,
          where the pole runs off the page: the pole passes behind it. */}
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[116px] -left-[159px] z-10 hidden w-[30rem] rotate-[42deg] lg:block">
        <Decor src="/kv/cloud-4.webp" className="relative w-full" dur="32s" />
      </div>
      <Decor src="/kv/cloud-3.webp" flip className="-right-10 bottom-4 hidden w-60 opacity-90 lg:block" dur="34s" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* On wide screens the heading sits over the card, beside the pole;
            on phones it leads, above the pole. */}
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-10">
          <SectionHead
            tone="ink"
            title="Chọn nhân vật của bạn"
            lead="Hãy chọn màu đèn phù hợp với em nhé!"
            className="sticker-one-line char-head lg:col-start-2 lg:row-start-1 lg:self-end"
          />

          {/* ------------------------------------------------- the pole */}
          {/* On wide screens the traffic light keeps the size it had on its
              own (lamps at 0.37 of the art), so the whole pole is 821px wide:
              it is placed by its red lamp, where that lamp used to be, and
              the rest of the pole runs down and off the left edge. */}
          <div className="mx-auto w-full lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:max-w-none">
            {/* Phones: the pole stood upright, twice the size, and cut off just
                below the traffic light's arm, so the lamps stay big enough to tap. */}
            <div className="relative max-lg:-mb-12 max-lg:h-[470px] max-lg:overflow-hidden lg:h-[790px] lg:w-[400px] lg:[clip-path:inset(-100vh_-100vw_-144px_-100vw)]">
            <div className="relative max-lg:left-[42%] max-lg:top-[10px] max-lg:w-[440px] max-lg:-translate-x-1/2 max-lg:-rotate-[14deg] lg:absolute lg:left-[-423px] lg:top-[-110px] lg:w-[821px]">
              <img src="/kv/pole-full.webp" alt="" aria-hidden="true" className="w-full" />
              {CHARACTERS.map((ch, i) => {
                const l = LAMP[ch.lamp];
                const on = i === active;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    aria-label={`${ch.title} — ${ch.ban}`}
                    aria-pressed={on}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    // The only way to pick a Ban: hover on a mouse, tap on a phone. The
                    // invisible ring around each lamp makes the tap target
                    // bigger than the small lamps on a phone.
                    className="absolute cursor-pointer rounded-full transition-[transform,filter] duration-500 ease-[var(--ease-spring)] before:absolute before:-inset-3 before:rounded-full before:content-['']"
                    style={{
                      left: `${l.x}%`,
                      top: `${l.y}%`,
                      width: `${l.w}%`,
                      // Never below 1: a smaller cutout would let the pole's
                      // own, lit lamp show round its edge.
                      transform: `translate(-50%, -50%) scale(${on ? 1.12 : 1})`,
                      filter: on
                        ? `drop-shadow(0 0 22px rgba(${TONE[ch.lamp].glow},0.85))`
                        : "saturate(0.35) brightness(0.92)",
                    }}
                  >
                    <img src={l.src} alt="" className="w-full" />
                  </button>
                );
              })}
            </div>
            </div>
          </div>

          {/* ------------------------------------------------ the card */}
          <article
            // Under the heading, in the right-hand column.
            key={c.id}
            className="enter overflow-hidden rounded-[36px] bg-white shadow-[var(--shadow-lg)] lg:col-start-2 lg:row-start-2 lg:self-start"
            style={{ animationDuration: "0.55s" }}
            aria-live="polite"
          >
            <div className={`bg-gradient-to-r ${tone.band} px-8 pb-6 pt-7 sm:px-10`}>
              <span className={`inline-block rounded-full px-3.5 py-1 text-[0.8625rem] font-bold uppercase tracking-[0.12em] ${tone.chip} ring-2 ring-white/60`}>
                {c.ban}
              </span>
              <h3 className="mt-4 font-display text-[clamp(2.2rem,4.4vw,3.4rem)] leading-none text-white [text-shadow:0_3px_0_rgb(120_0_40/0.25)]">
                {c.title}
              </h3>
            </div>
            <div className="grid gap-8 px-8 pb-9 pt-7 sm:px-10 md:grid-cols-[1fr_0.9fr] md:items-center">
              <div>
                <p className="font-display text-[1.45rem] leading-snug text-plum-900 sm:text-[1.65rem]">
                  “{c.tagline}”
                </p>
                <p className="mt-5 max-w-[56ch] text-justify text-[1.05rem] leading-[1.75] text-plum-900/80">{c.body}</p>
                <ButtonLink href={APPLY_HREF} className="mt-8">
                  Điền đơn ngay
                  <ArrowRight />
                </ButtonLink>
              </div>
              {/* One picture of the Ban; a hatched slot until it arrives. */}
              {c.photo ? (
                <img
                  src={c.photo}
                  alt={c.ban}
                  className="aspect-[4/3] w-full rounded-[24px] object-cover shadow-[var(--shadow-md)]"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="photo-slot grid aspect-[4/3] w-full place-items-center rounded-[24px] font-display text-lg text-pink-300"
                >
                  Ảnh {c.ban}
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
