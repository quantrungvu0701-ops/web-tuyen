/**
 * A soft, tinted-accent blur sitting behind sparse section content. Flat
 * cream-on-cream with nothing but text and one placeholder box reads as an
 * empty, unfinished page — this gives the section some atmosphere without
 * competing with the content or affecting layout (purely decorative,
 * absolutely positioned, zero effect on the scroll-pin measurements other
 * components in these sections depend on).
 */
export function AmbientGlow({ variant = "top-right" }: { variant?: "top-right" | "bottom-left" }) {
  const position =
    variant === "top-right" ? "-top-24 right-[-8%] sm:right-[4%]" : "-bottom-24 left-[-10%] sm:left-[2%]";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${position} size-72 rounded-full bg-accent/[0.07] blur-3xl sm:size-96`}
    />
  );
}
