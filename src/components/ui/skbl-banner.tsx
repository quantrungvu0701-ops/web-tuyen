"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Side-event promo strip ("Sự kiện bên lề") that scrolls continuously.
 *
 * Self-contained: the keyframes live here rather than in globals.css, so the
 * strip keeps working when the scrapped draft's stylesheet is cleared out.
 *
 * TODO(banner): currently the Enigmasphere artwork from assets/source. Swap
 * `BANNER` when the final SKBL banner is ready.
 */
const BANNER = "/skbl-banner.webp";
const BANNER_W = 1200;
const BANNER_H = 450;
const COPIES = 3;
const DURATION_S = 30;

export default function SkblBanner() {
  return (
    <Link
      href="/skbl"
      aria-label="Sự kiện bên lề — Enigmasphere: The Exam"
      className="group block overflow-hidden border-y-4 border-black/10 bg-[#0E2A46]"
    >
      <style>{`
        @keyframes skbl-marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .skbl-track {
          animation: skbl-marquee-left ${DURATION_S}s linear infinite;
          will-change: transform;
        }
        .group:hover .skbl-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .skbl-track { animation: none; }
        }
      `}</style>

      <div className="skbl-track flex w-max">
        {/* Rendered twice: the track travels exactly half its own width, so the
            loop has no visible seam. The second copy is inert so its contents
            are not announced or focusable twice. */}
        <div className="flex shrink-0">
          {Array.from({ length: COPIES }).map((_, i) => (
            <Image
              key={i}
              src={BANNER}
              alt={i === 0 ? "Enigmasphere: The Exam — đặt chỗ ngay" : ""}
              width={BANNER_W}
              height={BANNER_H}
              className="h-16 w-auto sm:h-20 md:h-24"
              priority={false}
            />
          ))}
        </div>
        <div className="flex shrink-0" aria-hidden="true">
          {Array.from({ length: COPIES }).map((_, i) => (
            <Image
              key={i}
              src={BANNER}
              alt=""
              width={BANNER_W}
              height={BANNER_H}
              className="h-16 w-auto sm:h-20 md:h-24"
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
