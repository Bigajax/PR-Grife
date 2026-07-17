"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { faqItems } from "@/data/faq"
import { SectionHeading } from "@/components/SectionHeading"
import { track } from "@/lib/tracking"

export function Faq() {
  const [open, setOpen] = useState<number | null>(null)

  const toggle = (i: number) => {
    const next = open === i ? null : i
    setOpen(next)
    if (next !== null) track("faq_open", { question: faqItems[i].question })
  }

  return (
    <section id="faq" className="border-t border-border-gray bg-off-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:grid lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-24">
        <SectionHeading
          eyebrow="Dúvidas"
          title="Perguntas frequentes."
          text="Não achou a resposta? Chama no WhatsApp que a gente resolve junto."
        />

        <div className="mt-10 divide-y divide-border-gray border-y border-border-gray lg:mt-0">
          {faqItems.map((item, i) => (
            <div key={item.question}>
              <h3>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={open === i}
                  aria-controls={`faq-panel-${i}`}
                  className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-black-soft transition-colors hover:text-gold-dark"
                >
                  {item.question}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-gold-dark transition-transform duration-300 ${
                      open === i ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <div
                id={`faq-panel-${i}`}
                hidden={open !== i}
                className="pb-5 text-sm leading-relaxed text-text-gray"
              >
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
