import {
  CalendarCheck,
  Handshake,
  IdentificationCard,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/Container";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/ui/Reveal";
import { benefits } from "@/lib/site-config";

const ICONS = [CalendarCheck, Handshake, IdentificationCard, UsersThree];

export function Benefits() {
  return (
    <section className="py-12 md:py-20">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-4 pb-10 md:pb-14">
            <Kicker>Vào Hội để làm gì</Kicker>
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Những gì bạn mang theo sau một năm gắn bó.
            </h2>
          </div>
        </Reveal>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <Reveal key={benefit.title} as="li" index={index}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(36,31,28,0.04)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(36,31,28,0.08)] sm:p-7">
                  <span className="flex size-11 items-center justify-center rounded-full bg-accent-tint text-accent">
                    <Icon aria-hidden="true" weight="bold" className="size-5" />
                  </span>
                  <h3 className="font-display text-xl font-semibold">{benefit.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
