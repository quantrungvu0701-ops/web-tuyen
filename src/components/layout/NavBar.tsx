"use client";

import Link from "next/link";
import { Fire } from "@phosphor-icons/react";
import { useOptionalSectionFlow } from "@/components/scroll/SectionFlow";
import { siteConfig } from "@/lib/site-config";

const LINK_CLASS =
  "inline-flex min-h-[44px] items-center px-2 text-xs font-semibold tracking-wide transition-colors duration-200 hover:text-accent sm:px-3 sm:text-sm";

export function NavBar() {
  const flow = useOptionalSectionFlow();

  // On the home page the in-page links drive the section flow; from the
  // standalone pages they fall back to a hash link back home.
  const sectionLink = (id: string, label: string) =>
    flow ? (
      <button key={id} type="button" onClick={() => flow.goToSection(id)} className={`${LINK_CLASS} cursor-pointer`}>
        {label}
      </button>
    ) : (
      <Link key={id} href={`/#${id}`} className={LINK_CLASS}>
        {label}
      </Link>
    );

  return (
    // Kept in the document flow rather than overlaid: the hero artwork carries
    // its own title bar, so floating the menu on top of it reads as clutter.
    <header className="relative z-40 bg-background">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        {/* TODO: swap the wordmark for the real HSV FTU logo file when supplied. */}
        <Link
          href="/"
          className="flex min-h-[44px] items-center font-display text-base font-semibold tracking-tight whitespace-nowrap sm:text-xl"
        >
          {siteConfig.orgShortName}
        </Link>

        <div className="flex items-center sm:gap-1">
          <Link href="/skbl" className={`${LINK_CLASS} gap-1.5 text-accent hover:text-accent-hover`}>
            <Fire aria-hidden="true" weight="fill" className="size-4" />
            SKBL
          </Link>
          {sectionLink("about", "About")}
          {sectionLink("tuyen", "Tuyển")}
          <Link href="/gallery" className={LINK_CLASS}>
            Gallery
          </Link>
        </div>
      </nav>
    </header>
  );
}
