import Image from "next/image";
import LoadingReveal from "@/components/ui/loading-reveal";
import SiteNav from "@/components/ui/site-nav";
import AboutUsCarReveal from "@/components/ui/about-us-car-reveal";
import PoleGallerySection from "@/components/ui/pole-gallery-section";
import RecruitmentTrafficLight from "@/components/ui/recruitment-traffic-light";
import RecruitTimeline from "@/components/ui/recruit-timeline";
import MetroDoorReveal from "@/components/ui/metro-door-reveal";
import SkblBanner from "@/components/ui/skbl-banner";
import SiteFooter from "@/components/ui/site-footer";

export default function HeroPreviewPage() {
  return (
    <>
      <LoadingReveal />

      <SiteNav />

      {/* 90px = the nav band's measured height, so band + hero fill exactly one
          viewport. */}
      <section className="relative h-[calc(100vh-90px)] w-full overflow-hidden">
        <Image
          src="/hero-background.webp"
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          className="object-cover"
        />
      </section>

      <SkblBanner />

      <AboutUsCarReveal />

      <PoleGallerySection />

      <RecruitmentTrafficLight />

      <RecruitTimeline />

      <MetroDoorReveal />

      <SiteFooter />

    </>
  );
}
