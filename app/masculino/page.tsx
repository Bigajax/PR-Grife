import type { Metadata } from "next"
import { Suspense } from "react"
import { siteConfig } from "@/data/site.config"
import { Breadcrumb } from "@/components/Breadcrumb"
import { CatalogView } from "@/app/catalogo/CatalogView"

export const metadata: Metadata = {
  title: `Masculino | ${siteConfig.name}`,
  description:
    "Moda masculina multimarcas na PR Grife — camisetas, polos, camisas, calças, jaquetas, calçados e perfumaria com curadoria e atendimento personalizado.",
  alternates: { canonical: "/masculino" },
}

export default function MasculinoPage() {
  return (
    <main className="bg-white">
      <div className="shell pt-8">
        <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Masculino" }]} />
        <p className="mt-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
          Masculino
          <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium text-black-soft sm:text-5xl">
          Moda masculina
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-text-gray">
          A curadoria masculina da PR Grife. Filtre por categoria, marca, tamanho e cor.
        </p>
      </div>

      <Suspense>
        <CatalogView locked={{ genero: "masculino" }} />
      </Suspense>
    </main>
  )
}
