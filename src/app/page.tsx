import { SectionFlowProvider } from "@/components/scroll/SectionFlow";
import { Mascot } from "@/components/scroll/Mascot";
import { NavBar } from "@/components/layout/NavBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Events } from "@/components/sections/Events";
import { BigFatFamily } from "@/components/sections/BigFatFamily";
import { Departments } from "@/components/sections/Departments";
import { Recruit } from "@/components/sections/Recruit";

export default function Home() {
  return (
    <SectionFlowProvider>
      <NavBar />
      <main className="flex-1">
        <Hero index={0} />
        <About index={1} />
        <Events index={2} />
        <BigFatFamily index={3} />
        <Departments index={4} />
        <Recruit index={5} />
      </main>
      <Mascot />
      <SiteFooter />
    </SectionFlowProvider>
  );
}
