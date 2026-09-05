"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

const CALM_EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger index — multiplied by 0.08s and added to the base delay. */
  index?: number;
  delay?: number;
  as?: "div" | "li";
};

/**
 * Fade + slide-up on scroll entrance. Respects prefers-reduced-motion by
 * skipping the animation entirely rather than just shortening it.
 */
export function Reveal({ children, className, index = 0, delay = 0, as = "div" }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = as === "li" ? motion.li : motion.div;

  if (shouldReduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.6, delay: delay + index * 0.08, ease: CALM_EASE }}
    >
      {children}
    </MotionTag>
  );
}
