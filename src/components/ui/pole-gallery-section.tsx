"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FaceCarousel, { type FaceData } from "@/components/ui/face-carousel";

/* ------------------------------------------------------------------ config */

/**
 * TODO(reverse-mode): true = a backward rotation replays the matching FORWARD
 * folder in reverse index order. false = each direction loads its own folder
 * (0-to-1 AND 1-to-0 must both exist on disk).
 *
 * Verified against the supplied frames: mid-rotation sharpness drops from 25.9
 * to 14.1, i.e. there IS motion blur — but it is tangential blur from the spin,
 * which is symmetric and reads correctly played either way. There are no
 * direction-dependent effects (no sweeping highlight). So mirroring is safe
 * here. Flip to false only if a future render adds directional effects.
 */
const USE_MIRRORED_REVERSE = true;

/**
 * TODO(timing): frames per transition and per-frame duration. 24 frames at
 * 38ms ≈ 912ms per rotation. Assumed identical for all 8 transitions; the
 * source rotations were 46-61 frames and have been resampled to a common 24.
 */
const FRAME_COUNT = 24;
const FRAME_DURATION_MS = 38;
const ROTATION_MS = FRAME_COUNT * FRAME_DURATION_MS;

const FACE_COUNT = 4;
const POLE_W = 640;
const POLE_H = 737;

/**
 * TODO(paths): folder pattern for both modes.
 *   mirrored   -> /pole/rotate/{min}-to-{max}/frame-{NNN}.webp played forward
 *                 or backward
 *   explicit   -> /pole/rotate/{from}-to-{to}/frame-{NNN}.webp for all 8 pairs
 * Note: .webp rather than the .png in the brief — these carry alpha and are
 * ~8x smaller, which matters at 96 frames. Change EXT to swap.
 */
const EXT = "webp";
const pad = (n: number) => String(n).padStart(3, "0");
const settledPath = (face: number) => `/pole/face-${face}.${EXT}`;

const isForwardStep = (from: number, to: number) =>
  (from + 1) % FACE_COUNT === to;

/** Resolves one frame of a from->to rotation, honouring USE_MIRRORED_REVERSE. */
function rotationFramePath(from: number, to: number, index: number) {
  if (USE_MIRRORED_REVERSE && !isForwardStep(from, to)) {
    // Reuse the forward folder, walked backwards. Because every sequence was
    // built to start and end exactly on a canonical face, the reversed walk
    // lands perfectly too.
    return `/pole/rotate/${to}-to-${from}/frame-${pad(FRAME_COUNT - index)}.${EXT}`;
  }
  return `/pole/rotate/${from}-to-${to}/frame-${pad(index + 1)}.${EXT}`;
}

/**
 * TODO(carousel): placeholder photos. Only 4 distinct images exist in
 * assets/source, so the 8 ring slots cycle through them twice — swap in the
 * real gallery (8 per face) and the repetition disappears.
 */
const PHOTOS = ["/gallery/p1.jpg", "/gallery/p2.jpg", "/gallery/p3.png", "/gallery/p4.webp"];
const ITEMS_PER_FACE = 8;

const faceItems = (label: string) =>
  Array.from({ length: ITEMS_PER_FACE }, (_, i) => ({
    common: `${label} ${i + 1}`,
    binomial: "HSV FTU",
    photo: {
      url: PHOTOS[i % PHOTOS.length],
      text: `${label} ${i + 1}`,
      by: "HSV FTU",
    },
  }));

const FACES: FaceData[] = [
  { id: 0, title: "Chương trình chính trị", items: faceItems("Hoạt động") },
  { id: 1, title: "Mặt 2", items: faceItems("Sự kiện") },
  { id: 2, title: "Mặt 3", items: faceItems("Hình ảnh") },
  { id: 3, title: "Mặt 4", items: faceItems("Kỷ niệm") },
];

const BACKGROUND = "#FAE7BA";

/* ------------------------------------------------------------------ helpers */

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const img = new Image();
  img.src = src;
  imageCache.set(src, img);
  return img;
}

function preloadRotation(from: number, to: number) {
  for (let i = 0; i < FRAME_COUNT; i++) loadImage(rotationFramePath(from, to, i));
}

/* ---------------------------------------------------------------- component */

