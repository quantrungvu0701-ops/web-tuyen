"use client";

import { useEffect, useState } from "react";
import { DEADLINE } from "@/lib/deadline";

const UNITS = [
  { key: "d", label: "Ngày", ms: 86_400_000 },
  { key: "h", label: "Giờ", ms: 3_600_000 },
  { key: "m", label: "Phút", ms: 60_000 },
  { key: "s", label: "Giây", ms: 1_000 },
] as const;

function split(left: number) {
  const out: Record<string, number> = {};
  let rest = Math.max(0, left);
  for (const u of UNITS) {
    out[u.key] = Math.floor(rest / u.ms);
    rest -= out[u.key] * u.ms;
  }
  return out;
}

/**
 * Time left until the form closes. Renders dashes on the server and on the
 * first client paint, then ticks — the server has no clock worth trusting,
 * and a hydration mismatch here would flash the wrong number.
 *
 * Digits are PS Bolden: Latin-only strings are the one place that face is safe.
 */
export default function Countdown({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const left = now === null ? null : DEADLINE.getTime() - now;

  if (left !== null && left <= 0) {
    return (
      <p className={`font-display text-xl text-plum-900 ${className}`}>
        Đơn đã đóng — hẹn gặp em ở các vòng tiếp theo!
      </p>
    );
  }

  const parts = left === null ? null : split(left);

  return (
    <div
      className={`inline-flex items-stretch gap-1.5 rounded-[26px] bg-white/80 p-1.5 shadow-[var(--shadow-md)] ring-1 ring-white backdrop-blur-sm ${className}`}
      role="timer"
      aria-label="Thời gian còn lại để nộp đơn"
    >
      {UNITS.map((u, i) => (
        <div
          key={u.key}
          className={`flex min-w-[4.4rem] flex-col items-center justify-center rounded-[20px] px-3 pb-2 pt-2.5 sm:min-w-[5.2rem] ${
            i === 0 ? "bg-pink-600 text-white" : "bg-blush text-pink-600"
          }`}
        >
          <span className="font-sign text-[2.1rem] leading-none tabular-nums sm:text-[2.6rem]">
            {parts ? String(parts[u.key]).padStart(2, "0") : "--"}
          </span>
          <span
            className={`mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${
              i === 0 ? "text-white/85" : "text-plum-500"
            }`}
          >
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
