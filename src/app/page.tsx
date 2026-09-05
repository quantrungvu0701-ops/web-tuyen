import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { Benefits } from "@/components/Benefits";
import { Departments } from "@/components/Departments";
import { SocialProof } from "@/components/SocialProof";
import { Timeline } from "@/components/Timeline";
import { Faq } from "@/components/Faq";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { StickyMobileCta } from "@/components/StickyMobileCta";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <Benefits />
        <Departments />
        <SocialProof />
        <Timeline />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
