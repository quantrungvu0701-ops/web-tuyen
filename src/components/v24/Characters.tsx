"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { APPLY_HREF, CHARACTERS } from "@/lib/site";
import { ArrowRight, ButtonLink, SectionHead } from "./ui";

/**
 * The three Ban as a character select, drawn on the key visual's own traffic
 * light: each lamp face is a character. Lamp positions are measured from the
 * cover's artboard, relative to light-body.webp.
 */
const LAMP = {
  red: { x: 81.1, y: 21.9, src: "/kv/lamp-red.webp" },
  yellow: { x: 74.1, y: 44.5, src: "/kv/lamp-yellow.webp" },
  green: { x: 65.4, y: 68.0, src: "/kv/lamp-green.webp" },
} as const;

const TONE = {
  red: { chip: "bg-pink-600 text-white", band: "from-[#FF6F8E] to-[#E0115F]", glow: "255,90,130" },
  yellow: { chip: "bg-[#FFD84D] text-plum-900", band: "from-[#FFE98A] to-[#FFC530]", glow: "255,214,80" },
  green: { chip: "bg-grass-deep text-white", band: "from-[#9BE27A] to-[#3DA35A]", glow: "130,230,100" },
} as const;

export default function Characters() {
  const [active, setActive] = useState(0);
  const c = CHARACTERS[active];
  const tone = TONE[c.lamp];

  return (
    <section
      id="nhan-vat"
      className="relative overflow-hidden py-28 lg:py-36"
      style={{ background: "linear-gradient(180deg, #FFF3D9 0%, #FDE3D6 55%, #FFD9E0 100%)" }}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <SectionHead
          tone="ink"
          title="Chọn nhân vật của bạn"
          lead="Ba Ban, ba vai trò trong cùng một cuộc chơi. Chạm vào từng đèn để gặp nhân vật của em."
        />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* ------------------------------------------------ the light */}
          <div className="mx-auto w-full max-w-[220px] sm:max-w-[300px] lg:max-w-[400px]">
            <div className="relative">
              <img src="/kv/light-body.webp" alt="" aria-hidden="true" className="w-full" />
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
                    className="absolute w-[30%] rounded-full transition-[transform,filter] duration-500 ease-[var(--ease-spring)]"
                    style={{
                      left: `${l.x}%`,
                      top: `${l.y}%`,
                      transform: `translate(-50%, -50%) scale(${on ? 1.12 : 0.96})`,
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

            <div className="mt-8 flex justify-center gap-2" role="group" aria-label="Chọn Ban">
              {CHARACTERS.map((ch, i) => (
                <button
                  key={ch.id}
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] duration-300 ${
                    i === active
                      ? `${TONE[ch.lamp].chip} shadow-[var(--shadow-sm)]`
                      : "bg-white/70 text-plum-500 hover:bg-white"
                  }`}
                >
                  {ch.ban.replace("Ban ", "")}
                </button>
              ))}
            </div>
          </div>

          {/* ------------------------------------------------ the card */}
          <article
            key={c.id}
            className="enter overflow-hidden rounded-[36px] bg-white shadow-[var(--shadow-lg)]"
            style={{ animationDuration: "0.55s" }}
            aria-live="polite"
          >
            <div className={`bg-gradient-to-r ${tone.band} px-8 pb-6 pt-7 sm:px-10`}>
              <span className={`inline-block rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-[0.12em] ${tone.chip} ring-2 ring-white/60`}>
                {c.ban}
              </span>
              <h3 className="mt-4 font-display text-[clamp(2.2rem,4.4vw,3.4rem)] leading-none text-white [text-shadow:0_3px_0_rgb(120_0_40/0.25)]">
                {c.title}
              </h3>
            </div>
            <div className="px-8 pb-9 pt-7 sm:px-10">
              <p className="font-display text-[1.45rem] leading-snug text-plum-900 sm:text-[1.65rem]">
                “{c.tagline}”
              </p>
              <p className="mt-5 max-w-[56ch] text-[1.05rem] leading-[1.75] text-plum-900/80">{c.body}</p>
              <ButtonLink href={APPLY_HREF} className="mt-8">
                Chọn {c.ban} trong đơn
                <ArrowRight />
              </ButtonLink>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
