"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FlowSection, useSectionActive } from "@/components/scroll/FlowSection";
import { useAboutUsSlot } from "@/components/scroll/AboutUsMorph";
import { Marquee } from "@/components/ui/Marquee";
import { SmartImage } from "@/components/ui/SmartImage";
import { about, eventRows, supportProjects, type EventImage, type EventRow } from "@/lib/site-config";
import { reveal } from "@/lib/motion";

export function Events({ index }: { index: number }) {
  return (
    <FlowSection
      id="events"
      index={index}
      anchor={{ x: 6, y: 90, scale: 0.9, flip: true }}
      className="py-16 md:py-24"
    >
      <EventsContent />
    </FlowSection>
  );
}

function EventsContent() {
  const isActive = useSectionActive();
  const shouldReduceMotion = useReducedMotion();

  // The visible label is the floating morph element that flies in from About
  // (see AboutUsMorph); this one is an invisible placeholder that reserves
  // its line of space and anchors where the morph lands. Under reduced
  // motion there is no floating label, so this stays the real, visible one.
  const [labelEl, setLabelEl] = useState<HTMLSpanElement | null>(null);
  useAboutUsSlot("events", labelEl, 0);

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <header className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-5 text-center sm:px-6 lg:px-8">
        <motion.span
          ref={setLabelEl}
          initial={false}
          animate={{ opacity: shouldReduceMotion ? 1 : 0 }}
          transition={{ duration: 0 }}
          className="font-display text-lg font-semibold tracking-tight text-accent sm:text-xl"
        >
          {about.label}
        </motion.span>

        <motion.h2
          className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl"
          {...reveal(shouldReduceMotion, isActive, { opacity: 0, y: 20 })}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          Các sự kiện nổi bật
        </motion.h2>

        <p className="text-sm text-muted-foreground">click vào ảnh để biết thêm chi tiết</p>
      </header>

      <div className="flex flex-col gap-10 md:gap-14">
        {eventRows.map((row) => (
          <EventMarqueeRow key={row.title} row={row} />
        ))}
      </div>

      <SupportProjects />
    </div>
  );
}

function EventMarqueeRow({ row }: { row: EventRow }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <h3
        className={`mx-auto w-full max-w-6xl px-5 font-display text-xl font-semibold tracking-tight sm:px-6 sm:text-2xl lg:px-8 ${
          row.align === "right" ? "text-right" : "text-left"
        }`}
      >
        {row.title}
      </h3>

      <Marquee
        direction={row.direction}
        duration={row.images.length * 7}
        paused={activeIndex !== null}
        className="py-6"
      >
        {row.images.map((image) => (
          <EventCard
            key={image.index}
            image={image}
            isActive={activeIndex === image.index}
            onActivate={() => setActiveIndex(image.index)}
            onDeactivate={() => setActiveIndex((current) => (current === image.index ? null : current))}
          />
        ))}
      </Marquee>
    </div>
  );
}

function EventCard({
  image,
  isActive,
  onActivate,
  onDeactivate,
}: {
  image: EventImage;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <div
      className="relative mx-2 shrink-0 sm:mx-3"
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
    >
      <button
        type="button"
        aria-expanded={isActive}
        onClick={() => (isActive ? onDeactivate() : onActivate())}
        onFocus={onActivate}
        onBlur={onDeactivate}
        className="block cursor-pointer text-left"
      >
        <motion.div
          className="relative overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(36,31,28,0.12)]"
          animate={{ scale: isActive ? 1.12 : 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ zIndex: isActive ? 20 : 0 }}
        >
          <SmartImage
            src={`/images/events/${image.index}.jpg`}
            alt={image.caption}
            placeholderLabel={`[TODO] ảnh ${image.index}`}
            className="h-40 w-60 sm:h-48 sm:w-72"
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent px-3 pt-8 pb-2.5">
            <span className="line-clamp-1 text-xs font-medium text-background sm:text-sm">
              {image.caption}
            </span>
          </div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-foreground/70"
            initial={false}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ pointerEvents: isActive ? "auto" : "none" }}
          >
            <a
              href={image.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="inline-flex min-h-[44px] items-center rounded-full bg-background px-5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
            >
              See more
            </a>
          </motion.div>
        </motion.div>
      </button>
    </div>
  );
}

function SupportProjects() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-5 sm:px-6 lg:px-8">
      <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Dự án hỗ trợ sinh viên
      </h3>

      <ul className="flex flex-col items-center gap-10 sm:flex-row sm:justify-center sm:gap-16">
        {supportProjects.map((project) => (
          <li key={project.name} className="flex flex-col items-center gap-4">
            <ProjectCircle name={project.name} imageSrc={project.imageSrc} href={project.href} />
            <span className="rounded-full bg-muted px-6 py-2.5 text-sm font-semibold sm:text-base">
              {project.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectCircle({ name, imageSrc, href }: { name: string; imageSrc: string; href: string }) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <button
        type="button"
        aria-expanded={isActive}
        onClick={() => setIsActive((current) => !current)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className="block cursor-pointer overflow-hidden rounded-full shadow-[0_12px_32px_rgba(36,31,28,0.14)]"
      >
        <SmartImage
          src={imageSrc}
          alt={name}
          placeholderLabel={`[TODO] ảnh ${name}`}
          className="size-48 sm:size-60"
        />

        <motion.span
          className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/70"
          initial={false}
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ pointerEvents: isActive ? "auto" : "none" }}
        >
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex min-h-[44px] items-center rounded-full bg-background px-5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
          >
            See more
          </a>
        </motion.span>
      </button>
    </div>
  );
}
