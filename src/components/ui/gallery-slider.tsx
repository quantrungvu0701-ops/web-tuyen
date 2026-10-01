"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { AnimatePresence, motion } from "framer-motion";

/* ------------------------------------------------------------------ types */

export type GallerySlide = {
  /** Sub-events, opened from a "Xem thêm" link after the description. */
  more?: { name: string; body: string }[];
  id: string;
  title: string;
  description: string;
  /** The event's photos, looped in order (any number; placeholders use IMAGES_PER_SLIDE). */
  images: string[];
};

/**
 * Photos per event. Exported so the data that feeds this component is built
 * from the same number the strip loops on.
 */
export const IMAGES_PER_SLIDE = 3;

/** Dispatch on a gallery's root to open it back on its first event. */
export const GALLERY_RESET = "gallery-reset";

/* ----------------------------------------------------------------- tokens */
const TOKENS = {
  title: "#3F0A26",
  body: "#8A3A5E",
  dotIdle: "#FFB8C6",
  dotActive: "#E0115F",
  dotTrack: "#FFD9DF",
} as const;

/**
 * One photo's turn: it sits still, then glides to the next. The strip loops
 * the current event's photos forever; the event itself only changes when the
 * reader asks (the arrows or the dots).
 */
const PHOTO_HOLD_MS = 900;
const PHOTO_MOVE_MS = 600;
const PHOTO_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

/** How long each event shows before the gallery moves on by itself. */
const AUTO_MS = 5000;

const TIMING = {
  /** The copy crossfade when the event changes, in step with the photos'. */
  copyMorphS: 0.7,
} as const;

const GEO = {
  /** The gap between two photos, and the least the box can show beside one. */
  gap: 16,
  imageRadius: 12,
  /** Outside `fill`, the photo's own size ceiling. */
  maxImageWidth: 736,
  maxImageHeight: 256,
  /** In `fill` mode, how much of each neighbouring photo shows at least. */
  fillPeek: 88,
} as const;

/**
 * One glass material for the box, the dots pill and the arrow buttons. The
 * box is NOT clipped: the controls hang below it on `top-full`. `pt-4` is
 * GEO.gap; keep them in step.
 */
const GLASS_CLASS =
  "bg-[#FFFBF6] ring-1 ring-[#FFD9DF] shadow-[0_30px_60px_-28px_rgba(63,10,38,0.42)]";

const BOX_CLASS = `relative w-full rounded-[28px] pt-4 ${GLASS_CLASS}`;

/* ------------------------------------------------------------ photo tile */

function PhotoTile({ src, width, height }: { src: string; width: number; height?: number }) {
  return (
    <div
      className={`shrink-0 overflow-hidden bg-black/10 ${height ? "" : "h-full"}`}
      style={{ width, height, borderRadius: GEO.imageRadius }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} className="h-full w-full select-none object-cover" />
    </div>
  );
}

/**
 * The photo is centred in the window; photos sit a `gap` apart, and whatever
 * the box has spare becomes margin either side, where the neighbours show.
 */
