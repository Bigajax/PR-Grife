import type { Metadata } from "next"
import { Suspense } from "react"
import { siteConfig } from "@/data/site.config"
import { Breadcrumb } from "@/components/Breadcrumb"
import { FavoritesView } from "./FavoritesView"

// Lista pessoal (localStorage) — não indexar.
export const metadata: Metadata = {
  title: `Favoritos | ${siteConfig.name}`,
  robots: { index: false, follow: false },
}

export default function FavoritosPage() {
  return (
    <main className="bg-bg-base">
      <div className="shell pt-8">
        <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Favoritos" }]} />
        <p className="mt-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
          Sua seleção
          <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium text-black-soft sm:text-5xl">
          Favoritos
        </h1>
      </div>

      <Suspense>
        <FavoritesView />
      </Suspense>
    </main>
  )
}
