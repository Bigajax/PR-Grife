import Image from "next/image"
import Link from "next/link"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { templates } from "@/lib/whatsapp"
import { siteConfig } from "@/data/site.config"
import { DiamondMark } from "@/components/Logo"

// TODO_CONFIRMAR — substituir pela foto oficial produzida para o hero (desktop e vertical mobile).
const trust = ["Entrega nacional", "Loja física em Maringá", "Atendimento personalizado"]

function HeroCtas({ full = false }: { full?: boolean }) {
  const width = full ? "w-full sm:w-auto" : ""
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link
        href="/catalogo"
        className={`inline-flex min-h-12 items-center justify-center rounded-full bg-black-soft px-7 text-sm font-semibold text-off-white transition-colors hover:bg-graphite ${width}`}
      >
        Explorar catálogo
      </Link>
      <WhatsAppCta
        message={templates.atendimentoGeral()}
        event="hero_whatsapp_click"
        payload={{ placement: "hero" }}
        className={`inline-flex min-h-12 items-center justify-center rounded-full border border-border-gray bg-white px-7 text-sm font-semibold text-black-soft transition-colors hover:border-gold ${width}`}
      >
        Receber atendimento
      </WhatsAppCta>
    </div>
  )
}

function TrustRow() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium uppercase tracking-[0.14em] text-text-gray">
      {trust.map((t) => (
        <li key={t} className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" /> {t}
        </li>
      ))}
    </ul>
  )
}

export function Hero() {
  return (
    <section id="inicio" className="relative bg-off-white">
      {/* MOBILE: imagem cinematográfica com título sobreposto */}
      <div className="lg:hidden">
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/10]">
          <Image
            src="/images/hero.jpg"
            alt="Estevão, da PR Grife, vestindo look completo com jaqueta jeans e apresentando um perfume da loja"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black-soft/85 via-black-soft/35 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
            <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              Moda masculina multimarcas
              <span className="h-px w-10 bg-gold/70" aria-hidden="true" />
            </p>
            <h1 className="font-display mt-3 text-[2.6rem] font-medium leading-[1.03] text-off-white">
              Vista a sua
              <br />
              melhor versão.
            </h1>
          </div>
        </div>

        <div className="px-5 pb-12 pt-6">
          <p className="max-w-md text-[15px] leading-relaxed text-text-gray">
            Multimarcas de alto padrão, peças selecionadas e um atendimento personalizado para
            ajudar você a encontrar o look certo.
          </p>
          <div className="mt-6">
            <HeroCtas full />
          </div>
          <div className="mt-6">
            <TrustRow />
          </div>
          <p className="mt-8 flex items-center gap-3 text-sm text-text-gray">
            <DiamondMark className="h-4 w-4" />
            <span>
              <strong className="font-semibold text-black-soft">{siteConfig.yearsActive} anos</strong>{" "}
              construindo estilo e autoestima.
            </span>
          </p>
        </div>
      </div>

      {/* DESKTOP: split editorial texto + foto */}
      <div className="mx-auto hidden max-w-6xl grid-cols-[1.05fr_1fr] items-stretch px-0 lg:grid lg:min-h-[82vh]">
        <div className="flex flex-col justify-center py-24 pl-6 pr-16">
          <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-dark">
            Moda masculina multimarcas
            <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
          </p>
          <h1 className="font-display mt-6 text-[4.2rem] font-medium leading-[1.05] text-black-soft">
            Vista a sua
            <br />
            melhor versão.
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-text-gray">
            Multimarcas de alto padrão, peças selecionadas e um atendimento personalizado para
            ajudar você a encontrar o look certo.
          </p>
          <div className="mt-8">
            <HeroCtas />
          </div>
          <div className="mt-6">
            <TrustRow />
          </div>
          <p className="mt-10 flex items-center gap-3 text-sm text-text-gray">
            <DiamondMark className="h-4 w-4" />
            <span>
              <strong className="font-semibold text-black-soft">{siteConfig.yearsActive} anos</strong>{" "}
              construindo estilo e autoestima.
            </span>
          </p>
        </div>

        <div className="relative">
          <Image
            src="/images/hero.jpg"
            alt=""
            fill
            priority
            sizes="45vw"
            className="object-cover object-top"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}
