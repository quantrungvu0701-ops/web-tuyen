/**
 * The single moment recruitment closes.
 *
 * Vòng đơn runs 01/10 – 20/10 (per the Thế hệ 24 key visual).
 *
 * Both the hero countdown and the đơn page read this. They must agree — a
 * countdown still showing time left on a form that has already stopped
 * accepting answers is the kind of thing applicants take personally.
 */
export const DEADLINE = new Date("2026-10-20T23:59:59+07:00");

export function isClosed(now: number = Date.now()): boolean {
  return now >= DEADLINE.getTime();
}

/** e.g. "23:59 ngày 15/10/2026" — for telling people when it shuts. */
export function formatDeadline(): string {
  const d = DEADLINE;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ngày ${pad(d.getDate())}/${pad(
    d.getMonth() + 1,
  )}/${d.getFullYear()}`;
}
