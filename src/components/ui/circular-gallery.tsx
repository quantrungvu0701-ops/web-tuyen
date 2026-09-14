"use client";

import React, { useEffect, useRef, HTMLAttributes } from "react";

// A simple utility for conditional class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Define the type for a single gallery item
export interface GalleryItem {
  common: string;
  binomial: string;
  photo: {
    url: string;
    text: string;
    pos?: string;
    by: string;
  };
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Controls how far the items are from the center. */
  radius?: number;
  /** Degrees per frame while idling. */
  autoRotateSpeed?: number;
  /** Degrees of rotation per pixel dragged. */
  dragSensitivity?: number;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  (
    {
      items,
      className,
      radius = 260,
      autoRotateSpeed = 0.02,
      dragSensitivity = 0.35,
      ...props
    },
    ref,
  ) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const ringRef = useRef<HTMLDivElement | null>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Rotation lives in a ref, not state: the loop mutates the DOM directly so
    // idling costs zero React re-renders.
    const rotationRef = useRef(0);
    const draggingRef = useRef(false);
    const lastXRef = useRef(0);
    const visibleRef = useRef(true);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
      const host = hostRef.current;
      const ring = ringRef.current;
      if (!host || !ring) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const paint = () => {
        const rotation = rotationRef.current;
        ring.style.transform = `rotateY(${rotation}deg)`;
        const anglePer = 360 / items.length;
        for (let i = 0; i < items.length; i++) {
          const el = itemRefs.current[i];
          if (!el) continue;
          // Items facing away fade back, so the ring reads as depth.
          const relative = (i * anglePer + (rotation % 360) + 360) % 360;
          const normalized = relative > 180 ? 360 - relative : relative;
          el.style.opacity = String(Math.max(0.3, 1 - normalized / 180));
        }
      };

      const tick = () => {
        if (!draggingRef.current && visibleRef.current && !reduced) {
          rotationRef.current += autoRotateSpeed;
        }
        paint();
        rafRef.current = requestAnimationFrame(tick);
      };

      paint();
      rafRef.current = requestAnimationFrame(tick);

      // Stop spending frames while the section is off-screen.
      const io = new IntersectionObserver(
        ([entry]) => {
          visibleRef.current = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      io.observe(host);

      // Native HTML5 drag on an image or a text selection steals the pointer
      // stream and paints the "no-drop" cursor, which made the ring randomly
      // refuse to rotate. Suppress it at the container.
      const onDragStart = (e: Event) => e.preventDefault();

      const onPointerDown = (e: PointerEvent) => {
        e.preventDefault();
        draggingRef.current = true;
        lastXRef.current = e.clientX;
        try {
          host.setPointerCapture(e.pointerId);
        } catch {
          // capture is best-effort; dragging still works without it
        }
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!draggingRef.current) return;
        rotationRef.current += (e.clientX - lastXRef.current) * dragSensitivity;
        lastXRef.current = e.clientX;
      };
      const endDrag = (e: PointerEvent) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        try {
          if (host.hasPointerCapture(e.pointerId))
            host.releasePointerCapture(e.pointerId);
        } catch {
          // already released
        }
      };
      // Releasing outside the element must also end the drag, otherwise the
      // ring keeps following the cursor after the button is up.
      const onWindowUp = () => {
        draggingRef.current = false;
      };

      host.addEventListener("dragstart", onDragStart);
      host.addEventListener("pointerdown", onPointerDown);
      host.addEventListener("pointermove", onPointerMove);
      host.addEventListener("pointerup", endDrag);
      host.addEventListener("pointercancel", endDrag);
      window.addEventListener("pointerup", onWindowUp);

      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        io.disconnect();
        host.removeEventListener("dragstart", onDragStart);
        host.removeEventListener("pointerdown", onPointerDown);
        host.removeEventListener("pointermove", onPointerMove);
        host.removeEventListener("pointerup", endDrag);
        host.removeEventListener("pointercancel", endDrag);
        window.removeEventListener("pointerup", onWindowUp);
      };
    }, [items.length, autoRotateSpeed, dragSensitivity]);

    const anglePerItem = 360 / items.length;

    return (
      <div
        ref={(node) => {
          hostRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn(
          "relative flex h-full w-full cursor-grab select-none items-center justify-center touch-pan-y active:cursor-grabbing",
          className,
        )}
        style={{ perspective: "1200px" }}
        {...props}
      >
        <div
          ref={ringRef}
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {items.map((item, i) => (
            <div
              key={`${item.photo.url}-${i}`}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              role="group"
              aria-label={item.common}
              className="absolute h-[230px] w-[170px]"
              style={{
                transform: `rotateY(${i * anglePerItem}deg) translateZ(${radius}px)`,
                left: "50%",
                top: "50%",
                marginLeft: "-85px",
                marginTop: "-115px",
              }}
            >
              <div
                draggable={false}
                className="group relative h-full w-full select-none overflow-hidden rounded-lg border border-border bg-card/70 shadow-2xl backdrop-blur-lg"
              >
                <img
                  src={item.photo.url}
                  alt={item.photo.text}
                  draggable={false}
                  className="absolute inset-0 h-full w-full select-none object-cover"
                  style={{ objectPosition: item.photo.pos || "center" }}
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                  <h2 className="text-sm font-bold leading-tight">
                    {item.common}
                  </h2>
                  <em className="text-xs italic opacity-80">{item.binomial}</em>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

CircularGallery.displayName = "CircularGallery";

export { CircularGallery };
