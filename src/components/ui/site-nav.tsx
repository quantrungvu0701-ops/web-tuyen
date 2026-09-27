"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import {
  MorphingScrollNavbar,
  type MorphingScrollNavbarTheme,
  type ScrollNavLink,
} from "@/components/ui/morphing-scroll-navbar";

/**
 * Enough to clear the nav's own resting height (68px, see page.tsx) plus a
 * little air, so the section's own heading doesn't land tucked under it.
 */
const SCROLL_CLEARANCE_PX = 84;

/**
 * Sections whose ScrollTrigger pins at `start: "top top"`. Landing these with
 * the usual clearance drops you 84px SHORT of the pin, in the sliver before it
 * engages — where the stage is still in normal flow, sits 84px low, and has
 * its bottom (the gallery's dots bar) hanging under the fold. They reserve
 * their own nav clearance internally, so they want the section flush to the
 * top and the pin holding it there.
 */
const PINNED_SECTIONS = new Set(["#su-kien"]);

/**
 * Section links animate to their target with GSAP instead of the browser's
 * instant hash jump — everything on this page (bar "đơn") lives on the one
 * route, so a link never needs to leave it, only glide there.
 *
 * Routes to ScrollSmoother's own `scrollTo` where the request says to: the
 * smoother scrolls by transforming its content rather than the document, so
 * an ordinary `window.scrollTo` or `scrollIntoView` moves the real scrollbar
 * out from under the content it eases toward — the smoother's own method is
 * built to keep the two in sync. Falls back to a native smooth scroll if the
 * smoother never mounted (prefers-reduced-motion turns it off entirely; see
 * SmoothScroll.tsx), so the link still works either way.
 */
function scrollToSection(href: string, event: MouseEvent<HTMLAnchorElement>) {
  if (!href.startsWith("#")) return; // real pages ("/don") navigate as normal

  const target = document.querySelector(href);
  if (!target) return;
  event.preventDefault();

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smoother = ScrollSmoother.get();

  if (reduced || !smoother) {
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    return;
  }

  const clearance = PINNED_SECTIONS.has(href) ? 0 : SCROLL_CLEARANCE_PX;
  smoother.scrollTo(target, true, `top ${clearance}px`);
}

// Sampled from the BFF logo.
const BRAND_RED = "#E80808";
// Near-white, not the cream from the hero: the floating shell is frosted glass,
// and a saturated tint reads as a solid slab at any alpha instead of letting
// the section behind it show through.
const BAND = "#FFFCF5";

// Module constants, not inline literals: the navbar keys its scroll listener
// off `links`, so a fresh array on every render would tear that listener down
// and rebuild it continuously while scrolling.
const LINKS: ScrollNavLink[] = [
  { label: "Giới thiệu", href: "#about" },
  { label: "Các sự kiện chính", href: "#su-kien" },
  { label: "Tuyển cộng tác viên", href: "#tuyen" },
];

const THEME: MorphingScrollNavbarTheme = {
  accent: BRAND_RED,
  accentSoft: "#FF7A45",
  paper: BAND,
  surface: "#FFFCF5",
  ink: "#241F1C",
  muted: "#6B5A44",
  line: "rgba(36, 31, 28, 0.14)",
};

export default function SiteNav() {
  return (
    <MorphingScrollNavbar
      brandHref="/"
      theme={THEME}
      links={LINKS}
      onLinkClick={scrollToSection}
      brand={
        <Image
          src="/logo-bff.png"
          alt="BFF — Hội Sinh viên trường ĐH Ngoại thương"
          width={1902}
          height={827}
          className="h-9 w-auto"
        />
      }
      actions={
        <a className="msn-button msn-cta" href="/don">
          ĐIỀN ĐƠN NGAY
        </a>
      }
    />
  );
}
