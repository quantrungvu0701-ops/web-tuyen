/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";

/**
 * A small piece of the key visual's sky — a cloud, Bi, the car — floating in
 * the open space between sections so the page reads as one sky rather than a
 * stack of boxes. Purely decorative: hidden from assistive tech and from the
 * pointer, and it never carries content.
 */
const ANIM = {
  drift: "anim-drift",
  bob: "anim-bob",
  glide: "anim-glide",
  hop: "anim-hop",
} as const;

export default function Decor({
  src,
  className = "",
  anim = "drift",
  dur,
  flip = false,
}: {
  src: string;
  /** Position and size (absolute; the section must be `relative`). */
  className?: string;
  anim?: keyof typeof ANIM;
  /** Animation length, e.g. "30s"; each piece runs out of step with the rest. */
  dur?: string;
  /** Mirror it, so a repeated cloud does not read as a copy. */
  flip?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${className}`}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className={`w-full ${ANIM[anim]}`}
        style={dur ? ({ ["--dur" as string]: dur } as CSSProperties) : undefined}
      />
    </div>
  );
}
