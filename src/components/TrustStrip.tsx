import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { trustStats } from "@/lib/site-config";

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-card/60 py-12 md:py-20">
      <Container>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {trustStats.map((stat, index) => (
            <Reveal key={stat.label} as="li" index={index}>
              <div className="flex h-full flex-col gap-1.5 rounded-2xl border border-border bg-card px-5 py-6 text-center shadow-[0_1px_2px_rgba(36,31,28,0.04)] sm:py-7">
                <span className="font-display text-3xl font-semibold text-accent tabular-nums sm:text-4xl">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
