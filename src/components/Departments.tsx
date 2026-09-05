import { Confetti, Globe, Megaphone } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/Container";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/ui/Reveal";
import { departments } from "@/lib/site-config";

const ICONS = [Confetti, Globe, Megaphone];

export function Departments() {
  return (
    <section className="bg-card/60 py-12 md:py-20">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-4 pb-10 md:pb-14">
            <Kicker>Các ban tuyển thành viên</Kicker>
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Bạn sẽ thấy mình phù hợp ở đâu?
            </h2>
          </div>
        </Reveal>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {departments.map((dept, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <Reveal key={dept.name} as="li" index={index} className="h-full">
                <div className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-7 shadow-[0_1px_2px_rgba(36,31,28,0.04)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(36,31,28,0.08)]">
                  <span className="flex size-11 items-center justify-center rounded-full bg-accent-tint text-accent">
                    <Icon aria-hidden="true" weight="bold" className="size-5" />
                  </span>
                  <div className="flex flex-col gap-2.5">
                    <h3 className="font-display text-2xl font-semibold">{dept.name}</h3>
                    <p className="text-[15px] leading-relaxed text-muted-foreground">
                      {dept.description}
                    </p>
                  </div>
                  <ul className="mt-auto flex flex-wrap gap-2 pt-2">
                    {dept.skills.map((skill) => (
                      <li
                        key={skill}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
