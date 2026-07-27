"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/types";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion type="single" collapsible className="ind-panel px-5">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="border-[rgb(242_240_235_/_0.08)]"
        >
          <AccordionTrigger className="font-display text-left text-base font-semibold tracking-wide uppercase hover:no-underline hover:text-primary">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-[rgb(242_240_235_/_0.5)]">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
