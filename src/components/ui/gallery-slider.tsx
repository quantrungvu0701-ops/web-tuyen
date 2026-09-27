"use client";

import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ProgressSlider,
  SliderContent,
  useProgressSliderContext,
} from "@/components/ui/progressive-carousel";

/* ------------------------------------------------------------------ types */

export type GallerySlide = {
  id: string;
  title: string;
  description: string;
  /** Exactly IMAGES_PER_SLIDE photos. */
  images: string[];
};

/**
 * Photos per slide. Exported so the data that feeds this component is built
 * from the same number the geometry runs on — they have to agree or the strip
 * lands between photos.
 */
export const IMAGES_PER_SLIDE = 3;

/* ----------------------------------------------------------------- tokens
 * Box is the same frosted glass as the nav bar — the near-white paper
 * (#FFFCF5) at the same alpha and blur, not a colour of its own — so text on
 * it is dark ink/muted rather than white — and so is the dots pill, which now
 * shares that same glass.
 */
const TOKENS = {
  title: "#241F1C",
  body: "#6B5A44",
  // Dots sit on the same pale glass as the box now, so they are dark ink at
  // low alpha rather than the white that showed up against the old dark pill.
  dotIdle: "rgba(36, 31, 28, 0.26)",
  dotTrack: "rgba(36, 31, 28, 0.16)",
  dotFill: "#241F1C",
} as const;

/**
 * One photo's turn: it sits still, then travels to the next one. The strip
 * itself never resets — it runs on through the end of a slide straight into
 * the next slide's first photo — so these two numbers are the whole rhythm.
 */
const PHOTO_HOLD_MS = 1500;
const PHOTO_MOVE_MS = 750;
const PHOTO_CYCLE_MS = PHOTO_HOLD_MS + PHOTO_MOVE_MS;

/** Share of a photo's turn spent parked rather than travelling. */
const HOLD_FRACTION = PHOTO_HOLD_MS / PHOTO_CYCLE_MS;

/**
 * A slide lasts exactly as long as its photos do, derived rather than set, so
 * the dots' progress bar and the strip can never fall out of step.
 */
const SLIDE_MS = IMAGES_PER_SLIDE * PHOTO_CYCLE_MS;

const TIMING = {
  /** The ramp a dot-click runs before it hands over to the target slide. */
  fastMs: 900,
  /** The copy crossfade — the slide-to-slide morph. */
  copyMorphS: 0.9,
} as const;

const GEO = {
  /** The gap between two photos, and the least the box can show beside one. */
  gap: 16,
  imageRadius: 12,
  /**
   * The photo's own size is capped here rather than taken from the box. The
   * two used to be the same thing, so a wider box meant a taller photo; now
   * the extra width goes to the neighbours either side instead, and the photo
   * keeps the height it has.
   */
  maxImageWidth: 736,
  /**
   * The photo used to be a plain 16:9 off its width — 414px tall at full
   * width — which left no room below it for real copy (3-5 lines) without
   * pushing the dots bar past the fold. Capped shorter here; object-cover
   * on the tile crops top/bottom to fill it, so the photo just reads as a
   * wider banner crop rather than getting letterboxed.
   */
  maxImageHeight: 256,
} as const;

/**
 * The nav bar's own frosted-glass recipe (paper #FFFCF5 at 74%, backdrop-blur,
 * a hairline border, the same soft drop shadow), shared by the box and the
 * dots bar so every glass surface on the page stays one material. Spelled out
 * as literal strings because the box's lands on ProgressSlider's `className` —
 * that component takes no `style` prop — and Tailwind only emits arbitrary
 * values it can read in the source.
 *
 * The box is NOT clipped: the dots bar hangs below it on `top-full`, so an
 * `overflow-hidden` here deletes it. The photo strip does its own clipping.
 * `pt-4` is GEO.gap; keep them in step.
 */
const GLASS_CLASS =
  "border border-[rgba(36,31,28,0.10)] bg-[rgba(255,252,245,0.74)] shadow-[0_14px_40px_-20px_rgba(36,31,28,0.35)] backdrop-blur-xl backdrop-saturate-150";

const BOX_CLASS = `relative w-full rounded-[20px] pt-4 ${GLASS_CLASS}`;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Slow at both ends, quickest through the middle — the curve a travelling
 * thing actually follows, and what keeps the hop between photos feeling soft
 * rather than mechanical.
 */
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Where a dot-click is panning from and to, in photo units along the strip. */
type PanJump = { from: number; to: number; fromProgress: number };

/* ------------------------------------------------------------ photo tile */

