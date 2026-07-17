"use client"

import { useState } from "react"
import Image from "next/image"
import { looks } from "@/data/looks"
import { SectionHeading } from "@/components/SectionHeading"
import { Reveal } from "@/components/Reveal"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { templates } from "@/lib/whatsapp"
import { track } from "@/lib/tracking"

// Assinatura da página em fundo grafite: look completo em foto editorial +
// peças listadas por função. Desktop: split assimétrico. Mobile: carrossel.
export function Looks() {
  const [active, setActive] = useState(0)
  const look = looks[active]

  const select = (i: number) => {
    setActive(i)
    track("look_interest", { look_id: looks[i].id, kind: "view" })
  }

  return (
    <section id="looks" className="scroll-mt-20 bg-black-soft">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Monte o look" title="Um look completo. Uma presença diferente." dark />

          <div className="hidden gap-2 lg:flex" role="tablist" aria-label="Escolher look">
            {looks.map((l, i) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => select(i)}
                className={`rounded-full border px-5 py-2.5 text-[13px] font-medium transition-colors ${
                  i === active
                    ? "border-gold bg-gold text-black-soft"
                    : "border-white/25 bg-transparent text-sand hover:border-gold"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: split assimétrico */}
        <div className="mt-10 hidden gap-16 lg:grid lg:grid-cols-[1.15fr_1fr]">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden bg-graphite">
              <Image
                key={look.image}
                src={look.image}
                alt={`Look ${look.name}: peças compostas e modelo vestindo o conjunto`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div className="flex flex-col justify-center">
            <h3 className="font-display text-3xl font-medium text-off-white">{look.name}</h3>
            <p className="mt-2 text-sm text-sand">{look.context}</p>

            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {look.pieces.map((piece) => (
                <li key={piece.role} className="flex items-baseline justify-between gap-6 py-3.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                    {piece.role}
                  </span>
                  <span className="text-right text-sm text-off-white">{piece.name}</span>
                </li>
              ))}
            </ul>

            <div className="mt-9">
              <WhatsAppCta
                message={templates.look(look)}
                event="look_interest"
                payload={{ look_id: look.id, kind: "whatsapp" }}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-7 text-sm font-semibold text-black-soft transition-colors hover:bg-gold-dark hover:text-off-white"
              >
                Consultar look completo
              </WhatsAppCta>
            </div>
          </div>
        </div>

        {/* Mobile: carrossel */}
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 no-scrollbar lg:hidden">
          {looks.map((l) => (
            <article key={l.id} className="w-[86vw] max-w-sm shrink-0 snap-center">
              <div className="relative aspect-[4/5] overflow-hidden bg-graphite">
                <Image
                  src={l.image}
                  alt={`Look ${l.name}: peças compostas e modelo vestindo o conjunto`}
                  fill
                  sizes="86vw"
                  className="object-cover"
                />
              </div>
              <h3 className="font-display mt-4 text-2xl font-medium text-off-white">{l.name}</h3>
              <p className="mt-1 text-sm text-sand">{l.context}</p>
              <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
                {l.pieces.slice(0, 4).map((piece) => (
                  <li key={piece.role} className="flex items-baseline justify-between gap-4 py-2.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
                      {piece.role}
                    </span>
                    <span className="text-right text-[13px] text-off-white">{piece.name}</span>
                  </li>
                ))}
              </ul>
              <WhatsAppCta
                message={templates.look(l)}
                event="look_interest"
                payload={{ look_id: l.id, kind: "whatsapp" }}
                className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-gold px-6 text-sm font-semibold text-black-soft"
              >
                Consultar look completo
              </WhatsAppCta>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
