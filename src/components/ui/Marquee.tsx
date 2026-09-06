"use client";

import { type ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  /** Direction the content travels. */
  direction: "left" | "right";
  /** Seconds for one full loop — larger is slower. */
  duration?: number;
  paused?: boolean;
  className?: string;
  itemClassName?: string;
};

/**
 * Seamless infinite strip. The children are rendered twice inside a track that
 * travels exactly half its own width, so the loop has no visible seam.
 */
export function Marquee({
  children,
  direction,
  duration = 45,
  paused = false,
  className = "",
  itemClassName = "",
}: MarqueeProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="marquee-track flex w-max"
        data-direction={direction}
        style={{
          ["--marquee-duration" as string]: `${duration}s`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        <div className={`flex shrink-0 ${itemClassName}`}>{children}</div>
        {/* The seam copy is inert as well as hidden: its buttons and links
            would otherwise be duplicated in the tab order. */}
        <div className={`flex shrink-0 ${itemClassName}`} aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  );
}
