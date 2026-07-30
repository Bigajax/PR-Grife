"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { DiamondMark } from "@/components/Logo"
import type { Product } from "@/types"
import { siteConfig } from "@/data/site.config"
import { useCatalog } from "@/components/CatalogProvider"
import { Carousel } from "@/components/Carousel"
import { ProductCard } from "@/components/ProductCard"
import { QuickViewModal } from "@/components/QuickViewModal"

const TOTAL = 10

// Curadoria manual primeiro (site.config.homeRecommended, por slug), depois
// destaques e novidades para completar. Slugs inválidos e peças esgotadas caem
// fora, então a vitrine nunca mostra buraco nem link morto.
function montarLista(products: Product[]): Product[] {
  const disponivel = (p: Product | undefined): p is Product =>
    p != null && p.stockStatus !== "out_of_stock"

  const escolhidos = siteConfig.homeRecommended
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(disponivel)

  const resto = [...products]
    .filter(disponivel)
    .sort(
      (a, b) =>
        Number(b.featured ?? false) - Number(a.featured ?? false) ||
        Number(b.newArrival ?? false) - Number(a.newArrival ?? false)
    )

  const vistos = new Set(escolhidos.map((p) => p.id))
  for (const p of resto) {
    if (escolhidos.length >= TOTAL) break
    if (!vistos.has(p.id)) {
      escolhidos.push(p)
      vistos.add(p.id)
    }
  }

  return escolhidos.slice(0, TOTAL)
}

// Vitrine curta e horizontal — sem busca, sem filtro, sem paginação.
// A grade completa continua só em /catalogo.
export function RecommendedCarousel() {
  const catalog = useCatalog()
  const lista = useMemo(() => montarLista(catalog), [catalog])
  const [quickView, setQuickView] = useState<Product | null>(null)

  if (lista.length === 0) return null

  return (
    <section className="bg-bg-surface">
      <div className="shell py-12 lg:py-20">
        <Carousel title="Recomendados para você" colado>
          {lista.map((product) => (
            <div
              key={product.id}
              className="w-[calc(100%/1.6)] border-l border-border first:border-l-0 sm:w-[calc(100%/2.6)] lg:w-[calc(100%/4.35)]"
            >
              <div className="px-3 pb-3">
                <ProductCard product={product} compact onQuickView={setQuickView} />
              </div>
            </div>
          ))}

          {/* Fecho do trilho: painel grafite com a marca da casa — um convite
              com o mesmo peso visual dos cards, não um link solto no vazio. */}
          <div className="w-[calc(100%/1.6)] border-l border-border sm:w-[calc(100%/2.6)] lg:w-[calc(100%/4.35)]">
            <Link
              href="/catalogo"
              className="group flex h-full min-h-56 flex-col items-center justify-center gap-5 bg-text-primary px-6 py-10 text-center"
            >
              <DiamondMark className="h-8 w-8" />
              <span className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand">
                  Toda a vitrine
                </span>
                <span className="font-display text-2xl font-medium leading-tight text-off-white">
                  Ver o catálogo
                  <br />
                  completo
                </span>
              </span>
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-off-white transition-all group-hover:border-accent group-hover:text-accent"
              >
                <ArrowRight
                  className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={1.6}
                />
              </span>
            </Link>
          </div>
        </Carousel>
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </section>
  )
}
