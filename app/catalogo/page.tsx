import type { Metadata } from "next"
import { Suspense } from "react"
import { siteConfig } from "@/data/site.config"
import { Breadcrumb } from "@/components/Breadcrumb"
import { CatalogView } from "./CatalogView"

export const metadata: Metadata = {
  title: `Catálogo PR Grife | Moda Masculina Multimarcas`,
  description:
    "Explore a seleção de moda masculina da PR Grife por categoria, marca, tamanho ou ocasião. Camisetas, polos, camisas, calças, jaquetas, calçados, acessórios e perfumes.",
  alternates: { canonical: "/catalogo" },
}

export default function CatalogoPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-6">
        <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Catálogo" }]} />
        <p className="mt-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
          Catálogo
          <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium text-black-soft sm:text-5xl">
          Catálogo {siteConfig.name}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-text-gray">
          Explore nossa seleção de moda masculina por categoria, marca, tamanho ou ocasião.
        </p>
      </div>

      <Suspense fallback={<CatalogFallback />}>
        <CatalogView />
      </Suspense>
    </main>
  )
}

function CatalogFallback() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] w-full bg-beige-light" />
            <div className="mt-4 h-3 w-1/3 bg-beige-light" />
            <div className="mt-2 h-3 w-2/3 bg-beige-light" />
          </div>
        ))}
      </div>
    </div>
  )
}
