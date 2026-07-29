"use client"

import { useState } from "react"
import Link from "next/link"
import type { Product } from "@/types"
import { products, productById } from "@/data/products"
import { siteConfig } from "@/data/site.config"
import { Carousel } from "@/components/Carousel"
import { ProductCard } from "@/components/ProductCard"
import { QuickViewModal } from "@/components/QuickViewModal"

const TOTAL = 10

// Curadoria manual primeiro (site.config.homeRecommended), depois destaques e
// novidades para completar. Ids inválidos e peças esgotadas caem fora, então a
// vitrine nunca mostra buraco nem link morto.
function montarLista(): Product[] {
  const disponivel = (p: Product | undefined): p is Product =>
    p != null && p.stockStatus !== "out_of_stock"

  const escolhidos = siteConfig.homeRecommended.map(productById).filter(disponivel)

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

const lista = montarLista()

// Vitrine curta e horizontal — sem busca, sem filtro, sem paginação.
// A grade completa continua só em /catalogo.
export function RecommendedCarousel() {
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

          {/* Último slide leva ao catálogo, em vez de terminar em nada. */}
          <div className="w-[calc(100%/1.6)] border-l border-border sm:w-[calc(100%/2.6)] lg:w-[calc(100%/4.35)]">
            <Link
              href="/catalogo"
              className="flex h-full min-h-56 items-center justify-center bg-bg-elevated px-4 text-center text-sm font-semibold text-text-primary underline underline-offset-4 transition-colors hover:text-accent-strong"
            >
              Ver catálogo completo
            </Link>
          </div>
        </Carousel>
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </section>
  )
}
