"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Kicker } from "@/components/ui/Kicker";
import { CtaButton } from "@/components/ui/CtaButton";
import { Countdown } from "@/components/Countdown";
import { siteConfig } from "@/lib/site-config";

const CALM_EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const item = (index: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.1 + index * 0.1, ease: CALM_EASE },
        };

  return (
    <section className="relative overflow-hidden pt-16 pb-16 sm:pt-20 md:pt-28 md:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-accent/10 blur-3xl sm:h-96 sm:w-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-40 left-[-15%] h-64 w-64 rounded-full bg-accent/5 blur-3xl"
      />

      <Container size="text" className="relative flex flex-col items-start gap-7 md:gap-8">
        <motion.div {...item(0)}>
          <Kicker>{siteConfig.orgName}</Kicker>
        </motion.div>

        <motion.h1
          {...item(1)}
          className="font-display text-[2.75rem] leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl"
        >
          Nơi hành trình sinh viên{" "}
          <span className="italic text-accent">của bạn</span> bắt đầu.
        </motion.h1>

        <motion.p {...item(2)} className="max-w-xl text-lg text-muted-foreground sm:text-xl">
          {siteConfig.orgShortName} đồng hành cùng tân sinh viên{" "}
          {siteConfig.freshmanCohort} từ những ngày đầu tiên tại Ngoại thương.
        </motion.p>

        <motion.div {...item(3)} className="flex flex-col gap-3">
          <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Hạn đăng ký còn lại
          </span>
          <Countdown deadline={siteConfig.applicationDeadline} />
        </motion.div>

        <motion.div {...item(4)}>
          <CtaButton />
        </motion.div>
      </Container>
    </section>
  );
}
