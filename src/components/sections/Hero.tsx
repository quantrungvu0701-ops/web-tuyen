"use client";

import Image from "next/image";
import Link from "next/link";
import { FlowSection } from "@/components/scroll/FlowSection";
import { Countdown } from "@/components/ui/Countdown";
import { ApplyButton } from "@/components/ui/ApplyButton";
import { Marquee } from "@/components/ui/Marquee";
import { SmartImage } from "@/components/ui/SmartImage";
import { promoBanner, siteConfig } from "@/lib/site-config";

export function Hero({ index }: { index: number }) {
  return (
    <FlowSection
      id="hero"
      index={index}
      // The mascot already lives inside the hero artwork, so it only joins the
      // page from the About section onwards.
      anchor={{ x: 50, y: 110, hidden: true }}
      // Sized by its content rather than stretched to the viewport: the 2.7:1
      // artwork already fills most of a laptop screen, and forcing full height
      // just opened a dead gap under it.
      className="flex flex-col overflow-hidden"
    >
      <div className="relative">
        {/* The artwork is a wide 2.7:1 banner with the headline baked in, so it
            is never cropped — it sits full-bleed at its natural aspect ratio.
            Served as WebP: the source AVIF carried a fully-opaque alpha layer
            that some browsers fail to composite, rendering it invisible. */}
        <Image
          src="/hero-background.webp"
          alt="Hội Sinh viên trường Đại học Ngoại thương — Tuyển Cộng tác viên thế hệ thứ 23"
          width={2826}
          height={1044}
          priority
          className="h-auto w-full"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-4 hidden justify-center md:flex">
          <Countdown deadline={siteConfig.applicationDeadline} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 px-5 py-10 md:py-14">
        <div className="md:hidden">
          <Countdown deadline={siteConfig.applicationDeadline} />
        </div>
        <ApplyButton />
      </div>

      {/* Side-event promo strip — scrolls continuously like an ad rail. */}
      <Link
        href={promoBanner.href}
        aria-label={`Sự kiện bên lề: ${promoBanner.alt}`}
        className="group block border-y border-border bg-card"
      >
        <Marquee direction="left" duration={30} className="py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SmartImage
              key={i}
              src={promoBanner.imageSrc}
              alt=""
              placeholderLabel="[TODO] banner sự kiện bên lề — public/promo-banner.png"
              className="mx-3 h-14 w-[22rem] rounded-lg sm:h-16 sm:w-[30rem]"
            />
          ))}
        </Marquee>
      </Link>
    </FlowSection>
  );
}
