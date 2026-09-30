"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { APPLY_HREF, LEADERS } from "@/lib/site";
import Decor from "./Decor";
import { ArrowRight, ButtonLink, SectionHead } from "./ui";

/**
 * "Lời nhắn gửi" — last year's best-loved section, kept as its idea and
 * rebuilt: the visitor picks one of the eight anh chị as a companion, reads
 * their message, and walks to the form with them.
 */
export default function Leaders() {
  const [active, setActive] = useState(0);
  const leader = LEADERS[active];

  return (
    <section id="loi-nhan" className="relative pb-[82px] pt-28 lg:pb-[114px] lg:pt-36">
      <Decor src="/kv/cloud-2.webp" className="-left-16 top-6 hidden w-72 opacity-90 lg:block" dur="30s" />
      <Decor src="/kv/car.webp" anim="hop" flip className="-bottom-[110px] right-[12%] hidden w-42 lg:block xl:w-48" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHead
          tone="ink"
          title="Lời nhắn gửi"
          lead={
            <>
              Cùng xem những người bạn đồng hành gửi gắm gì tới em
              <br />
              trong hành trình ứng tuyển nhé!
            </>
          }
        />

        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          {/* ------------------------------------------------ the lineup */}
          <ul
            className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0"
            aria-label="Chọn bạn đồng hành"
          >
            {LEADERS.map((l, i) => {
              const on = i === active;
              return (
                <li key={i} className="w-[42%] shrink-0 snap-start sm:w-auto">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={`group w-full rounded-[26px] bg-white p-2 text-left transition-[transform,box-shadow] duration-300 ease-[var(--ease-spring)] ${
                      on
                        ? "-translate-y-1.5 shadow-[var(--shadow-md)] ring-[3px] ring-pink-500"
                        : "shadow-[var(--shadow-sm)] ring-1 ring-pink-100 hover:-translate-y-1"
                    }`}
                  >
                    <span className="photo-slot relative block aspect-[4/5] overflow-hidden rounded-[20px]">
                      {l.photo ? (
                        <img src={l.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center font-sign text-4xl text-pink-300">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                    </span>
                    <span className="block px-1.5 pb-1.5 pt-3">
                      <span className="block truncate font-display text-[1.02rem] leading-tight text-plum-900">
                        {l.name}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* ------------------------------------------------ the message */}
          <figure
            key={active}
            className="enter relative rounded-[36px] bg-pink-600 p-8 text-white shadow-[var(--shadow-lg)] sm:p-10 lg:sticky lg:top-28"
            style={{ ["--d" as string]: "0s", animationDuration: "0.55s" }}
            aria-live="polite"
          >
            {/* The bubble's tail, pointing back at the lineup. */}
            <span
              aria-hidden="true"
              className="absolute -top-3 left-12 size-7 rotate-45 rounded-[6px] bg-pink-600 lg:-left-3 lg:top-16"
            />
            <span aria-hidden="true" className="block font-display text-[5rem] leading-[0.6] text-pink-200">
              “
            </span>
            <blockquote className="mt-2 text-pretty text-[1.2rem] font-medium leading-[1.7] sm:text-[1.3rem]">
              {leader.message}
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4 border-t border-white/25 pt-6">
              <span className="photo-slot size-14 shrink-0 overflow-hidden rounded-full ring-[3px] ring-white/70">
                {leader.photo ? <img src={leader.photo} alt="" className="h-full w-full object-cover" /> : null}
              </span>
              <span>
                <span className="block font-display text-xl leading-tight">{leader.name}</span>
              </span>
            </figcaption>
            <ButtonLink
              href={APPLY_HREF}
              variant="secondary"
              className="mt-8 w-full !text-pink-700 sm:w-auto"
            >
              Điền đơn ngay
              <ArrowRight />
            </ButtonLink>
          </figure>
        </div>
      </div>
    </section>
  );
}
