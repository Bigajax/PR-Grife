"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { useFavorites } from "@/hooks/useFavorites"
import { useCatalog } from "@/components/CatalogProvider"
import { ProductCard } from "@/components/ProductCard"

// Grade dos favoritados (coração nos cards). A lista vive no localStorage —
// só renderiza depois da hidratação para o servidor e o cliente não divergirem.
export function FavoritesView() {
  const { ids, count } = useFavorites()
  const catalog = useCatalog()
  const [ready, setReady] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setReady(true), [])

  const favoritos = ready
    ? ids
        .map((id) => catalog.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => p != null)
    : []

  return (
    <div className="shell pb-20 pt-8">
      {!ready ? null : favoritos.length > 0 ? (
        <>
          <p className="text-[13px] text-text-secondary">
            {count} {count === 1 ? "peça favoritada" : "peças favoritadas"} — toque no coração
            para remover.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
            {favoritos.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="border border-border bg-bg-elevated p-10 text-center">
          <Heart className="mx-auto h-8 w-8 text-accent" strokeWidth={1.2} aria-hidden="true" />
          <p className="font-display mt-4 text-2xl text-black-soft">Nenhum favorito ainda.</p>
          <p className="mt-2 text-sm text-text-secondary">
            Toque no coração de qualquer peça para guardá-la aqui.
          </p>
          <Link
            href="/catalogo"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-text-primary px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Explorar o catálogo
          </Link>
        </div>
      )}
    </div>
  )
}
