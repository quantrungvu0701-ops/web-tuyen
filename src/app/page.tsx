import SmoothScroll from "@/components/scroll/SmoothScroll";
import LoadingReveal from "@/components/ui/loading-reveal";
import SiteNav from "@/components/ui/site-nav";
import PoleGallerySection from "@/components/ui/pole-gallery-section";
import RecruitTimeline from "@/components/ui/recruit-timeline";
import MetroDoorReveal from "@/components/ui/metro-door-reveal";
import Hero from "@/components/v24/Hero";
import About from "@/components/v24/About";
import Leaders from "@/components/v24/Leaders";
import Characters from "@/components/v24/Characters";
import FinalCta from "@/components/v24/FinalCta";
import Footer from "@/components/v24/Footer";

/**
 * One page, read top to bottom as the road on the key visual:
 * who we are → what we do → who we are as people → which role is yours →
 * how you get in → what it feels like → the light turns green.
 */
export default function Home() {
  return (
    <>
      {/* Both are position: fixed, so they stay outside SmoothScroll — its
          transform on the content would otherwise become their containing
          block and pin them to the page instead of the viewport. */}
      <LoadingReveal />
      <SiteNav />

      <SmoothScroll>
        <main>
          <Hero />
          <About />
          <PoleGallerySection />
          <Leaders />
          <Characters />
          <RecruitTimeline />
          <MetroDoorReveal />
          <FinalCta />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