function useTrackGeometry(fill: boolean) {
  const windowRef = useRef<HTMLDivElement | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const el = windowRef.current;
    if (!el) return;
    const sync = () => {
      setWindowWidth(el.clientWidth);
      setWindowHeight(el.clientHeight);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Filling, the photo is a true 16:9 as tall as the room allows (and never
  // wider than the box less a peek of each neighbour).
  const imageWidth = fill
    ? Math.max(0, Math.min(windowWidth - (GEO.gap + GEO.fillPeek) * 2, (windowHeight * 16) / 9))
    : Math.min(GEO.maxImageWidth, Math.max(0, windowWidth - GEO.gap * 2));
  const sidePad = Math.max(GEO.gap, (windowWidth - imageWidth) / 2);

  return {
    windowRef,
    imageWidth,
    sidePad,
    pitch: imageWidth + GEO.gap,
    height: !fill && imageWidth ? Math.min((imageWidth * 9) / 16, GEO.maxImageHeight) : undefined,
    tileHeight: fill && imageWidth ? (imageWidth * 9) / 16 : undefined,
  };
}

/* ---------------------------------------------------------------- track */

/**
 * The current event's photos on an endless loop: [last, a, b, c, a, b]. The
 * strip glides one photo at a time; on reaching the clone of the first photo
 * it jumps back to the real one with no transition, which looks identical,
 * so the loop has no seam and the neighbours either side are always filled.
 */
function PhotoTrack({ images, fill }: { images: string[]; fill: boolean }) {
  const { windowRef, imageWidth, sidePad, pitch, height, tileHeight } = useTrackGeometry(fill);
  const [photo, setPhoto] = useState(0);
  // Off until the first scheduled glide: a freshly mounted strip measures its
  // width a frame late, and gliding through that change swept the first
  // photo across the box instead of it simply being in place.
  const [gliding, setGliding] = useState(false);
  const n = images.length;

  // A resize moves every photo; place them, don't sweep them.
  const [lastPitch, setLastPitch] = useState(pitch);
  if (pitch !== lastPitch) {
    setLastPitch(pitch);
    setGliding(false);
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      setGliding(true);
      setPhoto((p) => (p >= n ? p : p + 1));
    }, PHOTO_HOLD_MS + PHOTO_MOVE_MS);
    return () => window.clearInterval(t);
  }, [n]);

  // Landed on the clone of the first photo: once the glide is over, snap back
  // to the real one. A timer rather than transitionend, which a background
  // tab never fires.
  useEffect(() => {
    if (photo < n) return;
    const t = window.setTimeout(() => {
      setGliding(false);
      setPhoto(0);
    }, PHOTO_MOVE_MS + 40);
    return () => window.clearTimeout(t);
  }, [photo, n]);

  const strip = [images[n - 1], ...images, images[0], images[1 % n]];

  return (
    <div
      ref={windowRef}
      className={`relative w-full overflow-hidden ${
        fill
          ? "min-h-0 flex-1 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
          : ""
      }`}
      style={{ height }}
    >
      <div
        className="absolute inset-y-0 left-0 flex items-center will-change-transform"
        style={{
          gap: GEO.gap,
          paddingLeft: sidePad,
          // +1: the strip starts with the last photo, peeking in on the left.
          transform: `translateX(${-(photo + 1) * pitch}px)`,
          transition: gliding ? `transform ${PHOTO_MOVE_MS}ms ${PHOTO_EASE}` : "none",
        }}
      >
        {strip.map((src, i) => (
          <PhotoTile key={i} src={src} width={imageWidth} height={tileHeight} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ copy */

/**
 * Every event's copy stays mounted in one grid cell, so the cell is as tall as
 * the longest description and nothing below it ever jumps. The old copy
 * fades out as the new fades in, over the same beat as the photos.
 */
function CopySlide({ on, children }: { on: boolean; children: React.ReactNode }) {
  const d = TIMING.copyMorphS;
  return (
    <motion.div
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={{ duration: d, ease: [0.4, 0, 0.2, 1] }}
      className="[grid-area:1/1]"
      style={{ pointerEvents: on ? "auto" : "none" }}
      aria-hidden={!on}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------- controls */

function Arrow({ dir, onClick, label }: { dir: "prev" | "next"; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid size-11 cursor-pointer place-items-center rounded-full text-[#E0115F] transition-transform duration-300 ease-[var(--ease-spring)] hover:-translate-y-0.5 active:scale-95 ${GLASS_CLASS}`}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------- component */

/**
 * The "Xem thêm" window: the event's sub-events, each with its own heading.
 * Portalled to <body> (the page's smooth scroller transforms its content,
 * which would otherwise pin a fixed overlay to the page instead of the
 * screen), and the page holds still while it is open.
 */
function MoreModal({ slide, onClose }: { slide: GallerySlide; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      smoother?.paused(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={slide.title}
      className="fixed inset-0 z-[200] grid place-items-center bg-[rgba(63,10,38,0.6)] p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-[#FFFBF6] p-7 shadow-2xl ring-1 ring-[#FFD9DF] sm:p-9"
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 grid size-9 cursor-pointer place-items-center rounded-full text-[#3F0A26] transition-colors hover:bg-[#FFE1E8]"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <p className="pr-10 font-display text-xl" style={{ color: TOKENS.title }}>
          {slide.title}
        </p>
        <div className="mt-6 space-y-6">
          {slide.more?.map((m) => (
            <div key={m.name}>
              <h5 className="font-display text-[1.05rem] leading-snug text-[#E0115F]">{m.name}</h5>
              <p className="mt-2 text-justify text-[15px] leading-[1.8]" style={{ color: TOKENS.body }}>
                {m.body}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export default function GallerySlider({
  slides,
  label,
  fill = false,
  sizeWith = [],
}: {
  slides: GallerySlide[];
  label: string;
  /**
   * Other galleries' slides that share this one's layout: the text area is
   * sized to the longest of them all, so the photo and the event title sit
   * at the same height in every gallery.
   */
  sizeWith?: GallerySlide[];
  /** Take the full height of the parent and grow the photo to fill it. */
  fill?: boolean;
}) {
  const [more, setMore] = useState<GallerySlide | null>(null);
  const [active, setActive] = useState(0);
  // Events advance on their own every AUTO_MS, the current dot filling as a
  // progress bar. The moment the reader picks an event themselves (arrows or
  // dots) the gallery stops advancing and the dot stays solid — until the
  // host resets it (a new category shown), which restarts both.
  const [manual, setManual] = useState(false);
  const elapsed = useRef(0);
  const fillRef = useRef<HTMLSpanElement>(null);
  const moreOpen = useRef(false);
  useEffect(() => {
    moreOpen.current = more !== null;
  }, [more]);

  // Sent by whoever hosts the gallery to open it back on its first event.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reset = () => {
      elapsed.current = 0;
      setActive(0);
      setManual(false);
    };
    el.addEventListener(GALLERY_RESET, reset);
    return () => el.removeEventListener(GALLERY_RESET, reset);
  }, []);
  const count = slides.length;
  const go = useCallback((i: number) => setActive(((i % count) + count) % count), [count]);
  const pick = (i: number) => {
    setManual(true);
    go(i);
  };

  // The clock. Time only counts while the gallery is actually on screen
  // (in view, its panel not hidden, the tab visible, no "Xem thêm" window
  // open), so an event never slips past unseen.
  useEffect(() => {
    elapsed.current = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (manual || count < 2 || reduced) {
      if (fillRef.current) fillRef.current.style.width = "100%";
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    let inView = false;
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
    });
    io.observe(root);
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const shown =
        inView &&
        !document.hidden &&
        !moreOpen.current &&
        getComputedStyle(root).visibility === "visible";
      if (shown) elapsed.current += dt;
      const p = Math.min(1, elapsed.current / AUTO_MS);
      if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;
      if (p >= 1) {
        setActive((a) => (a + 1) % count);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [manual, count, active]);

  if (!count) return null;
  const slide = slides[active];

  return (
    <div
      className={`mx-auto w-full ${fill ? "flex h-full flex-col" : "max-w-6xl pb-16"}`}
      // The controls hang into this: 80px when filling.
      style={fill ? { paddingBottom: 80 } : undefined}
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className={fill ? `${BOX_CLASS} flex min-h-0 flex-1 flex-col` : BOX_CLASS}>
        {/* Switching event crossfades: the old event's strip stays in place
            and fades out while the new one fades in over it, stacked in one
            spot. Keyed, so the new loop starts on its own first photo. */}
        <div className={fill ? "relative min-h-0 flex-1" : "grid"}>
          <AnimatePresence initial={false}>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className={fill ? "absolute inset-0 flex flex-col" : "[grid-area:1/1]"}
            >
              <PhotoTrack images={slide.images} fill={fill} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid shrink-0" aria-live="polite">
          {/* Invisible copies of every shared slide's text: they only make
              the cell as tall as the longest of them. */}
          {sizeWith.map((s) => (
            <div key={`size-${s.id}`} aria-hidden="true" className="invisible [grid-area:1/1]">
              <div className="px-5 pb-5 pt-4 sm:px-7">
                <h4 className={`mb-1.5 font-display ${fill ? "text-[1.2rem]" : "text-xl sm:text-2xl"}`}>{s.title}</h4>
                <p className={`text-justify leading-[1.8] ${fill ? "text-[14.5px]" : "text-[15px] sm:text-[16.5px]"}`}>
                  {s.description}
                  {s.more ? <> Xem thêm</> : null}
                </p>
              </div>
            </div>
          ))}
          {slides.map((s, i) => (
            <CopySlide key={s.id} on={i === active}>
              <div className="px-5 pb-5 pt-4 sm:px-7">
                <h4
                  className={`mb-1.5 font-display ${fill ? "text-[1.2rem]" : "text-xl sm:text-2xl"}`}
                  style={{ color: TOKENS.title }}
                >
                  {s.title}
                </h4>
                <p
                  className={`text-justify leading-[1.8] ${fill ? "text-[14.5px]" : "text-[15px] sm:text-[16.5px]"}`}
                  style={{ color: TOKENS.body }}
                >
                  {s.description}
                  {s.more ? (
                    <>
                      {" "}
                      <button
                        type="button"
                        onClick={() => setMore(s)}
                        className="cursor-pointer whitespace-nowrap font-semibold text-[#E0115F] underline underline-offset-4 hover:text-[#C20D52]"
                      >
                        Xem thêm
                      </button>
                    </>
                  ) : null}
                </p>
              </div>
            </CopySlide>
          ))}
        </div>

        {/* Arrows either side of the dots; the current event's dot is a
            solid pink bar. */}
        <div className="absolute left-1/2 top-full z-10 mt-5 flex -translate-x-1/2 items-center gap-3">
          {count > 1 ? <Arrow dir="prev" onClick={() => pick(active - 1)} label="Sự kiện trước" /> : null}
          <div className={`flex items-center gap-2.5 rounded-full px-3.5 py-2.5 ${GLASS_CLASS}`}>
            {slides.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Sự kiện ${i + 1}: ${s.title}`}
                  aria-current={on ? "true" : undefined}
                  onClick={() => pick(i)}
                  className="group grid cursor-pointer place-items-center outline-none"
                  style={{ height: 16 }}
                >
                  <span
                    className="relative block h-[7px] overflow-hidden rounded-full transition-[width,background-color] duration-500 ease-out group-hover:brightness-90 group-focus-visible:ring-2 group-focus-visible:ring-[#E0115F]"
                    style={{ width: on ? 38 : 7, backgroundColor: on ? TOKENS.dotTrack : TOKENS.dotIdle }}
                  >
                    {/* The current event's progress: fills over AUTO_MS, or
                        sits full once the reader has taken over. */}
                    {on ? (
                      <span
                        ref={fillRef}
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ width: manual ? "100%" : "0%", backgroundColor: TOKENS.dotActive }}
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          {count > 1 ? <Arrow dir="next" onClick={() => pick(active + 1)} label="Sự kiện tiếp theo" /> : null}
        </div>
      </div>
      {more?.more ? <MoreModal slide={more} onClose={() => setMore(null)} /> : null}
    </div>
  );
}
