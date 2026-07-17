import Link from "next/link"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { templates } from "@/lib/whatsapp"
import { DiamondMark } from "@/components/Logo"
import { Reveal } from "@/components/Reveal"

export function FinalCta() {
  return (
    <section className="bg-graphite">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-28">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <DiamondMark className="h-8 w-8" />
          <h2 className="font-display mt-6 text-4xl font-medium leading-tight text-off-white sm:text-5xl">
            Sua próxima escolha começa aqui.
          </h2>
          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <WhatsAppCta
              message={templates.atendimentoGeral()}
              event="hero_whatsapp_click"
              payload={{ placement: "cta_final" }}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-8 text-sm font-semibold text-black-soft transition-colors hover:bg-gold-dark hover:text-off-white"
            >
              Receber atendimento
            </WhatsAppCta>
            <Link
              href="#novidades"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-off-white/30 px-8 text-sm font-semibold text-off-white transition-colors hover:border-gold"
            >
              Ver novidades
            </Link>
          </div>
          <p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-sand">
            Moda masculina multimarcas • Entrega para todo o Brasil
          </p>
        </Reveal>
      </div>
    </section>
  )
}
