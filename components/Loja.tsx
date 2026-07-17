"use client"

import Image from "next/image"
import { MapPin, Clock } from "lucide-react"
import { siteConfig } from "@/data/site.config"
import { SectionHeading } from "@/components/SectionHeading"
import { Reveal } from "@/components/Reveal"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { templates } from "@/lib/whatsapp"
import { track } from "@/lib/tracking"

export function Loja() {
  return (
    <section id="loja" className="scroll-mt-20 bg-off-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20 lg:py-28">
        <div className="order-2 lg:order-1">
          <SectionHeading
            eyebrow="Nossa loja"
            title="Conheça a PR Grife."
            text={`Há ${siteConfig.yearsActive} anos, a PR Grife evolui sua curadoria para oferecer uma seleção multimarcas de alto padrão, acompanhada de um atendimento próximo e personalizado. Venha tomar um café e experimentar com calma.`}
          />

          <dl className="mt-8 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-dark" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <dt className="font-semibold text-black-soft">Endereço</dt>
                <dd className="mt-0.5 text-text-gray">{siteConfig.address}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-dark" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <dt className="font-semibold text-black-soft">Horário</dt>
                <dd className="mt-0.5 text-text-gray">{siteConfig.hours}</dd>
              </div>
            </div>
          </dl>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={siteConfig.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("location_click")}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-black-soft px-7 text-sm font-semibold text-off-white transition-colors hover:bg-graphite"
            >
              Abrir localização
            </a>
            <WhatsAppCta
              message={templates.atendimentoGeral()}
              event="hero_whatsapp_click"
              payload={{ placement: "loja" }}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-black-soft px-7 text-sm font-semibold text-black-soft transition-colors hover:border-gold-dark hover:text-gold-dark"
            >
              Falar com a loja
            </WhatsAppCta>
          </div>
        </div>

        <Reveal className="relative order-1 lg:order-2">
          <div className="relative aspect-[4/5] max-w-md overflow-hidden bg-sand lg:ml-auto">
            {/* TODO_CONFIRMAR — substituir por fotos oficiais do espaço da loja */}
            <Image
              src="/images/loja.jpg"
              alt="Interior da PR Grife em Maringá, com clientes sendo atendidos no balcão"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div
            className="absolute -bottom-4 -left-4 -z-10 hidden h-full w-full border border-gold/50 lg:block"
            aria-hidden="true"
          />
        </Reveal>
      </div>
    </section>
  )
}
