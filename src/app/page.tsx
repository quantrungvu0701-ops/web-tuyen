import Image from "next/image";
import SmoothScroll from "@/components/scroll/SmoothScroll";
import LoadingReveal from "@/components/ui/loading-reveal";
import SiteNav from "@/components/ui/site-nav";
import AboutHsv from "@/components/ui/about-hsv";
import CountdownTrafficLight from "@/components/ui/countdown-traffic-light";
import PoleGallerySection from "@/components/ui/pole-gallery-section";
import RecruitmentTrafficLight from "@/components/ui/recruitment-traffic-light";
import RecruitTimeline from "@/components/ui/recruit-timeline";
import MetroDoorReveal from "@/components/ui/metro-door-reveal";
import SiteFooter from "@/components/ui/site-footer";

export default function Home() {
  return (
    <>
      {/* Both are position: fixed, so they stay outside SmoothScroll — its
          transform on the content would otherwise become their containing
          block and pin them to the page instead of the viewport. */}
      <LoadingReveal />

      <SiteNav />

      <SmoothScroll>
        {/* The nav is a fixed overlay with no background at rest, so without this
            its links sit directly on top of the hero artwork. 68px = the resting
            shell's own measured height, no extra breathing room. Filled with the
            page's own background colour rather than the hero photo's sampled
            edge tone, per the site-wide unification — may leave a faint seam
            against the hero image if its true top-row colour drifts from this. */}
        <div aria-hidden="true" className="h-[68px] w-full" style={{ backgroundColor: "#FEF6E6" }} />

        <section className="relative h-[calc(100vh-68px)] w-full overflow-hidden">
          <Image
            src="/hero-background.webp"
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            className="object-cover"
          />

          {/* Sits in the clear band the artwork leaves below the banner. */}
          <div className="absolute inset-x-0 bottom-[12%] flex justify-center px-6">
            <CountdownTrafficLight />
          </div>
        </section>

        <AboutHsv />

        <PoleGallerySection />

        <RecruitTimeline />

        <RecruitmentTrafficLight />

        <MetroDoorReveal />

        <SiteFooter />
      </SmoothScroll>
    </>
  );
}
