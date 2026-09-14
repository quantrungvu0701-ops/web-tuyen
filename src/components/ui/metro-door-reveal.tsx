"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ tokens
 * Colours eyeballed from the Lisbon metro reference: blue door leaves, brushed
 * steel corrugated body, dark glass, red roundel, near-black underframe.
 *
 * TODO(video): real sources. `preview` is the muted loop that runs behind the
 * shut doors; point `full` at a heavier cut and it is only fetched once that
 * doorway locks open.
 * TODO(peek): peek opening guessed at 25% per leaf.
 */
const DOORWAYS = [
  {
    id: "gioi-thieu",
    label: "Video giới thiệu",
    preview:
      "https://raw.githubusercontent.com/gughigug/run-hero-assets/main/Legs_sprinting_on_pavement_1080p_202608312152.mp4",
    full: "https://raw.githubusercontent.com/gughigug/run-hero-assets/main/Legs_sprinting_on_pavement_1080p_202608312152.mp4",
    poster: "/hero-background.webp",
  },
  {
    id: "mv",
    label: "MV",
    preview:
      "https://raw.githubusercontent.com/gughigug/run-hero-assets/main/Legs_sprinting_on_pavement_1080p_202608312152.mp4",
    full: "https://raw.githubusercontent.com/gughigug/run-hero-assets/main/Legs_sprinting_on_pavement_1080p_202608312152.mp4",
    poster: "/hero-background.webp",
  },
];

const TOKENS = {
  platform: "#1E2226",
  steel: "#C4C9CC",
  steelDark: "#A3A9AD",
  steelLight: "#DDE1E3",
  doorBlue: "#1F63A6",
  doorBlueLight: "#2C78BF",
  doorBlueDark: "#174C80",
  glass: "#243038",
  rubber: "#0F1113",
  underframe: "#171A1D",
  roundel: "#D3202A",
  sticker: "#F0B429",
  peekPercent: 25,
  openPercent: 100,
  peekMs: 400,
  lockMs: 500,
  reducedMs: 180,
} as const;

/** Horizontal ribbing that runs across the car's steel panels. */
const CORRUGATION =
  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.20) 0px, rgba(255,255,255,0.20) 1px, rgba(0,0,0,0.045) 2px, rgba(0,0,0,0.045) 7px)";

type DoorState = "closed" | "peek" | "locked";

