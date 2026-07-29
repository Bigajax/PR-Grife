import type { Metadata } from "next"
import { Suspense } from "react"
import { siteConfig } from "@/data/site.config"
import { Breadcrumb } from "@/components/Breadcrumb"
import { CatalogView } from "@/app/catalogo/CatalogView"

export const metadata: Metadata = {
  title: `Ofertas | ${siteConfig.name}`,
  description:
    "Condições especiais na PR Grife — peças selecionadas com preço reduzido, confirmadas no atendimento pelo WhatsApp.",
  alternates: { canonical: "/ofertas" },
}

export default function OfertasPage() {
  return (
    <main className="bg-white">
      <div className="shell pt-8">
        <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Ofertas" }]} />
        <p className="mt-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
          Ofertas
          <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium text-black-soft sm:text-5xl">
          Condições especiais
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-text-gray">
          Somente peças com preço reduzido de verdade — sem desconto inventado.
        </p>
      </div>

      <Suspense>
        <CatalogView locked={{ oferta: true }} />
      </Suspense>
    </main>
  )
}
