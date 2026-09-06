/** Neutral (fully revealed) value for each animatable property we use. */
const NEUTRAL: Record<string, number> = { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 };

/**
 * Builds initial/animate props for a scroll-revealed element.
 *
 * Under reduced motion both states are the revealed one. Passing `undefined`
 * instead would leave the element stuck: the server renders the hidden state
 * as an inline style, and with nothing driving it the element never becomes
 * visible on the client.
 */
export function reveal(
  reduceMotion: boolean | null,
  isActive: boolean,
  hidden: Record<string, number>,
) {
  const shown = Object.fromEntries(
    Object.keys(hidden).map((key) => [key, NEUTRAL[key] ?? 0]),
  );

  if (reduceMotion) return { initial: shown, animate: shown };
  return { initial: hidden, animate: isActive ? shown : hidden };
}
