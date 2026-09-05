import { Image as ImageIcon, Quotes } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/Container";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/ui/Reveal";
import { testimonials } from "@/lib/site-config";

// TODO: replace every placeholder block below with real event/member photos
// (square or 4:5 crops work best with this grid). Do not use stock photography.
const PHOTO_PLACEHOLDER_COUNT = 6;

export function SocialProof() {
  return (
    <section className="py-12 md:py-20">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-4 pb-10 md:pb-14">
            <Kicker>Con người thật, câu chuyện thật</Kicker>
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Không phải hình minh họa — đây là HSV FTU.
            </h2>
          </div>
        </Reveal>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {Array.from({ length: PHOTO_PLACEHOLDER_COUNT }).map((_, index) => (
            <Reveal key={index} as="li" index={index % 3}>
              {/* TODO: replace with real event photos */}
              <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground shadow-[0_1px_2px_rgba(36,31,28,0.04)]">
                <ImageIcon aria-hidden="true" weight="light" className="size-8 opacity-50" />
                <span className="sr-only">Chỗ trống cho ảnh sự kiện thật</span>
              </div>
            </Reveal>
          ))}
        </ul>

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3 md:mt-14">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name + index} as="li" index={index}>
              <figure className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(36,31,28,0.04)]">
                <Quotes aria-hidden="true" weight="fill" className="size-6 text-accent/40" />
                <blockquote className="flex-1 text-[15px] leading-relaxed text-foreground/90 italic">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="flex flex-col text-sm">
                  <span className="font-semibold">{testimonial.name}</span>
                  <span className="text-muted-foreground">{testimonial.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
