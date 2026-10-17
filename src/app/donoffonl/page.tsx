import type { Metadata } from "next";
import LoadingReveal from "@/components/ui/loading-reveal";
import Hero from "@/components/v24/Hero";

export const metadata: Metadata = {
  title: "Tuyển Cộng tác viên Thế hệ thứ 24 | HSV FTU",
  // Shared by its own link only: nothing on the main site points here, and
  // search engines are asked to leave it out too.
  robots: { index: false, follow: false },
};

/**
 * The main site's hero on its own: the moving scene, the countdown and one
 * button to this link's form. No nav, no sections below: the hero is exactly
 * one screen tall, so there is nothing to scroll. Scrolling is not locked, so
 * a window too short for the hero can still reach the button.
 */
export default function DonOffOnlPage() {
  return (
    <>
      <LoadingReveal />
      <main>
        <Hero applyHref="/donoffonl/don" journey={false} />
      </main>
    </>
  );
}
