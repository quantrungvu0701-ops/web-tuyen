"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { VideoCamera } from "@phosphor-icons/react";
import { FlowSection, useSectionActive } from "@/components/scroll/FlowSection";
import { useSectionFlow } from "@/components/scroll/SectionFlow";
import { ApplyButton } from "@/components/ui/ApplyButton";
import { recruitSteps, recruitVideos } from "@/lib/site-config";
import { reveal } from "@/lib/motion";

/** Zigzag: the odd points sit low, the even points sit high. */
const POINT_X = [10, 30, 50, 70, 90];
const POINT_Y = [72, 28, 72, 28, 72];

export function Recruit({ index }: { index: number }) {
  return (
    <FlowSection
      id="tuyen"
      index={index}
      anchor={{ x: 10, y: 72, scale: 0.75 }}
      className="flex flex-col items-center gap-14 py-16 md:gap-20 md:py-24"
    >
      <RecruitContent />
    </FlowSection>
  );
}

function RecruitContent() {
  const isActive = useSectionActive();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <motion.h2
        className="px-5 text-center font-display text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        {...reveal(shouldReduceMotion, isActive, { opacity: 0, y: 20 })}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        Hành trình ứng tuyển
      </motion.h2>

      <Timeline />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-5 sm:px-6 lg:px-8">
        <VideoEmbed youtubeId={recruitVideos.main.youtubeId} title={recruitVideos.main.title} />

        <div className="flex flex-col gap-5">
          <h3 className="text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {recruitVideos.mv.heading}
          </h3>
          <VideoEmbed youtubeId={recruitVideos.mv.youtubeId} title={recruitVideos.mv.title} />
        </div>

        <div className="flex justify-center">
          <ApplyButton label="Apply now" />
        </div>
      </div>
    </>
  );
}

function Timeline() {
  const { setMascotOverride } = useSectionFlow();
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const pointRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Hand the mascot the point's position as viewport percentages, which is
  // the coordinate space the follower animates in.
  const moveMascotTo = useCallback(
    (stepIndex: number) => {
      const point = pointRefs.current[stepIndex];
      if (!point) return;
      const rect = point.getBoundingClientRect();
      setMascotOverride({
        x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
        y: ((rect.top - 44) / window.innerHeight) * 100,
        scale: 0.7,
      });
      setActiveStep(stepIndex);
    },
    [setMascotOverride],
  );

  const release = useCallback(() => {
    setMascotOverride(null);
    setActiveStep(null);
  }, [setMascotOverride]);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="relative mx-auto h-64 min-w-[44rem] max-w-5xl px-5 sm:px-6 lg:px-8">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <polyline
            points={POINT_X.map((x, i) => `${x},${POINT_Y[i]}`).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="text-border"
          />
        </svg>

        {recruitSteps.map((step, i) => {
          const isStepActive = activeStep === i;
          const labelAbove = POINT_Y[i] < 50;

          return (
            <div
              key={step.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${POINT_X[i]}%`, top: `${POINT_Y[i]}%` }}
            >
              <button
                ref={(node) => {
                  pointRefs.current[i] = node;
                }}
                type="button"
                aria-expanded={isStepActive}
                onMouseEnter={() => moveMascotTo(i)}
                onMouseLeave={release}
                onFocus={() => moveMascotTo(i)}
                onBlur={release}
                onClick={() => (isStepActive ? release() : moveMascotTo(i))}
                className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-accent bg-background font-display text-sm font-semibold text-accent transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
              >
                {i + 1}
              </button>

              <div
                className={`absolute left-1/2 flex w-40 -translate-x-1/2 flex-col items-center gap-1 text-center ${
                  labelAbove ? "bottom-full mb-3" : "top-full mt-3"
                }`}
              >
                <span className="text-sm font-semibold">{step.name}</span>
                <motion.span
                  className="text-xs text-muted-foreground"
                  initial={false}
                  animate={{ opacity: isStepActive ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {step.duration}
                </motion.span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VideoEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
  // Placeholder until a real video ID is supplied — an iframe pointing at
  // "TODO_VIDEO_ID" would just render a YouTube error card.
  if (youtubeId.startsWith("TODO")) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-muted text-muted-foreground">
        <VideoCamera aria-hidden="true" weight="light" className="size-10 opacity-50" />
        <p className="px-4 text-center text-sm">[TODO] dán YouTube video ID vào site-config.ts</p>
        <p className="px-4 text-center text-xs opacity-70">{title}</p>
      </div>
    );
  }

  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
      title={title}
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="aspect-video w-full rounded-2xl border border-border"
    />
  );
}