export default function PoleGallerySection() {
  // One shared state object drives the canvas stepper AND the carousel fade.
  const [state, setState] = useState({
    currentFace: 0,
    isRotating: false,
    direction: 0 as -1 | 0 | 1,
  });
  // Mounted carousel face — swapped at the animation midpoint, not on click.
  const [mountedFace, setMountedFace] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  // Mirrors state.isRotating for the click handler, so a click during a
  // rotation is ignored immediately rather than waiting for a re-render.
  const rotatingRef = useRef(false);

  const drawImage = useCallback((img: HTMLImageElement) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !img.complete || img.naturalWidth === 0) return;
    ctx.clearRect(0, 0, POLE_W, POLE_H);
    ctx.drawImage(img, 0, 0, POLE_W, POLE_H);
  }, []);

  const drawSettled = useCallback(
    (face: number) => {
      const img = loadImage(settledPath(face));
      if (img.complete && img.naturalWidth > 0) drawImage(img);
      else img.onload = () => drawImage(img);
    },
    [drawImage],
  );

  // First paint + preload the two rotations reachable from face 0.
  useEffect(() => {
    drawSettled(0);
    preloadRotation(0, 1);
    preloadRotation(0, FACE_COUNT - 1);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [drawSettled]);

  const rotate = useCallback(
    (direction: 1 | -1) => {
      if (rotatingRef.current) return; // ignored, never queued
      const from = state.currentFace;
      const to = (from + direction + FACE_COUNT) % FACE_COUNT;

      rotatingRef.current = true;
      setState({ currentFace: from, isRotating: true, direction });

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = performance.now();
      let swapped = false;

      const finish = () => {
        rotatingRef.current = false;
        if (carouselRef.current) carouselRef.current.style.opacity = "1";
        setState({ currentFace: to, isRotating: false, direction: 0 });
        setAnnouncement(`Now viewing gallery ${to + 1} of ${FACE_COUNT}`);
        // Warm the next two reachable rotations.
        preloadRotation(to, (to + 1) % FACE_COUNT);
        preloadRotation(to, (to - 1 + FACE_COUNT) % FACE_COUNT);
      };

      // Reduced motion: hard-cut the pole, keep the (non-motion) crossfade.
      if (reduced) drawSettled(to);

      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / ROTATION_MS, 1);

        if (!reduced) {
          const index = Math.min(
            FRAME_COUNT - 1,
            Math.floor(elapsed / FRAME_DURATION_MS),
          );
          const img = loadImage(rotationFramePath(from, to, index));
          drawImage(img);
        }

        // Same clock drives the carousel: out, swap at midpoint, in.
        if (carouselRef.current) {
          carouselRef.current.style.opacity = String(
            progress < 0.5 ? 1 - progress * 2 : (progress - 0.5) * 2,
          );
        }
        if (!swapped && progress >= 0.5) {
          swapped = true;
          setMountedFace(to);
        }

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          if (!reduced) drawSettled(to);
          finish();
        }
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [state.currentFace, drawImage, drawSettled],
  );

  const buttonClass =
    "flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[#241F1C] shadow-sm transition-opacity hover:bg-white disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <section
      className="w-full px-6 py-20 md:px-10"
      style={{ backgroundColor: BACKGROUND }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-12">
        {/* Pole — full width stacked, ~40% on desktop */}
        <div className="flex w-full flex-col items-center lg:w-2/5">
          <canvas
            ref={canvasRef}
            width={POLE_W}
            height={POLE_H}
            className="h-auto w-full max-w-sm"
          />

          <div className="mt-6 flex items-center gap-5">
            <button
              type="button"
              onClick={() => rotate(-1)}
              disabled={state.isRotating}
              aria-disabled={state.isRotating}
              aria-label="Rotate to previous gallery"
              className={buttonClass}
            >
              <span aria-hidden="true">←</span>
            </button>

            <ol className="flex items-center gap-2" aria-hidden="true">
              {Array.from({ length: FACE_COUNT }, (_, i) => (
                <li
                  key={i}
                  className="h-2.5 w-2.5 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      i === state.currentFace ? "#E80808" : "rgba(0,0,0,0.18)",
                  }}
                />
              ))}
            </ol>

            <button
              type="button"
              onClick={() => rotate(1)}
              disabled={state.isRotating}
              aria-disabled={state.isRotating}
              aria-label="Rotate to next gallery"
              className={buttonClass}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Carousel — full width stacked, ~60% on desktop */}
        <div className="w-full lg:w-3/5">
          <div ref={carouselRef} style={{ opacity: 1 }}>
            <FaceCarousel data={FACES[mountedFace]} />
          </div>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
