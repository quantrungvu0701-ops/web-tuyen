"use client";

import Decor from "@/components/v24/Decor";
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
 * The three MVs are on the Hội's YouTube; each doorway shows the thumbnail
 * and loads the player when clicked.
 */
const DOORWAYS = [
  {
    id: "gioi-thieu",
    label: "Tuyển Cộng tác viên thế hệ thứ 24",
    src: "https://youtu.be/e6MPU9EEANY",
    poster: "/hero-background.webp",
  },
  {
    id: "mv",
    label: "Tuyển Cộng tác viên thế hệ thứ 23",
    src: "https://youtu.be/siigK1Z18mo",
    poster: "/hero-background.webp",
  },
  {
    id: "hau-truong",
    label: "Tuyển Cộng tác viên thế hệ thứ 22",
    src: "https://youtu.be/VZ1iSv8gsts",
    poster: "/hero-background.webp",
  },
];

const TOKENS = {
  // A KV-pink train, pulling in across the page's one sky.
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
  // The progress dots, on the page's light sky.
  dotOn: "#E0115F",
  dotOff: "rgba(63, 10, 38, 0.2)",
  /** The B plate on the car body: the roundel's yellow, dimmed. */
  plate: "#E3C265",
  sticker: "#FFD84D",
} as const;

/** Cell widths as a fraction of the visible shell width. */
/** The page's content column (max-w-7xl less its padding): sizes the doorways. */
const CONTENT_W = 1216;
/** Extra car panels past each end, so a full-width car never shows its end. */
const END_PANELS = 2;
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

/** A YouTube link (watch, share, embed or shorts) to its video id. */
function youTubeId(url: string): string | null {
  const m =
    url.match(/youtu\.be\/([\w-]{6,})/) ??
    url.match(/[?&]v=([\w-]{6,})/) ??
    url.match(/youtube\.com\/(?:embed|shorts)\/([\w-]{6,})/);
  return m ? m[1] : null;
}

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

  // The car runs the full width of the screen, but its doorways keep the size
  // they have in the page's content column.
  const baseWidth = Math.min(shellWidth, CONTENT_W);
  const doorWidth = baseWidth * DOOR_RATIO;
  const bodyWidth = baseWidth * BODY_RATIO;
  const doorHeight = (doorWidth * 9) / 16;

  // Left edge of doorway i inside the strip: the extra end panels, then
  // body, door, body, door, …
  const doorLeft = (i: number) => bodyWidth * (i + 1 + END_PANELS) + doorWidth * i;
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
      id="mv" className="relative w-full overflow-hidden pb-10 pt-10 lg:pb-12 lg:pt-12"
    >
      <Decor src="/kv/cloud-1.webp" flip className="left-[6%] top-10 hidden w-56 lg:block" dur="28s" />
      <Decor src="/kv/cloud-6.webp" flip className="-left-14 bottom-2 hidden w-56 opacity-90 lg:block" dur="36s" />
      <div className="w-full">
        <Sticker className="mb-4 px-4 text-center text-[clamp(2.4rem,5vw,4.4rem)]">MV của Hội</Sticker>
        <p className="mb-10 px-4 text-center font-display text-xl text-pink-700 sm:text-2xl">
          {DOORWAYS[index].label}
        </p>

        <div
          className="relative overflow-hidden shadow-2xl"
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
              {Array.from({ length: END_PANELS }, (_, k) => (
                <CarBodySection key={`lead-${k}`} width={bodyWidth} number="HSV-008" />
              ))}
              {DOORWAYS.map((doorway, i) => (
                <Fragment key={doorway.id}>
                  <CarBodySection width={bodyWidth} number="HSV-008" />
                  <MetroDoorway
                    {...doorway}
                    width={doorWidth}
                    isActive={i === index}
                    isOpen={i === index && phase === "open"}
                    reduced={reduced}
                  />
                </Fragment>
              ))}
              {Array.from({ length: END_PANELS + 1 }, (_, k) => (
                <CarBodySection key={`tail-${k}`} width={bodyWidth} number="HSV-008" />
              ))}
            </div>

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
        <div className="mt-6 flex items-center justify-center gap-4">
        <ArrowButton side="left" enabled={canGoPrev} onClick={() => travelTo(index - 1)} />
        <ol className="flex items-center justify-center gap-2" aria-hidden="true">
          {DOORWAYS.map((d, i) => (
            <li
              key={d.id}
              className="h-2.5 w-2.5 rounded-full transition-colors"
              style={{
                backgroundColor:
                  i === index ? TOKENS.dotOn : TOKENS.dotOff,
              }}
            />
          ))}
        </ol>
        <ArrowButton side="right" enabled={canGoNext} onClick={() => travelTo(index + 1)} />
        </div>
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
      className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-white/85 text-xl text-pink-600 shadow-[var(--shadow-sm)] outline-none ring-1 ring-pink-200 transition-[background-color,opacity] hover:bg-white focus-visible:ring-2 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-35"
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
        style={{ backgroundColor: TOKENS.plate }}
      >
        B
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
  const yt = youTubeId(src);
  // A YouTube doorway shows its thumbnail and loads the player only when
  // asked: three embedded players at once would slow the whole page.
  const [playing, setPlaying] = useState(false);
  // Shutting the doors stops the player and puts the thumbnail back.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setPlaying(false);
  }

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
      {yt ? (
        playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${yt}?autoplay=1&rel=0&playsinline=1`}
            title={label}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            disabled={!isOpen}
            aria-label={`Xem video: ${label}`}
            className="group absolute inset-0 cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${yt}/maxresdefault.jpg`}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/92 text-[#E0115F] shadow-[0_10px_28px_-8px_rgba(0,0,0,0.6)] ring-4 ring-white/40 transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-1 size-9" fill="currentColor" aria-hidden="true">
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
              </svg>
            </span>
          </button>
        )
      ) : (
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
      )}

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
