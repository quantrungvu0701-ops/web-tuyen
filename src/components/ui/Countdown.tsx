"use client";

import { useEffect, useMemo, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function getTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

const UNITS: { key: keyof Omit<TimeLeft, "done">; label: string }[] = [
  { key: "days", label: "Ngày" },
  { key: "hours", label: "Giờ" },
  { key: "minutes", label: "Phút" },
  { key: "seconds", label: "Giây" },
];

type CountdownProps = {
  deadline: string;
  className?: string;
  size?: "md" | "lg";
};

/**
 * Renders a stable placeholder on first paint (server and client agree, so
 * no hydration mismatch) then starts ticking client-side after mount.
 */
export function Countdown({ deadline, className = "", size = "lg" }: CountdownProps) {
  const target = useMemo(() => new Date(deadline).getTime(), [deadline]);
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Static export is built once, so build-time and viewer-time values
    // will always differ — computing this on mount (not during render) is
    // what keeps the client's first paint matching the static server HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(getTimeLeft(target));
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const display = time ?? { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };
  const box =
    size === "lg"
      ? "min-w-[3.5rem] px-3 py-2.5 text-2xl sm:min-w-[4.5rem] sm:px-4 sm:py-3 sm:text-4xl"
      : "min-w-[2.75rem] px-2 py-2 text-lg";

  if (time?.done) {
    return (
      <p className={`font-semibold text-accent ${className}`} role="status">
        Đã hết hạn đăng ký
      </p>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 sm:gap-3 ${className}`}
      role="timer"
      aria-live="off"
      aria-label={
        time
          ? `Còn ${time.days} ngày ${time.hours} giờ ${time.minutes} phút đến hạn đăng ký`
          : "Đang tải thời gian còn lại"
      }
    >
      {UNITS.map((unit) => (
        <div key={unit.key} className="flex flex-col items-center gap-1.5">
          <div
            className={`flex items-center justify-center rounded-xl bg-foreground font-display font-semibold text-background shadow-[0_4px_16px_rgba(36,31,28,0.18)] tabular-nums ${box}`}
            aria-hidden="true"
          >
            {String(display[unit.key]).padStart(2, "0")}
          </div>
          <span
            className="text-[10px] font-semibold tracking-wider text-foreground/70 uppercase sm:text-[11px]"
            aria-hidden="true"
          >
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
