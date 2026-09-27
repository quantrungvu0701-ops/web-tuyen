"use client";

import { useEffect, useState } from "react";
import { SevenSegmentNumber } from "@/components/ui/7-segment-number";
import { DEADLINE } from "@/lib/deadline";

const UNITS = [
  { key: "days", label: "NGÀY", color: "#19E08A", glow: "rgba(25, 224, 138, 0.60)" },
  { key: "hours", label: "GIỜ", color: "#F7C53D", glow: "rgba(247, 197, 61, 0.60)" },
  { key: "minutes", label: "PHÚT", color: "#FF4438", glow: "rgba(255, 68, 56, 0.60)" },
] as const;

/**
 * Unlit segments stay faintly visible rather than going fully black: a real
 * signal head shows its whole display under the lens, and letting the dark
 * segments read is most of what makes the lit ones look like hardware.
 */
const OFF_COLOR = "rgba(255, 255, 255, 0.055)";

function Panel({
  value,
  label,
  color,
  glow,
}: {
  value: string;
  label: string;
  color: string;
  glow: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* The housing: near-black box, a lit lip along the top edge and a deep
          inner shadow, so it sits on the artwork like a real signal head. */}
      <div
        className="flex items-center gap-2 rounded-[10px] px-3 py-3 sm:gap-2.5 sm:px-4 sm:py-4"
        style={{
          background:
            "linear-gradient(180deg, #23262B 0%, #101215 14%, #0B0C0E 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 22px rgba(0,0,0,0.85), 0 10px 26px -10px rgba(40,25,10,0.5)",
        }}
      >
        {value.split("").map((char, i) => (
          <div
            key={i}
            className="h-9 sm:h-12 lg:h-14"
            // The bloom belongs on the wrapper, not the segments: LEDs spill
            // light past their own edge, and a filter here catches the whole
            // digit at once rather than per-path.
            style={{ filter: `drop-shadow(0 0 7px ${glow})` }}
          >
            <SevenSegmentNumber
              value={Number(char)}
              onColor={color}
              offColor={OFF_COLOR}
              className="h-full w-auto"
            />
          </div>
        ))}
      </div>

      <span
        className="text-[10px] font-bold tracking-[0.18em] sm:text-xs"
        style={{ color: "#241F1C" }}
      >
        {label}
      </span>
    </div>
  );
}

function remaining(deadline: Date) {
  const ms = Math.max(0, deadline.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
  };
}

export default function CountdownTrafficLight() {
  // Starts null so the server and the first client render agree: the clock
  // cannot match across the two, and a mismatch would break hydration.
  const [left, setLeft] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    const tick = () => setLeft(remaining(DEADLINE));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /** Two digits, or more once the days run past 99. "88" while unresolved. */
  const shown = (key: (typeof UNITS)[number]["key"]) =>
    left === null ? "88" : String(left[key]).padStart(2, "0");

  return (
    <div
      className="flex items-end justify-center gap-3 sm:gap-5"
      role="timer"
      aria-label="Thời gian còn lại để nộp đơn"
      // Before the clock resolves the panels show 88 — every segment lit, the
      // way real hardware powers on — but it is not a real value, so it is
      // hidden until it means something.
      style={{ opacity: left === null ? 0.25 : 1, transition: "opacity 300ms ease" }}
    >
      {UNITS.map((unit) => (
        <Panel
          key={unit.key}
          value={shown(unit.key)}
          label={unit.label}
          color={unit.color}
          glow={unit.glow}
        />
      ))}
    </div>
  );
}
