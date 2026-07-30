"use client"

import { createContext, useContext } from "react"
import type { Product } from "@/types"

/**
 * Distribui o catálogo (buscado no servidor pelo layout, via
 * lib/products/db.ts) para os client components que antes importavam o array
 * estático — CatalogView, busca do header, seleção, recomendados.
 */

const CatalogContext = createContext<Product[]>([])

export function useCatalog(): Product[] {
  return useContext(CatalogContext)
}

/** Resolve um produto pelo id — troca direta do antigo productById. */
export function useProductLookup(): (id: string) => Product | undefined {
  const products = useCatalog()
  return (id: string) => products.find((p) => p.id === id)
}

export function CatalogProvider({
  products,
  children,
}: {
  products: Product[]
  children: React.ReactNode
}) {
  return <CatalogContext.Provider value={products}>{children}</CatalogContext.Provider>
}
