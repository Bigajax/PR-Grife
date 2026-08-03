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

/** Só entra no trilho quem é do departamento Kits — o look inteiro, nunca a peça avulsa. */
const CATEGORIA_KIT = "kits"

// Curadoria manual primeiro (site.config.homeKits, por slug), depois os demais
// kits por destaque e novidade. Slugs inválidos, peças esgotadas e qualquer
// produto que não seja kit caem fora, então a vitrine nunca mostra buraco,
// link morto nem peça solta no meio dos looks.
function montarLista(products: Product[]): Product[] {
  const kitDisponivel = (p: Product | undefined): p is Product =>
    p != null && p.category === CATEGORIA_KIT && p.stockStatus !== "out_of_stock"

  const escolhidos = siteConfig.homeKits
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(kitDisponivel)

  const resto = [...products]
    .filter(kitDisponivel)
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
// A grade completa continua só em /catalogo. Sem kit cadastrado, a seção
// desaparece da home em vez de completar o trilho com peças avulsas.
export function KitsCarousel() {
  const catalog = useCatalog()
  const lista = useMemo(() => montarLista(catalog), [catalog])
  const [quickView, setQuickView] = useState<Product | null>(null)

  if (lista.length === 0) return null

  return (
    <section className="bg-bg-surface">
      <div className="shell py-12 lg:py-20">
        <Carousel title="Kits da casa" colado>
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

          {/* Fecho do trilho: card transparente com a marca da casa — mesma
              composição dos cards de marca, sem bloco de cor (pedido do
              proprietário: nada de painel escuro aqui). */}
          <div className="w-[calc(100%/1.6)] border-l border-border sm:w-[calc(100%/2.6)] lg:w-[calc(100%/4.35)]">
            <Link
              href="/catalogo/kits"
              className="group flex h-full min-h-56 flex-col items-center justify-center gap-5 px-6 py-10 text-center"
            >
              <DiamondMark className="h-8 w-8" />
              <span className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
                  Look inteiro
                </span>
                <span className="font-display text-2xl font-medium leading-tight text-text-primary">
                  Ver todos
                  <br />
                  os kits
                </span>
              </span>
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-text-primary/30 text-text-primary transition-all group-hover:border-accent-strong group-hover:text-accent-strong"
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