export default function MetroDoorReveal() {
  return (
    <section
      className="w-full px-4 py-20 md:px-8"
      style={{ backgroundColor: TOKENS.platform }}
    >
      {/* Wider shell + 16:9 openings, so the car reads long and low and a
          landscape video sits in the doorway without being cropped to a slot. */}
      <div className="mx-auto w-full max-w-7xl">
        <div
          className="overflow-hidden rounded-sm shadow-2xl"
          style={{ backgroundColor: TOKENS.steel }}
        >
          {/* Roof line */}
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

          <div className="flex items-stretch">
            {DOORWAYS.map((doorway, i) => (
              <Fragment key={doorway.id}>
                {i > 0 && <CarBodySection />}
                <MetroDoorway {...doorway} />
              </Fragment>
            ))}
          </div>

          {/* Sill + underframe */}
          <div
            className="h-3"
            style={{ backgroundColor: TOKENS.steelDark }}
          />
          <div
            className="relative h-10"
            style={{ backgroundColor: TOKENS.underframe }}
          >
            <div className="absolute left-[12%] top-2 h-6 w-24 rounded-sm bg-black/50" />
            <div className="absolute right-[14%] top-2 h-6 w-16 rounded-sm bg-black/50" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** The panel between the two doorways: passenger window, roundel, car number. */
function CarBodySection() {
  return (
    <div
      aria-hidden="true"
      className="relative w-[22%] shrink-0"
      style={{
        background: `linear-gradient(to bottom, ${TOKENS.steelLight} 0%, ${TOKENS.steel} 40%, ${TOKENS.steelDark} 100%)`,
        backgroundImage: CORRUGATION,
      }}
    >
      {/* Passenger window */}
      <div
        className="absolute inset-x-[8%] top-[10%] h-[42%] rounded-md"
        style={{
          background: `linear-gradient(165deg, ${TOKENS.glass} 0%, #3D4B55 50%, ${TOKENS.glass} 100%)`,
          boxShadow:
            "inset 0 0 0 3px rgba(0,0,0,0.45), inset 0 8px 14px rgba(255,255,255,0.10)",
        }}
      />
      {/* Red roundel */}
      <div
        className="absolute left-1/2 top-[60%] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-[3px] text-sm font-black text-white"
        style={{ backgroundColor: TOKENS.roundel }}
      >
        M
      </div>
      <span className="absolute left-[8%] top-[56%] text-[10px] font-semibold tracking-wide text-black/45">
        R-383
      </span>
    </div>
  );
}

function MetroDoorway({
  label,
  preview,
  full,
  poster,
}: {
  id: string;
  label: string;
  preview: string;
  full: string;
  poster: string;
}) {
  const [doorState, setDoorState] = useState<DoorState>("closed");
  const [canHover, setCanHover] = useState(false);
  const [reduced, setReduced] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastPointerType = useRef<string>("");

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setCanHover(hoverQuery.matches);
      setReduced(motionQuery.matches);
    };
    sync();
    hoverQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);
    return () => {
      hoverQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  const openLocked = useCallback(() => {
    const video = videoRef.current;
    setDoorState("locked");
    if (!video) return;
    if (full !== preview && video.src !== full) video.src = full;
    video.loop = false;
    video.muted = false;
    video.controls = true;
    video.currentTime = 0;
    video.play().catch(() => {});
  }, [full, preview]);

  const close = useCallback(() => {
    const video = videoRef.current;
    setDoorState("closed");
    if (!video) return;
    video.pause();
    video.controls = false;
    video.muted = true;
    video.loop = true;
  }, []);

  const handleEnter = () => {
    if (!canHover || lastPointerType.current === "touch") return;
    if (doorState === "closed") {
      setDoorState("peek");
      videoRef.current?.play().catch(() => {});
    }
  };

  const handleLeave = () => {
    if (doorState !== "peek") return;
    setDoorState("closed");
    videoRef.current?.pause();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      if (doorState === "locked") close();
      else openLocked();
    } else if (e.key === "Escape" && doorState === "locked") {
      close();
    }
  };

  const offset =
    doorState === "locked"
      ? TOKENS.openPercent
      : doorState === "peek"
        ? TOKENS.peekPercent
        : 0;
  const durationMs = reduced
    ? TOKENS.reducedMs
    : doorState === "peek"
      ? TOKENS.peekMs
      : TOKENS.lockMs;

  const panelStyle = (side: "left" | "right"): React.CSSProperties => ({
    transform: reduced
      ? undefined
      : `translateX(${side === "left" ? -offset : offset}%)`,
    opacity: reduced ? (doorState === "closed" ? 1 : 0) : 1,
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
      className="relative aspect-[16/9] flex-1 overflow-hidden bg-black"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onPointerDown={(e) => {
        lastPointerType.current = e.pointerType;
      }}
    >
      <video
        ref={videoRef}
        src={preview}
        poster={poster}
        muted
        loop
        playsInline
        preload="auto"
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
            {/* Yellow pictogram sticker in the glass */}
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

      {doorState !== "locked" && (
        <button
          type="button"
          aria-label={`Mở cửa để xem ${label}`}
          aria-expanded={false}
          onClick={() => openLocked()}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 z-10 cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-white/70"
        />
      )}

      {doorState === "locked" && (
        <button
          type="button"
          aria-label={`Đóng ${label}`}
          aria-expanded
          onClick={close}
          onKeyDown={handleKeyDown}
          className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg leading-none text-white outline-none backdrop-blur transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white"
        >
          ✕
        </button>
      )}
    </div>
  );
}
