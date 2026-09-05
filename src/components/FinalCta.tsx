import { Container } from "@/components/ui/Container";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { Countdown } from "@/components/Countdown";
import { siteConfig } from "@/lib/site-config";

export function FinalCta() {
  return (
    <section className="bg-foreground py-16 text-background md:py-24">
      <Container size="text">
        <Reveal className="flex flex-col items-start gap-7 md:items-center md:text-center">
          <Kicker>Đừng để lỡ cơ hội này</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Hành trình của bạn tại {siteConfig.orgShortName} bắt đầu từ một cú click.
          </h2>
          <div className="flex flex-col items-start gap-3 md:items-center">
            <span className="text-xs font-semibold tracking-[0.14em] text-background/70 uppercase">
              Hạn đăng ký còn lại
            </span>
            <Countdown deadline={siteConfig.applicationDeadline} inverted />
          </div>
          <CtaButton />
        </Reveal>
      </Container>
    </section>
  );
}
