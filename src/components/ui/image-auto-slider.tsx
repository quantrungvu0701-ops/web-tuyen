"use client";

export type AutoSliderImage = { src: string; alt?: string };
/** A chat bubble riding in the column between photos. */
export type AutoSliderBubble = { bubble: string; side: "left" | "right"; tone: string };
export type AutoSliderItem = AutoSliderImage | AutoSliderBubble;

/**
 * An endless column of photos drifting upward, faded out at both ends.
 *
 * Adapted from the supplied horizontal slider in five ways, all deliberate:
 *
 *  1. Vertical, as asked: the track translates on Y and the fade mask runs
 *     top-to-bottom instead of left-to-right. The fade itself is kept exactly
 *     as supplied — transparent → black at 10%, black → transparent at 90%.
 *  2. Each tile carries its gap as `margin-bottom` rather than the track using
 *     flex `gap`. This is a correctness fix, not taste: with flex gap the
 *     duplicated list is `2n·h + (2n−1)·g` tall, so translating −50% moves
 *     `n·h + (2n−1)·g/2` — half a gap short of one full set, and the loop
 *     visibly jumps every cycle. With the gap inside each tile's own box the
 *     list is exactly `2n·(h+g)` and −50% lands precisely on the seam.
 *  3. Takes an `images` prop instead of eight hard-coded CDN URLs.
 *  4. The demo's global `html, body { margin: 0; overflow-x: hidden; font-family: … }`
 *     is dropped. A section component has no business resetting the document —
 *     it would override this site's own layout and typography everywhere.
 *  5. The full-screen black stage and its gradient overlays are dropped; they
 *     are demo scaffolding. The surrounding section supplies the background,
 *     so this renders transparent and fills whatever box it is given.
 */
export const ImageAutoSlider = ({
  images,
  durationSec = 30,
  className = "",
  layer = "all",
}: {
  images: AutoSliderItem[];
  /** Seconds for one full pass through the set. Bigger is slower. */
  durationSec?: number;
  className?: string;
  /**
   * "photos": the photos alone. "bubbles": the same column with the photos
   * left as empty space and each chat bubble hung off the corner of the photo
   * before it — rendered as a separate layer over the photos so the bubbles
   * can overhang the frame, while scrolling in exact step with it.
   */
  layer?: "all" | "photos" | "bubbles";
}) => {
  // Two copies back to back: the track scrolls exactly one copy, then snaps
  // back to a frame that looks identical.
  const doubled = [...images, ...images];
  const photosOnly = layer !== "all";

  return (
    <>
      <style>{`
        @keyframes ias-scroll-up {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .ias-track {
          animation: ias-scroll-up var(--ias-duration) linear infinite;
          /* flow-root, not block: the last tile's bottom margin would otherwise
             collapse out through the track, leaving it half a gap shorter than
             two whole sets — and translateY(-50%) would then land half a gap
             off the seam and visibly jump once per cycle. A new block
             formatting context keeps that margin inside the measured height. */
          display: flow-root;
        }
        .ias-mask {
          mask: linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%);
          -webkit-mask: linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%);
        }
        .ias-item { transition: transform .3s ease, filter .3s ease; }
        .ias-item:hover { transform: scale(1.03); filter: brightness(1.06); }
        @keyframes ias-bubble-pop {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-1.5px) scale(1.012); }
        }
        .ias-bubble { animation: ias-bubble-pop 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ias-track, .ias-bubble { animation: none; }
        }
      `}</style>

      <div className={`ias-mask h-full w-full overflow-hidden ${className}`}>
        <div
          className="ias-track will-change-transform"
          style={{ ["--ias-duration" as string]: `${durationSec}s` }}
          aria-hidden="true"
        >
          {doubled.map((item, i) => {
            if ("bubble" in item) {
              if (photosOnly) return null;
              return (
                // A chat message in the flow: its margin carries the gap like
                // a photo's does, so the loop maths is unchanged.
                <div key={i} className={`mb-5 flex ${item.side === "right" ? "justify-end" : "justify-start"}`}>
                  <p
                    className={`max-w-[80%] rounded-[20px] px-4 py-2.5 text-[15px] font-semibold shadow-[0_10px_24px_-12px_rgba(63,10,38,0.35)] ${
                      item.side === "right" ? "rounded-br-[6px]" : "rounded-bl-[6px]"
                    } ${item.tone}`}
                  >
                    {item.bubble}
                  </p>
                </div>
              );
            }
            const next = doubled[i + 1];
            const bubble = next && "bubble" in next ? next : null;
            if (layer === "bubbles") {
              return (
                <div key={i} className="relative mb-5 aspect-video w-full">
                  {bubble ? (
                    <p
                      className={`ias-bubble absolute bottom-[-18px] whitespace-nowrap rounded-[22px] px-5 py-3 text-[15px] font-semibold shadow-[0_18px_34px_-14px_rgba(63,10,38,0.55)] ring-2 ring-white ${
                        bubble.side === "right"
                          ? "right-[-44px] rounded-br-[6px]"
                          : "left-[-44px] rounded-bl-[6px]"
                      } ${bubble.tone}`}
                      style={{ animationDelay: `${(i % 3) * 0.7}s` }}
                    >
                      {bubble.bubble}
                    </p>
                  ) : null}
                </div>
              );
            }
            return (
              <div
                key={i}
                // The gap lives here, not on the track — see note 2 above.
                className="ias-item mb-5 w-full overflow-hidden rounded-xl shadow-[0_14px_34px_-14px_rgba(60,45,20,0.4)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt ?? ""}
                  loading="lazy"
                  draggable={false}
                  className="aspect-video w-full select-none object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

/** The name the supplied demo imports. */
export { ImageAutoSlider as Component };