function PhotoTile({ src, width }: { src: string; width: number }) {
  return (
    <div
      className="h-full shrink-0 overflow-hidden bg-black/10"
      style={{ width, borderRadius: GEO.imageRadius }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="h-full w-full select-none object-cover"
      />
    </div>
  );
}

/**
 * The photo is centred in the window at a fixed size; the photos sit a `gap`
 * apart. When the box is wider than `gap + image + gap` the surplus becomes
 * margin either side, and the neighbouring photos show through it.
 */
function useTrackGeometry() {
  const windowRef = useRef<HTMLDivElement | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const el = windowRef.current;
    if (!el) return;
    const sync = () => setWindowWidth(el.clientWidth);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const imageWidth = Math.min(
    GEO.maxImageWidth,
    Math.max(0, windowWidth - GEO.gap * 2),
  );
  // Whatever the box has spare goes either side of the photo, which both keeps
  // it centred and is exactly what lets the neighbours show through.
  const sidePad = Math.max(GEO.gap, (windowWidth - imageWidth) / 2);

  return {
    windowRef,
    imageWidth,
    sidePad,
    pitch: imageWidth + GEO.gap,
    height: imageWidth
      ? Math.min((imageWidth * 9) / 16, GEO.maxImageHeight)
      : undefined,
  };
}

/* ---------------------------------------------------------------- track */

/**
 * One strip carrying every photo in the gallery, which never resets: it settles
 * on each photo in turn and then travels to the next, and at the end of a slide
 * it simply keeps going into the next slide's first photo, so the boundary
 * needs no transition of its own.
 *
 * Position is read off the slider's own progress rather than a timer of its
 * own, so the strip and the dots' progress bar cannot drift apart — through a
 * slide change, a dot-click, or the loop's wrap.
 */
function PhotoTrack({
  slides,
  panRef,
  posRef,
}: {
  slides: GallerySlide[];
  panRef: MutableRefObject<PanJump | null>;
  posRef: MutableRefObject<number>;
}) {
  const { active, progress } = useProgressSliderContext();
  const { windowRef, imageWidth, sidePad, pitch, height } = useTrackGeometry();

  const activeIndex = Math.max(
    0,
    slides.findIndex((s) => s.id === active),
  );

  // Every slide's photos end to end, with a clone at BOTH ends.
  //
  // The tail clone is what the loop's wrap lands on: pixel-identical to the
  // real start, so resetting the position to zero behind it is invisible.
  //
  // The head clone is what fills the left margin at position zero. Without it
  // there is simply no photo before the first, so the margin sat empty on the
  // way back round to slide 1 and the photo that had been there looked like it
  // had vanished. It holds the gallery's last photos, which is exactly what a
  // strip that never ends should show to the left of its first one.
  const photos = slides.flatMap((s) => s.images.slice(0, IMAGES_PER_SLIDE));
  const head = photos.slice(-IMAGES_PER_SLIDE);
  const strip = [...head, ...photos, ...photos.slice(0, IMAGES_PER_SLIDE)];

  // How far through the gallery we are, counted in photos.
  const raw =
    activeIndex * IMAGES_PER_SLIDE + (progress / 100) * IMAGES_PER_SLIDE;
  // Park on the whole photo, then ease across to the next one over the tail of
  // its turn. Nothing clamps the last photo of a slide: it is meant to carry on
  // into the first photo of the next.
  const settled = Math.floor(raw);
  const turn = clamp01((raw - settled - HOLD_FRACTION) / (1 - HOLD_FRACTION));

  // A dot-click ramps progress to 100 and only then switches slide. Left alone
  // the strip would race to the end of the current slide and then jump. Given
  // where it is and where it is headed, it travels straight there instead.
  const jump = panRef.current;
  const panning = jump !== null && activeIndex * IMAGES_PER_SLIDE !== jump.to;

  let position = settled + easeInOut(turn);
  if (jump && panning) {
    const span = 100 - jump.fromProgress;
    const travelled =
      span > 0 ? clamp01((progress - jump.fromProgress) / span) : 1;
    position = jump.from + (jump.to - jump.from) * easeInOut(travelled);
  }

  useEffect(() => {
    posRef.current = position;
  });

  // Cleared once the slide the click asked for is the live one.
  useEffect(() => {
    panRef.current = null;
  }, [active, panRef]);

  return (
    <div
      ref={windowRef}
      className="relative w-full overflow-hidden"
      style={{ height }}
    >
      <div
        className="absolute inset-y-0 left-0 flex will-change-transform"
        style={{
          gap: GEO.gap,
          paddingLeft: sidePad,
          // Offset past the head clone: `position` counts photos from the
          // gallery's real first one, the strip now starts before it.
          transform: `translateX(${-(position + head.length) * pitch}px)`,
        }}
      >
        {strip.map((src, n) => (
          <PhotoTile key={n} src={src} width={imageWidth} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ copy */

/**
 * Stands in for the supplied SliderWrapper, whose crossfade timing is fixed.
 * ProgressSlider only ever reads the `value` prop off these, so swapping the
 * component out leaves it none the wiser.
 */
function CopySlide({
  value,
  durationS,
  children,
}: {
  value: string;
  durationS: number;
  children: ReactNode;
}) {
  const { active } = useProgressSliderContext();

  return (
    <AnimatePresence initial={false}>
      {active === value && (
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: durationS, ease: [0.33, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------- dots bar */

/**
 * Apple's pill: idle slides are dots, the running one stretches into a track
 * that fills left to right off the same progress value the photos read.
 */
function GalleryDots({
  slides,
  panRef,
  posRef,
}: {
  slides: GallerySlide[];
  panRef: MutableRefObject<PanJump | null>;
  posRef: MutableRefObject<number>;
}) {
  const { active, progress, handleButtonClick } = useProgressSliderContext();

  const onDot = (id: string, index: number) => {
    // Hand the track where it is now and where it is going, so it can travel
    // there directly instead of racing to the end of the current slide.
    if (id !== active) {
      panRef.current = {
        from: posRef.current,
        to: index * IMAGES_PER_SLIDE,
        fromProgress: progress,
      };
    }
    handleButtonClick(id);
  };

  return (
    <div
      className={`absolute left-1/2 top-full z-10 mt-5 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-3.5 py-2.5 ${GLASS_CLASS}`}
    >
      {slides.map((slide, i) => {
        const isActive = slide.id === active;

        return (
          <button
            key={slide.id}
            type="button"
            aria-label={`Ảnh ${i + 1}: ${slide.title}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => onDot(slide.id, i)}
            className="group grid cursor-pointer place-items-center outline-none"
            style={{ height: 16 }}
          >
            <span
              role={isActive ? "progressbar" : undefined}
              aria-valuenow={isActive ? Math.round(progress) : undefined}
              aria-valuemin={isActive ? 0 : undefined}
              aria-valuemax={isActive ? 100 : undefined}
              className="relative block h-[7px] overflow-hidden rounded-full transition-[width,background-color] duration-500 ease-out group-hover:brightness-75 group-focus-visible:ring-2 group-focus-visible:ring-[#241F1C]"
              style={{
                width: isActive ? 38 : 7,
                backgroundColor: isActive ? TOKENS.dotTrack : TOKENS.dotIdle,
              }}
            >
              {isActive && (
                <span
                  className="absolute inset-y-0 left-0 block rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: TOKENS.dotFill,
                  }}
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- component */

export default function GallerySlider({
  slides,
  label,
  fastMs = TIMING.fastMs,
  copyMorphS = TIMING.copyMorphS,
}: {
  slides: GallerySlide[];
  label: string;
  fastMs?: number;
  copyMorphS?: number;
}) {
  const panRef = useRef<PanJump | null>(null);
  const posRef = useRef(0);

  if (!slides.length) return null;

  return (
    // Wide, but still capped: the photo has its own size ceiling now, so the
    // box's width only decides how much of the neighbouring photos shows
    // beside it. Bottom padding is the room the dots bar hangs into.
    <div
      className="mx-auto w-full max-w-6xl pb-16"
      aria-roledescription="carousel"
      aria-label={label}
    >
      {/* ProgressSlider's own element IS the box. It has to be: the component
          reads its slide values off its DIRECT children, so burying
          SliderContent inside a wrapper div leaves that list empty and the
          clock never starts. Padding only on top — the horizontal spacing is
          the strip's own, so image-to-edge and image-to-image stay one single
          value. */}
      <ProgressSlider
        activeSlider={slides[0].id}
        duration={SLIDE_MS}
        fastDuration={fastMs}
        className={BOX_CLASS}
      >
        <PhotoTrack slides={slides} panRef={panRef} posRef={posRef} />

        {/* Relative + min-height: the copy blocks stack on one another so they
            can cross over, and the box holds steady while they do. Each
            CopySlide is absolutely positioned, so this min-height is the
            ONLY thing that gives the copy room — it has to fit the real
            copy (3-5 lines), not just the placeholder's one line, or a
            longer slide overflows into the dots bar below. */}
        <SliderContent className="relative min-h-48">
          {slides.map((slide) => (
            <CopySlide key={slide.id} value={slide.id} durationS={copyMorphS}>
              <div style={{ padding: GEO.gap }}>
                <h4
                  className="mb-1.5 text-lg font-bold tracking-tight sm:text-xl"
                  style={{ color: TOKENS.title }}
                >
                  {slide.title}
                </h4>
                <p
                  className="max-w-2xl text-sm leading-relaxed sm:text-[15px]"
                  style={{ color: TOKENS.body }}
                >
                  {slide.description}
                </p>
              </div>
            </CopySlide>
          ))}
        </SliderContent>

        <GalleryDots slides={slides} panRef={panRef} posRef={posRef} />
      </ProgressSlider>
    </div>
  );
}
