"use client";

import { useId, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { Container } from "@/components/ui/Container";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/ui/Reveal";
import { faqItems } from "@/lib/site-config";

function FaqAccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const panelId = `${baseId}-panel`;

  return (
    <div className="border-b border-border">
      <h3>
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full min-h-[44px] items-center justify-between gap-4 py-5 text-left cursor-pointer"
        >
          <span className="font-display text-lg font-semibold sm:text-xl">{question}</span>
          <CaretDown
            aria-hidden="true"
            weight="bold"
            className={`size-5 shrink-0 text-accent transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!isOpen}
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-12 md:py-20">
      <Container size="text">
        <Reveal>
          <div className="flex flex-col gap-4 pb-10 md:pb-14">
            <Kicker>Câu hỏi thường gặp</Kicker>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Còn băn khoăn? Có thể câu trả lời ở đây.
            </h2>
          </div>
        </Reveal>

        <Reveal>
          <div>
            {faqItems.map((item, index) => (
              <FaqAccordionItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
