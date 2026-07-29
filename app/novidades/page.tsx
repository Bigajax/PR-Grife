import type { Metadata } from "next"
import { Suspense } from "react"
import { siteConfig } from "@/data/site.config"
import { Breadcrumb } from "@/components/Breadcrumb"
import { CatalogView } from "@/app/catalogo/CatalogView"

export const metadata: Metadata = {
  title: `Novidades | ${siteConfig.name}`,
  description:
    "As peças que acabaram de chegar na PR Grife — novidades selecionadas toda semana, com atendimento personalizado pelo WhatsApp.",
  alternates: { canonical: "/novidades" },
}

export default function NovidadesPage() {
  return (
    <main className="bg-white">
      <div className="shell pt-8">
        <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Novidades" }]} />
        <p className="mt-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
          Novidades
          <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium text-black-soft sm:text-5xl">
          Acabou de chegar
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-text-gray">
          As peças mais recentes da curadoria PR Grife.
        </p>
      </div>

      <Suspense>
        <CatalogView locked={{ novidades: true }} />
      </Suspense>
    </main>
  )
}
