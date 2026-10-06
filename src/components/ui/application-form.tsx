"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CONTACT } from "@/lib/site";
import {
  buildSteps,
  isBlank,
  toSubmission,
  NGUYEN_VONG_2,
  KHONG,
  type Answers,
  type Field,
} from "@/lib/application-form";
import { clearDraft, useFormDraft } from "@/lib/use-form-draft";
import { formatDeadline, isClosed } from "@/lib/deadline";

/* ------------------------------------------------------------------ tokens */

const T = {
  ink: "#3F0A26",
  muted: "#8A3A5E",
  line: "rgba(63, 10, 38, 0.14)",
  accent: "#E0115F",
  card: "#FFFFFF",
  danger: "#C22118",
  ok: "#23713A",
} as const;

/**
 * Where the answers go. Set NEXT_PUBLIC_FORM_ENDPOINT to the Apps Script web
 * app URL (see scripts/google-apps-script.gs). Left empty the form still runs
 * end to end — it just reports that submission is not wired up yet, rather
 * than silently swallowing somebody's application.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";

/* -------------------------------------------------------------- validation */

function fieldError(field: Field, value: string | string[] | undefined) {
  if (field.required && isBlank(value)) return "Phần này bắt buộc.";
  if (typeof value !== "string" || !value) return null;

  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Email chưa đúng định dạng.";
  if (field.type === "tel" && !/^[\d\s+().-]{8,}$/.test(value))
    return "Số điện thoại chưa đúng.";
  if (field.type === "url" && !/^https?:\/\/.+\..+/.test(value))
    return "Link cần bắt đầu bằng http:// hoặc https://";
  return null;
}

/* ------------------------------------------------------------ field inputs */

const inputBase =
  "w-full rounded-lg border bg-white px-4 py-3 text-[15px] leading-relaxed outline-none transition-shadow placeholder:text-[#B5A594] focus:ring-2";

