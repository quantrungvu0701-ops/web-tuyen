"use client";

import { Sticker } from "@/components/v24/ui";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ tokens
 * Colours eyeballed from the Lisbon metro reference: blue door leaves, brushed
 * steel corrugated body, dark glass, red roundel, near-black underframe.
 *
 * One doorway is centred at a time. The arrows drive the train along: the doors
 * shut, the car slides to bring the next doorway to the middle, and that
 * doorway's doors open on their own once it has arrived.
 *
 * TODO(video): real sources. All three currently point at the same external
 * placeholder clip — this MUST be replaced before the site ships.
 */
const DOORWAYS = [
  {
    id: "gioi-thieu",
    label: "Video giới thiệu",
    src: "https://raw.githubusercontent.com/gughigug/run-hero-assets/main/Legs_sprinting_on_pavement_1080p_202608312152.mp4",
    poster: "/hero-background.webp",
  },
  {
    id: "mv",
    label: "MV",
    src: "https://raw.githubusercontent.com/gughigug/run-hero-assets/main/Legs_sprinting_on_pavement_1080p_202608312152.mp4",
    poster: "/hero-background.webp",
  },
  {
    id: "hau-truong",
    label: "Hậu trường",
    src: "https://raw.githubusercontent.com/gughigug/run-hero-assets/main/Legs_sprinting_on_pavement_1080p_202608312152.mp4",
    poster: "/hero-background.webp",
  },
];

const TOKENS = {
  // Thế hệ 24: the one deep section on the page — a plum platform, so the
  // videos read like a screen in a dark room, and a KV-pink train on it.
  platform: "#3F0A26",
  steel: "#FFB8C6",
  steelDark: "#F08AA5",
  steelLight: "#FFD9DF",
  doorBlue: "#FF2E7B",
  doorBlueLight: "#FF5A95",
  doorBlueDark: "#E0115F",
  glass: "#243038",
  rubber: "#0F1113",
  underframe: "#171A1D",
  roundel: "#FFE98A",
  sticker: "#FFD84D",
} as const;

/** Cell widths as a fraction of the visible shell width. */
const DOOR_RATIO = 0.62;
const BODY_RATIO = 0.3;

const TIMING = {
  closeMs: 450,
  slideMs: 900,
  openMs: 550,
  reducedMs: 120,
} as const;

/** Horizontal ribbing that runs across the car's steel panels. */
const CORRUGATION =
  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.20) 0px, rgba(255,255,255,0.20) 1px, rgba(0,0,0,0.045) 2px, rgba(0,0,0,0.045) 7px)";

type Phase = "open" | "closing" | "sliding";

