import { Container } from "@/components/ui/Container";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/ui/Reveal";
import { timelineSteps } from "@/lib/site-config";

export function Timeline() {
  return (
    <section className="bg-card/60 py-12 md:py-20">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-4 pb-10 md:pb-14">
            <Kicker>Quy trình ứng tuyển</Kicker>
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Bốn bước để trở thành thành viên HSV FTU.
            </h2>
          </div>
        </Reveal>

        {/* Mobile: vertical timeline */}
        <ol className="relative flex flex-col gap-9 border-l border-border pl-8 md:hidden">
          {timelineSteps.map((step, index) => (
            <Reveal key={step.title} as="li" index={index} className="relative">
              <span className="absolute top-0 -left-[calc(2rem+1px)] flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground tabular-nums">
                {index + 1}
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold tracking-wide text-accent uppercase">
                  {step.date}
                </span>
                <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>

        {/* Desktop: horizontal timeline */}
        <ol className="relative hidden md:grid md:grid-cols-4 md:gap-6">
          <div
            aria-hidden="true"
            className="absolute top-5 right-0 left-0 h-px bg-border"
            style={{ marginInline: "1.25rem" }}
          />
          {timelineSteps.map((step, index) => (
            <Reveal key={step.title} as="li" index={index} className="relative flex flex-col gap-4">
              <span className="relative z-10 flex size-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground tabular-nums">
                {index + 1}
              </span>
              <div className="flex flex-col gap-1.5 pr-4">
                <span className="text-xs font-semibold tracking-wide text-accent uppercase">
                  {step.date}
                </span>
                <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