function QuestionField({
  field,
  value,
  error,
  onChange,
}: {
  field: Field;
  value: string | string[] | undefined;
  error: string | null;
  onChange: (v: string | string[]) => void;
}) {
  const id = `f-${field.name}`;
  const describedBy = error ? `${id}-err` : undefined;
  const borderColor = error ? T.danger : T.line;

  return (
    <div className="scroll-mt-28" data-field={field.name}>
      <label
        htmlFor={id}
        className="mb-2 block text-[15px] font-semibold leading-snug"
        style={{ color: T.ink }}
      >
        {field.label}
        {field.required && (
          <span aria-hidden="true" style={{ color: T.accent }}>
            {" *"}
          </span>
        )}
      </label>
      {field.note && (
        <p className="-mt-1 mb-2 text-sm" style={{ color: T.muted }}>
          {field.note}
        </p>
      )}

      {field.type === "longtext" && (
        <textarea
          id={id}
          rows={4}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${inputBase} resize-y`}
          style={{ borderColor, color: T.ink }}
        />
      )}

      {(field.type === "text" ||
        field.type === "email" ||
        field.type === "tel" ||
        field.type === "url" ||
        field.type === "date") && (
        <input
          id={id}
          type={field.type === "text" ? "text" : field.type}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={inputBase}
          style={{ borderColor, color: T.ink }}
        />
      )}

      {(field.type === "radio" || field.type === "checkbox") && (
        <div
          role={field.type === "radio" ? "radiogroup" : "group"}
          aria-labelledby={id}
          aria-describedby={describedBy}
          className="grid gap-2 sm:grid-cols-3"
        >
          {field.options?.map((option) => {
            const selected =
              field.type === "radio"
                ? value === option
                : Array.isArray(value) && value.includes(option);

            return (
              <button
                key={option}
                type="button"
                role={field.type === "radio" ? "radio" : "checkbox"}
                aria-checked={selected}
                onClick={() => {
                  if (field.type === "radio") return onChange(option);
                  const list = Array.isArray(value) ? value : [];
                  onChange(
                    list.includes(option)
                      ? list.filter((v) => v !== option)
                      : [...list, option],
                  );
                }}
                className="flex items-center gap-2.5 rounded-lg border px-4 py-3 text-left text-[15px] transition-colors"
                style={{
                  borderColor: selected ? T.accent : borderColor,
                  backgroundColor: selected ? "#FDECEC" : "#FFFFFF",
                  color: T.ink,
                  fontWeight: selected ? 600 : 400,
                }}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-[18px] shrink-0 place-items-center border ${
                    field.type === "radio" ? "rounded-full" : "rounded-[5px]"
                  }`}
                  style={{
                    borderColor: selected ? T.accent : "#E7B9C6",
                    backgroundColor: selected ? T.accent : "#fff",
                  }}
                >
                  {selected && (
                    <span
                      className={
                        field.type === "radio"
                          ? "size-1.5 rounded-full bg-white"
                          : "text-[11px] font-bold leading-none text-white"
                      }
                    >
                      {field.type === "checkbox" ? "✓" : ""}
                    </span>
                  )}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p id={`${id}-err`} className="mt-2 text-sm" style={{ color: T.danger }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- the form */

export default function ApplicationForm() {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [sendError, setSendError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const restore = useCallback(
    (draft: { answers: Answers; step: number }) => {
      // The answers come back; the form itself always opens on its first
      // page, and the reader moves on from there.
      setAnswers(draft.answers);
    },
    [],
  );

  // Every visit starts at the top of the first page: on load, on reload, and
  // when the tab is brought back from the browser's Back/Forward memory.
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      setStep(0);
      window.scrollTo(0, 0);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);
  const draft = useFormDraft(answers, step, restore);

  const steps = useMemo(() => buildSteps(answers), [answers]);
  // The step list grows and shrinks as branches open and close, so the index
  // has to be clamped rather than trusted.
  const index = Math.min(step, steps.length - 1);
  const current = steps[index];
  // Only the step that says so — see Step.terminal.
  const isLast = Boolean(current.terminal);

  // The step list only grows as branches unlock, so `steps.length` alone would
  // read "Bước 1/1" on the first screen and make a twenty-question form look
  // like a one-pager. Project the full path instead: four steps, or three once
  // they have said they do not want a second Ban.
  const total = Math.max(
    steps.length,
    answers[NGUYEN_VONG_2] === KHONG ? 3 : 4,
  );

  const setValue = (field: Field, value: string | string[]) => {
    setAnswers((prev) => {
      const next = { ...prev, [field.name]: value };
      // Switching nguyện vọng 1 can invalidate an already-chosen nguyện vọng 2,
      // because that question never offers the Ban already picked.
      if (field.name === "nguyen_vong_1" && next[NGUYEN_VONG_2] === value) {
        delete next[NGUYEN_VONG_2];
      }
      return next;
    });
    setErrors((prev) => {
      if (!prev[field.name]) return prev;
      const next = { ...prev };
      delete next[field.name];
      return next;
    });
  };

  const validateStep = () => {
    const found: Record<string, string> = {};
    for (const field of current.fields) {
      const err = fieldError(field, answers[field.name]);
      if (err) found[field.name] = err;
    }
    setErrors(found);
    const firstBad = current.fields.find((f) => found[f.name]);
    if (firstBad) {
      document
        .querySelector(`[data-field="${firstBad.name}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(found).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep(index + 1);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goBack = () => {
    setErrors({});
    setStep(Math.max(0, index - 1));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async () => {
    if (!validateStep()) return;
    if (!ENDPOINT) {
      setSendError(
        "Form chưa được kết nối tới bảng tính. Vui lòng liên hệ ban tổ chức.",
      );
      setStatus("error");
      return;
    }

    setStatus("sending");
    setSendError(null);
    draft.flush();

    try {
      // text/plain keeps this a "simple" request, so the browser sends it
      // without a CORS preflight — Apps Script web apps do not answer OPTIONS.
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          submittedAt: new Date().toISOString(),
          answers: toSubmission(answers),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Apps Script answers 200 even when it turns an application away, so
      // the verdict is in the body, not the status.
      const reply = (await res.json().catch(() => null)) as
        | { ok: boolean; error?: string }
        | null;
      if (!reply?.ok) {
        setStatus("error");
        setSendError(
          reply?.error === "duplicate"
            ? "Email này đã được dùng để nộp đơn. Nếu em cần sửa, hãy liên hệ Fanpage Hội Sinh viên để được anh chị hỗ trợ nha!"
            : reply?.error === "closed"
              ? `Thời gian nhận đơn đã kết thúc lúc ${formatDeadline()}.`
              : "Chưa gửi được đơn. Bài làm của em vẫn được lưu — hãy thử lại sau ít phút.",
        );
        return;
      }

      setStatus("sent");
      // Only now — a draft cleared before the Sheet confirmed would take the
      // applicant's whole afternoon with it.
      clearDraft();
    } catch {
      setStatus("error");
      setSendError(
        "Chưa gửi được đơn. Bài làm của em vẫn được lưu — hãy kiểm tra kết nối và thử lại.",
      );
    }
  };

  /* --------------------------------------------------------------- closed */

  if (isClosed()) {
    return (
      <Shell>
        <Card>
          <h2 className="mb-3 font-display text-2xl font-semibold" style={{ color: T.ink }}>
            Đã hết hạn nhận đơn
          </h2>
          <p style={{ color: T.muted }}>
            Thời gian nhận đơn đã kết thúc lúc {formatDeadline()}. Hẹn gặp em ở
            mùa tuyển tiếp theo nhé!
          </p>
        </Card>
      </Shell>
    );
  }

  /* ------------------------------------------------------------ thank you */

  if (status === "sent") {
    return (
      <Shell>
        <Card>
          <div className="flex flex-col items-center text-center">
            <div
              aria-hidden="true"
              className="mb-5 grid size-14 place-items-center rounded-full text-2xl"
              style={{ backgroundColor: "#E7F5EC", color: T.ok }}
            >
              ✓
            </div>
            <h2 className="mb-3 font-display text-3xl font-semibold leading-snug" style={{ color: T.ink }}>
              Chúc mừng em đã hoàn thành phần đơn và
              <br />
              cảm ơn em đã lựa chọn Hội Sinh viên!
            </h2>
            <p className="max-w-[60ch] leading-relaxed" style={{ color: T.muted }}>
              Hãy theo dõi{" "}
              <a
                href={CONTACT.fanpage}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline underline-offset-4"
                style={{ color: T.accent }}
              >
                Fanpage của Hội Sinh viên
              </a>{" "}
              để không bỏ lỡ bất kỳ thông tin nào nhé, hẹn gặp lại em!
            </p>
          </div>
        </Card>
      </Shell>
    );
  }

  /* ----------------------------------------------------------------- form */

  return (
    <Shell>
      <div ref={topRef} className="scroll-mt-6" />


      <Card>
        {current.hint && (
          <p className="mb-6 text-sm" style={{ color: T.muted }}>
            {current.hint}
          </p>
        )}

        <div className="grid gap-7">
          {current.fields.map((field) => (
            <QuestionField
              key={field.name}
              field={field}
              value={answers[field.name]}
              error={errors[field.name] ?? null}
              onChange={(v) => setValue(field, v)}
            />
          ))}
        </div>
      </Card>

      {sendError && (
        <p
          className="mt-5 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: T.danger, backgroundColor: "#FDECEC", color: T.danger }}
        >
          {sendError}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        {index > 0 && (
        <button
          type="button"
          onClick={goBack}
          disabled={status === "sending"}
          className="rounded-full border-2 border-pink-300 bg-white px-5 py-3 font-display text-[15px] shadow-[inset_0_2px_0_rgb(255_255_255/0.9),inset_0_-3px_0_rgb(255_139_164/0.35),var(--shadow-sm)] transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
          style={{ color: T.ink }}
        >
          Quay lại
        </button>
        )}

        <button
          type="button"
          onClick={isLast ? submit : goNext}
          disabled={status === "sending"}
          className="ml-auto rounded-full px-7 py-3 font-display text-[15px] text-white shadow-[inset_0_2px_0_rgb(255_255_255/0.35),inset_0_-3px_0_rgb(120_0_40/0.25),var(--shadow-sm)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: T.accent }}
        >
          {status === "sending"
            ? "Đang gửi…"
            : isLast
              ? "Gửi đơn"
              : "Tiếp"}
        </button>
      </div>

      {/* Kept, and deliberately: this form asks people to close the tab and
          come back, which nobody does on faith. It reads as a quiet status
          line down here rather than part of a progress dashboard. */}
      <p className="mt-5 text-center">
        <SaveBadge draft={draft} />
      </p>
    </Shell>
  );
}

/* ---------------------------------------------------------------- chrome */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh w-full">
      {/* The Thế hệ 24 key visual, whole and uncropped — it already carries
          the "Tuyển Cộng tác viên" lettering, so the page heading below
          names the form rather than repeating the campaign. */}
      <div className="relative">
      <Link href="/" aria-label="Về trang chủ" className="block">
        <Image
          src="/kv/kv-banner.webp"
          alt="Tuyển Cộng tác viên — Hội Sinh viên trường Đại học Ngoại thương, thế hệ thứ 24"
          width={2880}
          height={960}
          priority
          className="h-auto w-full"
        />
      </Link>
      {/* A plain way back, on the banner's road. */}
      <Link
        href="/"
        className="absolute bottom-[calc(4%-10px)] left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/92 px-5 py-2.5 font-display text-base text-pink-700 shadow-[var(--shadow-md)] ring-2 ring-pink-200 transition-[transform,background-color] duration-300 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:bg-white sm:px-6 sm:py-3 sm:text-lg"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Về trang chủ
      </Link>
      </div>

      <div className="mx-auto w-full max-w-[1344px] px-5 py-10 sm:px-6 sm:py-14">
        <h1
          className="mb-8 text-center font-display text-[clamp(2rem,5vw,2.8rem)] leading-tight"
          style={{ color: T.ink }}
        >
          ĐƠN ỨNG TUYỂN CỘNG TÁC VIÊN
        </h1>
        {children}
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl border p-6 sm:p-8"
      style={{
        backgroundColor: T.card,
        borderColor: T.line,
        boxShadow: "0 14px 40px -24px rgba(60,45,20,0.35)",
      }}
    >
      {children}
    </section>
  );
}

/**
 * Autosave nobody can see is autosave nobody trusts — and this form asks people
 * to close the tab and come back, which they will not do on faith.
 */
function SaveBadge({ draft }: { draft: ReturnType<typeof useFormDraft> }) {
  if (!draft.persistent) {
    return (
      <span className="text-xs" style={{ color: T.danger }}>
        Không lưu được tự động — đừng đóng tab này.
      </span>
    );
  }
  if (!draft.savedAt) {
    return (
      <span className="text-xs" style={{ color: T.muted }}>
        Tự động lưu
      </span>
    );
  }
  const d = new Date(draft.savedAt);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return (
    <span className="text-xs" style={{ color: T.ok }}>
      ✓ Đã lưu lúc {hh}:{mm}
    </span>
  );
}
