"use client";

import React, { useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------- design tokens
 * TODO(pink): exact pastel pink for the section background. Placeholder value —
 * confirm against the rest of the palette.
 * TODO(beam): beam colour + opacity. These need a contrast check against the
 * pink once the real copy is in: a pale beam over pale pink can wash out, and
 * the yellow beam is the riskiest of the three.
 */
const TOKENS = {
  sectionBg: "#FCE4EC",
  housingBg: "#2A2A2E",
  housingBorder: "#17171A",
  bulbOff: "#3A3A40",
  bulbSize: 150,
  beamHeight: 150,
  beamTopWidth: 74,
  beamBottomWidth: 210,
  beamOpacity: 0.42,
  glowSpread: 38,
  durationMs: 260,
  staggerMs: 100,
  leaveDelayMs: 100,
} as const;

type LightId = "red" | "yellow" | "green";

/** TODO(copy): real department names + descriptions, in bulb order. */
const DEPARTMENTS: {
  id: LightId;
  name: string;
  description: string;
  on: string;
  glow: string;
}[] = [
  {
    id: "red",
    name: "Department A",
    description:
      "Placeholder — mô tả ngắn về ban này sẽ được thay thế khi có nội dung thật.",
    on: "#F0463C",
    glow: "rgba(240, 70, 60, 0.75)",
  },
  {
    id: "yellow",
    name: "Department B",
    description:
      "Placeholder — mô tả ngắn về ban này sẽ được thay thế khi có nội dung thật.",
    on: "#F5C542",
    glow: "rgba(245, 197, 66, 0.75)",
  },
  {
    id: "green",
    name: "Department C",
    description:
      "Placeholder — mô tả ngắn về ban này sẽ được thay thế khi có nội dung thật.",
    on: "#49C46B",
    glow: "rgba(73, 196, 107, 0.75)",
  },
];

export default function RecruitmentTrafficLight() {
  const [activeLight, setActiveLight] = useState<LightId | null>(null);
  const [reduced, setReduced] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const cancelLeave = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const activate = (id: LightId) => {
    cancelLeave();
    setActiveLight(id);
  };

  /** Delayed so moving between adjacent bulbs doesn't flicker off and on. */
  const scheduleDeactivate = () => {
    cancelLeave();
    leaveTimer.current = setTimeout(
      () => setActiveLight(null),
      TOKENS.leaveDelayMs,
    );
  };

  const toggle = (id: LightId) => {
    cancelLeave();
    setActiveLight((current) => (current === id ? null : id));
  };

  /**
   * A click fires focus first, so without routing by input type the focus
   * handler would switch a bulb on and the click would immediately toggle it
   * back off — making the first tap a no-op on touch, where there is no hover.
   * Mouse is governed by hover, keyboard by focus, and only touch toggles.
   */
  const lastPointerType = useRef<string>("");

  const handlePointerDown = (e: React.PointerEvent) => {
    lastPointerType.current = e.pointerType;
  };

  const handleClick = (id: LightId) => {
    if (lastPointerType.current === "touch") toggle(id);
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>, id: LightId) => {
    // Only keyboard focus should light a bulb; pointer focus is handled above.
    if (e.currentTarget.matches(":focus-visible")) activate(id);
  };

  const duration = reduced ? 140 : TOKENS.durationMs;
  const stagger = reduced ? 0 : TOKENS.staggerMs;

  return (
    <section
      id="tuyen"
      className="w-full px-6 py-24 md:px-10"
      style={{ backgroundColor: TOKENS.sectionBg }}
    >
      <div className="mx-auto grid max-w-2xl grid-cols-3 gap-x-6">
        {/* The housing is a background layer behind the bulb row rather than a
            grid of its own. A nested grid with its own padding produced
            narrower columns than the beams/descriptions below, so the bulbs
            never lined up. Now every row shares the one outer grid, and the
            housing is inset outwards to fake its padding. */}
        <div className="relative col-span-3 mb-2 mt-2">
          <div
            aria-hidden="true"
            className="absolute -inset-x-8 -inset-y-7 rounded-[3rem] border-4"
            style={{
              backgroundColor: TOKENS.housingBg,
              borderColor: TOKENS.housingBorder,
            }}
          />
          <div className="relative grid grid-cols-3 gap-x-6">
          {DEPARTMENTS.map((dept) => {
            const isActive = activeLight === dept.id;
            return (
              <div key={dept.id} className="flex justify-center">
                <button
                  type="button"
                  id={`bulb-${dept.id}`}
                  aria-expanded={isActive}
                  aria-controls={`panel-${dept.id}`}
                  aria-label={`${dept.name} — click to view details`}
                  onMouseEnter={() => activate(dept.id)}
                  onMouseLeave={scheduleDeactivate}
                  onFocus={(e) => handleFocus(e, dept.id)}
                  onBlur={scheduleDeactivate}
                  onPointerDown={handlePointerDown}
                  onClick={() => handleClick(dept.id)}
                  className="relative aspect-square w-full rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-white/70"
                  style={{
                    maxWidth: TOKENS.bulbSize,
                    backgroundColor: TOKENS.bulbOff,
                    boxShadow: isActive
                      ? `0 0 ${TOKENS.glowSpread}px ${TOKENS.glowSpread / 2}px ${dept.glow}`
                      : `0 0 0px 0px rgba(0,0,0,0)`,
                    transition: `box-shadow ${duration}ms ease`,
                    // Bulb is the last thing to go dark on the way out.
                    transitionDelay: isActive ? "0ms" : `${stagger * 2}ms`,
                  }}
                >
                  {/* Colour layer: only opacity animates, never a filter or
                      background-color tween. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: dept.on,
                      opacity: isActive ? 1 : 0,
                      transition: `opacity ${duration}ms ease`,
                      transitionDelay: isActive ? "0ms" : `${stagger * 2}ms`,
                    }}
                  />
                </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Beams */}
        {DEPARTMENTS.map((dept) => {
          const isActive = activeLight === dept.id;
          return (
            <div
              key={`beam-${dept.id}`}
              aria-hidden="true"
              className="flex justify-center"
              style={{ height: TOKENS.beamHeight }}
            >
              <div
                style={{
                  width: TOKENS.beamBottomWidth,
                  height: "100%",
                  background: `linear-gradient(to bottom, ${dept.glow}, transparent)`,
                  opacity: isActive ? TOKENS.beamOpacity : 0,
                  // Trapezoid: narrow at the bulb, flaring out toward the copy.
                  clipPath: `polygon(
                    ${(TOKENS.beamBottomWidth - TOKENS.beamTopWidth) / 2}px 0,
                    ${(TOKENS.beamBottomWidth + TOKENS.beamTopWidth) / 2}px 0,
                    100% 100%, 0 100%)`,
                  // scaleY instead of height keeps this off the layout path.
                  transform: reduced
                    ? "none"
                    : `scaleY(${isActive ? 1 : 0})`,
                  transformOrigin: "top center",
                  transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
                  transitionDelay: isActive ? "0ms" : `${stagger}ms`,
                }}
              />
            </div>
          );
        })}

        {/* Descriptions */}
        {DEPARTMENTS.map((dept) => {
          const isActive = activeLight === dept.id;
          return (
            <div
              key={`panel-${dept.id}`}
              id={`panel-${dept.id}`}
              role="region"
              aria-hidden={!isActive}
              aria-labelledby={`bulb-${dept.id}`}
              className="min-h-[128px] text-center"
              style={{
                opacity: isActive ? 1 : 0,
                transform:
                  reduced || isActive ? "translateY(0)" : "translateY(8px)",
                transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
                // In: after the beam. Out: first, before beam and bulb.
                transitionDelay: isActive ? `${stagger}ms` : "0ms",
              }}
            >
              <h3 className="mb-2 text-lg font-bold tracking-tight text-[#241F1C]">
                {dept.name}
              </h3>
              <p className="text-sm leading-relaxed text-[#5c4a4f]">
                {dept.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
