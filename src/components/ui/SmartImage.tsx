"use client";

import { Image as ImageIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

type SmartImageProps = {
  src: string;
  alt: string;
  /** Shown inside the placeholder so it's obvious which file is missing. */
  placeholderLabel?: string;
  className?: string;
};

/**
 * Renders the real image once the file exists at `src`, and a labelled
 * placeholder until then — so dropping artwork into /public is the only step
 * needed to fill the site in, with no code changes.
 */
export function SmartImage({ src, alt, placeholderLabel, className = "" }: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // An image server-rendered into the HTML can finish failing before React
    // hydrates and attaches onError, so that event is never seen. Checking the
    // element on mount is what catches those.
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (failed) {
    return (
      <div
        className={`placeholder-hatch flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageIcon aria-hidden="true" weight="light" className="size-7 opacity-50" />
        {placeholderLabel ? (
          <span className="px-2 text-center text-[11px] font-medium tracking-wide opacity-70">
            {placeholderLabel}
          </span>
        ) : null}
      </div>
    );
  }

  // A plain <img> is deliberate: the placeholder fallback keys off onError,
  // and the site is a static export where next/image adds no optimization.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