export default function MetroDoorReveal() {
  const [index, setIndex] = useState(0);
  // Starts shut: the first doorway should perform its opening animation when
  // you scroll down to it, not be found already standing open.
  const [phase, setPhase] = useState<Phase>("sliding");
  const [reduced, setReduced] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [shellWidth, setShellWidth] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  // Opens the first doorway the moment the carriage reaches the screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setPhase((current) => (current === "sliding" ? "open" : current));
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The strip is positioned in pixels off the measured shell, so the centred
  // doorway stays centred at every breakpoint without a media query.
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const sync = () => setShellWidth(el.clientWidth);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const doorWidth = shellWidth * DOOR_RATIO;
  const bodyWidth = shellWidth * BODY_RATIO;
  const doorHeight = (doorWidth * 9) / 16;

  // Left edge of doorway i inside the strip: body, door, body, door, …
  const doorLeft = (i: number) => bodyWidth * (i + 1) + doorWidth * i;
  const offset = shellWidth / 2 - (doorLeft(index) + doorWidth / 2);

  const travelTo = useCallback(
    (next: number) => {
      if (phase !== "open") return; // ignored mid-journey, never queued
      if (next < 0 || next >= DOORWAYS.length) return;

      timers.current.forEach(clearTimeout);
      timers.current = [];

      if (reduced) {
        setIndex(next);
        return;
      }

      // Shut the doors, roll, then let the arriving doorway open itself.
      setPhase("closing");
      timers.current.push(
        setTimeout(() => {
          setIndex(next);
          setPhase("sliding");
        }, TIMING.closeMs),
      );
      timers.current.push(
        setTimeout(() => setPhase("open"), TIMING.closeMs + TIMING.slideMs),
      );
    },
    [phase, reduced],
  );

  const canGoPrev = index > 0 && phase === "open";
  const canGoNext = index < DOORWAYS.length - 1 && phase === "open";

  return (
    <section
      ref={sectionRef}
      id="mv" className="w-full px-4 py-28 md:px-8 lg:py-36"
      style={{ backgroundColor: TOKENS.platform }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <Sticker className="mb-4 text-center text-[clamp(2.4rem,5vw,4.4rem)]">MV của Hội</Sticker>
        <p className="mb-10 text-center font-display text-xl text-pink-200 sm:text-2xl">
          {DOORWAYS[index].label}
        </p>

        <div
          className="relative overflow-hidden rounded-sm shadow-2xl"
          style={{ backgroundColor: TOKENS.steel }}
        >
          {/* Roof line — fixed, the car slides underneath it */}
          <div
            className="h-2"
            style={{ backgroundColor: TOKENS.underframe, opacity: 0.75 }}
          />
          <div
            className="h-7"
            style={{
              background: `linear-gradient(to bottom, ${TOKENS.steelLight}, ${TOKENS.steel})`,
              backgroundImage: CORRUGATION,
            }}
          />

          {/* Travelling strip */}
          <div
            ref={shellRef}
            className="relative overflow-hidden"
            style={{ height: doorHeight || undefined }}
          >
            <div
              className="absolute inset-y-0 left-0 flex items-stretch will-change-transform"
              style={{
                transform: `translateX(${offset}px)`,
                transition: reduced
                  ? "none"
                  : `transform ${TIMING.slideMs}ms cubic-bezier(0.65, 0, 0.35, 1)`,
              }}
            >
              {DOORWAYS.map((doorway, i) => (
                <Fragment key={doorway.id}>
                  <CarBodySection width={bodyWidth} number={`R-38${i + 1}`} />
                  <MetroDoorway
                    {...doorway}
                    width={doorWidth}
                    isActive={i === index}
                    isOpen={i === index && phase === "open"}
                    reduced={reduced}
                  />
                </Fragment>
              ))}
              <CarBodySection width={bodyWidth} number="R-384" />
            </div>

            <ArrowButton
              side="left"
              enabled={canGoPrev}
              onClick={() => travelTo(index - 1)}
            />
            <ArrowButton
              side="right"
              enabled={canGoNext}
              onClick={() => travelTo(index + 1)}
            />
          </div>

          {/* Sill + underframe */}
          <div className="h-3" style={{ backgroundColor: TOKENS.steelDark }} />
          <div
            className="relative h-10"
            style={{ backgroundColor: TOKENS.underframe }}
          >
            <div className="absolute left-[12%] top-2 h-6 w-24 rounded-sm bg-black/50" />
            <div className="absolute right-[14%] top-2 h-6 w-16 rounded-sm bg-black/50" />
          </div>
        </div>

        {/* Which carriage you're looking at — title now sits above the video,
            so this is just the 3 dots. */}
        <ol className="mt-6 flex items-center justify-center gap-2" aria-hidden="true">
          {DOORWAYS.map((d, i) => (
            <li
              key={d.id}
              className="h-2.5 w-2.5 rounded-full transition-colors"
              style={{
                backgroundColor:
                  i === index ? TOKENS.roundel : "rgba(255, 255, 255, 0.35)",
              }}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function ArrowButton({
  side,
  enabled,
  onClick,
}: {
  side: "left" | "right";
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      aria-label={side === "left" ? "Toa trước" : "Toa tiếp theo"}
      className={`absolute top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-xl text-white outline-none backdrop-blur transition-opacity hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-25 ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      <span aria-hidden="true">{side === "left" ? "←" : "→"}</span>
    </button>
  );
}

/** The panel between doorways: passenger window, roundel, car number. */
function CarBodySection({
  width,
  number,
}: {
  width: number;
  number: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="relative shrink-0"
      style={{
        width: width || undefined,
        background: `linear-gradient(to bottom, ${TOKENS.steelLight} 0%, ${TOKENS.steel} 40%, ${TOKENS.steelDark} 100%)`,
        backgroundImage: CORRUGATION,
      }}
    >
      <div
        className="absolute inset-x-[8%] top-[10%] h-[42%] rounded-md"
        style={{
          background: `linear-gradient(165deg, ${TOKENS.glass} 0%, #3D4B55 50%, ${TOKENS.glass} 100%)`,
          boxShadow:
            "inset 0 0 0 3px rgba(0,0,0,0.45), inset 0 8px 14px rgba(255,255,255,0.10)",
        }}
      />
      <div
        className="absolute left-1/2 top-[60%] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-[3px] text-sm font-black text-white"
        style={{ backgroundColor: TOKENS.roundel }}
      >
        M
      </div>
      <span className="absolute left-[8%] top-[56%] text-[10px] font-semibold tracking-wide text-black/45">
        {number}
      </span>
    </div>
  );
}

function MetroDoorway({
  label,
  src,
  poster,
  width,
  isActive,
  isOpen,
  reduced,
}: {
  id: string;
  label: string;
  src: string;
  poster: string;
  width: number;
  isActive: boolean;
  isOpen: boolean;
  reduced: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Only the doorway standing open plays; the rest stay parked so three
  // videos are never decoding at once.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isOpen) video.play().catch(() => {});
    else video.pause();
  }, [isOpen]);

  const durationMs = reduced
    ? TIMING.reducedMs
    : isOpen
      ? TIMING.openMs
      : TIMING.closeMs;

  const panelStyle = (side: "left" | "right"): React.CSSProperties => ({
    transform: reduced
      ? undefined
      : `translateX(${side === "left" ? -(isOpen ? 100 : 0) : isOpen ? 100 : 0}%)`,
    opacity: reduced ? (isOpen ? 0 : 1) : 1,
    transition: reduced
      ? `opacity ${durationMs}ms ease-out`
      : `transform ${durationMs}ms ease-out`,
    background: `linear-gradient(to bottom, ${TOKENS.doorBlueLight} 0%, ${TOKENS.doorBlue} 45%, ${TOKENS.doorBlueDark} 100%)`,
    boxShadow:
      side === "left"
        ? `inset -1px 0 0 rgba(255,255,255,0.28), 14px 0 26px rgba(0,0,0,0.55)`
        : `inset 1px 0 0 rgba(255,255,255,0.28), -14px 0 26px rgba(0,0,0,0.55)`,
  });

  return (
    <div
      className="relative shrink-0 overflow-hidden bg-black"
      style={{ width: width || undefined }}
      // Doorways waiting down the line are decoration, not content.
      aria-hidden={!isActive}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        controls={isOpen}
        preload={isActive ? "auto" : "none"}
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          aria-hidden="true"
          className={`absolute inset-y-0 ${side === "left" ? "left-0" : "right-0"} w-1/2 will-change-transform`}
          style={panelStyle(side)}
        >
          {/* Tall rounded window, as on the blue leaves in the reference */}
          <div
            className="absolute inset-x-[22%] top-[12%] h-[62%] rounded-[14px]"
            style={{
              background: `linear-gradient(165deg, ${TOKENS.glass} 0%, #41505B 48%, ${TOKENS.glass} 100%)`,
              boxShadow:
                "inset 0 0 0 3px rgba(0,0,0,0.5), inset 0 8px 14px rgba(255,255,255,0.12)",
            }}
          >
            <div
              className="absolute left-1/2 top-[8%] h-4 w-4 -translate-x-1/2 rounded-[2px]"
              style={{ backgroundColor: TOKENS.sticker }}
            />
          </div>
          {/* Rubber leading edge at the seam */}
          <div
            className={`absolute inset-y-0 ${side === "left" ? "right-0" : "left-0"} w-[5px]`}
            style={{ backgroundColor: TOKENS.rubber }}
          />
        </div>
      ))}
    </div>
  );
}
