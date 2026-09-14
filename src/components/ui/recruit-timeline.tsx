"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* -------------------------------------------------------------- design tokens
 * TODO(copy): real dates for each step.
 * TODO(pink): shares the traffic-light section's pink so the two read as one
 * block — change both together.
 */
const TOKENS = {
  sectionBg: "#FCE4EC",
  accent: "#E80808",
  line: "rgba(40, 30, 30, 0.18)",
  mascotSize: 92,
} as const;

/**
 * Zigzag: the odd points sit low, the even points sit high. The high points
 * used to sit at 28%, which left the mascot (92px tall, parked 26px above the
 * point) with a negative top offset — it was clipped by the track. Track is
 * taller and the peaks are lower so the mascot always fits above.
 */
const TRACK_HEIGHT = 340;
const POINT_X = [10, 30, 50, 70, 90];
const POINT_Y = [66, 40, 66, 40, 66];

const STEPS = [
  { name: "Vòng đơn", duration: "[TODO: ngày – ngày]" },
  { name: "Vòng phỏng vấn định hướng", duration: "[TODO: ngày – ngày]" },
  { name: "Vòng teamwork", duration: "[TODO: ngày – ngày]" },
  { name: "Vòng phỏng vấn cá nhân", duration: "[TODO: ngày – ngày]" },
  { name: "Vòng hội nhập", duration: "[TODO: ngày – ngày]" },
];

export default function RecruitTimeline() {
  // Starts at step 1 rather than "nothing hovered yet", so the mascot always
  // has a post inside the timeline to stand at.
  const [activeStep, setActiveStep] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const shouldReduceMotion = useReducedMotion();

  // Measure the track so the mascot can be moved with transforms (x/y) rather
  // than animating left/top, which would hit layout every frame.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const sync = () =>
      setBox({ width: el.clientWidth, height: el.clientHeight });
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mascotX =
    (POINT_X[activeStep] / 100) * box.width - TOKENS.mascotSize / 2;
  const mascotY =
    (POINT_Y[activeStep] / 100) * box.height - TOKENS.mascotSize - 26;

  return (
    <section
      className="w-full px-6 pb-24 md:px-10"
      style={{ backgroundColor: TOKENS.sectionBg }}
    >
      <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-[#241F1C] sm:text-4xl">
        Hành trình ứng tuyển
      </h2>
      <p className="mb-10 text-center text-sm text-[#5c4a4f]">
        Di chuột hoặc chạm vào từng mốc để xem chi tiết.
      </p>

      <div className="w-full overflow-x-auto pb-2">
        <div
          ref={trackRef}
          className="relative mx-auto min-w-[44rem] max-w-5xl px-5 sm:px-6 lg:px-8"
            style={{ height: TRACK_HEIGHT }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
          >
            <polyline
              points={POINT_X.map((x, i) => `${x},${POINT_Y[i]}`).join(" ")}
              fill="none"
              stroke={TOKENS.line}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Mascot rides the track on transforms only. */}
          {box.width > 0 && (
            <motion.img
              src="/loading-bi.png"
              alt=""
              aria-hidden="true"
              width={TOKENS.mascotSize}
              height={TOKENS.mascotSize}
              className="pointer-events-none absolute left-0 top-0 select-none"
              style={{ width: TOKENS.mascotSize, height: "auto" }}
              initial={false}
              animate={{ x: mascotX, y: mascotY }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 260, damping: 26 }
              }
            />
          )}

          {STEPS.map((step, i) => {
            const isStepActive = activeStep === i;

            return (
              <div
                key={step.name}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${POINT_X[i]}%`, top: `${POINT_Y[i]}%` }}
              >
                <button
                  type="button"
                  aria-expanded={isStepActive}
                  aria-label={`Bước ${i + 1}: ${step.name}`}
                  // No mouse-leave/blur reset: the mascot stays parked at
                  // whichever step was last hovered, clicked or focused
                  // instead of hopping back to step 1 when the pointer leaves.
                  onMouseEnter={() => setActiveStep(i)}
                  onFocus={() => setActiveStep(i)}
                  onClick={() => setActiveStep(i)}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 bg-white text-sm font-bold transition-colors duration-200"
                  style={{
                    borderColor: TOKENS.accent,
                    color: isStepActive ? "#ffffff" : TOKENS.accent,
                    backgroundColor: isStepActive ? TOKENS.accent : "#ffffff",
                  }}
                >
                  {i + 1}
                </button>

                {/* Always below the circle: the mascot owns the space above
                    every point, so a label up there would collide with it. */}
                <div
                  className="absolute left-1/2 top-full mt-3 flex w-40 -translate-x-1/2 flex-col items-center gap-1 rounded-lg px-2 py-1 text-center"
                  style={{ backgroundColor: TOKENS.sectionBg }}
                >
                  <span className="text-sm font-semibold text-[#241F1C]">
                    {step.name}
                  </span>
                  <motion.span
                    className="text-xs text-[#5c4a4f]"
                    initial={false}
                    animate={{ opacity: isStepActive ? 1 : 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                  >
                    {step.duration}
                  </motion.span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
