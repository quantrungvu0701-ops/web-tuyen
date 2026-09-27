"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DRAFT_KEY, SCHEMA_VERSION, type Answers } from "@/lib/application-form";

type Draft = {
  version: number;
  savedAt: number;
  step: number;
  answers: Answers;
};

/**
 * Every access is guarded. In private-browsing mode `localStorage` can throw on
 * read *and* on write, and a form that white-screens because a draft could not
 * be saved is far worse than one that quietly stops saving.
 */
function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    // A draft written against an older question list would restore answers
    // into fields that have since moved or gone. Dropping it loses work, but
    // silently mis-filing someone's answers is worse.
    if (parsed.version !== SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft): boolean {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* nothing to do — the draft simply outlives the submission */
  }
}

/** Debounce short enough that a power cut costs a word, not a paragraph. */
const SAVE_DEBOUNCE_MS = 400;

export type DraftState = {
  ready: boolean;
  restored: boolean;
  savedAt: number | null;
  /** False once a write has failed — private mode, or the quota is full. */
  persistent: boolean;
};

export function useFormDraft(
  answers: Answers,
  step: number,
  setRestored: (draft: { answers: Answers; step: number }) => void,
) {
  const [state, setState] = useState<DraftState>({
    ready: false,
    restored: false,
    savedAt: null,
    persistent: true,
  });

  // Held in refs so the flush-on-hide listener below can be registered once and
  // still see the newest answers, rather than a copy from the render that
  // attached it.
  const latest = useRef({ answers, step });
  latest.current = { answers, step };
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const savedAt = Date.now();
    const ok = writeDraft({
      version: SCHEMA_VERSION,
      savedAt,
      step: latest.current.step,
      answers: latest.current.answers,
    });
    setState((s) => ({ ...s, savedAt: ok ? savedAt : s.savedAt, persistent: ok }));
  }, []);

  // Restore once, on mount.
  useEffect(() => {
    const draft = readDraft();
    if (draft) setRestored({ answers: draft.answers, step: draft.step });
    setState({
      ready: true,
      restored: Boolean(draft),
      savedAt: draft?.savedAt ?? null,
      persistent: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save on every change.
  useEffect(() => {
    if (!state.ready) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [answers, step, state.ready, flush]);

  /**
   * `visibilitychange` and `pagehide` are the two that actually fire when a tab
   * is closed, backgrounded, or the phone is locked. `beforeunload` is not used
   * on purpose: it is unreliable on mobile and it disqualifies the page from
   * the back/forward cache.
   */
  useEffect(() => {
    if (!state.ready) return;
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, [state.ready, flush]);

  return { ...state, flush };
}
