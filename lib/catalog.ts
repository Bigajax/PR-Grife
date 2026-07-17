import type { Product } from "@/types"
import { products } from "@/data/products"
import { categoryLabel } from "@/data/categories"
import { siteConfig } from "@/data/site.config"

// Camada de dados do catálogo — funções puras, prontas para trocar por Supabase depois.

export type SortKey = "recentes" | "destaques" | "preco-asc" | "preco-desc" | "procurados"

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: "recentes", label: "Mais recentes" },
  { key: "destaques", label: "Destaques" },
  { key: "preco-asc", label: "Menor preço" },
  { key: "preco-desc", label: "Maior preço" },
  { key: "procurados", label: "Mais procurados" },
]

export const priceRanges = [
  { id: "ate-300", label: "Até R$ 300", min: 0, max: 300 },
  { id: "300-600", label: "R$ 300 a R$ 600", min: 300, max: 600 },
  { id: "acima-600", label: "Acima de R$ 600", min: 600, max: Infinity },
]

export const availabilityOptions = [
  { id: "available", label: "Disponível" },
  { id: "low_stock", label: "Poucas unidades" },
  { id: "on_request", label: "Sob encomenda" },
]

export type CatalogFilters = {
  q?: string
  categoria?: string
  marca?: string
  tamanho?: string
  cor?: string
  preco?: string
  disponibilidade?: string
  novidades?: boolean
  destaque?: boolean
  sort?: SortKey
}

// Facetas derivadas de todo o catálogo (independente dos filtros ativos).
export const allBrands = siteConfig.brands
export const allSizes = ["P", "M", "G", "GG", "38", "39", "40", "41", "42", "43", "44", "46"]
export const clothingSizes = ["P", "M", "G", "GG"]
export const shoeSizes = ["38", "39", "40", "41", "42", "43", "44"]
export const allColors = Array.from(
  new Map(
    products.flatMap((p) => p.availableColors).map((c) => [c.name, c])
  ).values()
)

function matchesSearch(product: Product, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    product.name,
    product.brand,
    categoryLabel(product.category),
    product.productCode,
    ...product.availableColors.map((c) => c.name),
  ]
    .join(" ")
    .toLowerCase()
  return needle.split(/\s+/).every((token) => haystack.includes(token))
}

export function filterProducts(list: Product[], f: CatalogFilters): Product[] {
  const range = priceRanges.find((r) => r.id === f.preco)
  return list.filter((p) => {
    if (f.categoria && p.category !== f.categoria) return false
    if (f.marca && p.brand !== f.marca) return false
    if (f.tamanho && !p.availableSizes.includes(f.tamanho)) return false
    if (f.cor && !p.availableColors.some((c) => c.name === f.cor)) return false
    if (range && !(p.price != null && p.price >= range.min && p.price < range.max)) return false
    if (f.disponibilidade && p.stockStatus !== f.disponibilidade) return false
    if (f.novidades && !p.newArrival) return false
    if (f.destaque && !p.featured) return false
    if (f.q && !matchesSearch(p, f.q)) return false
    return true
  })
}

export function sortProducts(list: Product[], sort: SortKey = "recentes"): Product[] {
  const copy = [...list]
  switch (sort) {
    case "preco-asc":
      return copy.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    case "preco-desc":
      return copy.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity))
    case "destaques":
      return copy.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
    case "procurados":
      return copy.sort(
        (a, b) =>
          Number(b.badges?.includes("mais_procurado") ?? false) -
          Number(a.badges?.includes("mais_procurado") ?? false)
      )
    case "recentes":
    default:
      return copy.sort((a, b) => Number(b.newArrival ?? false) - Number(a.newArrival ?? false))
  }
}

export function queryCatalog(f: CatalogFilters): Product[] {
  return sortProducts(filterProducts(products, f), f.sort)
}

export function countActiveFilters(f: CatalogFilters, ignoreCategoria = false): number {
  let n = 0
  if (f.q) n++
  if (f.categoria && !ignoreCategoria) n++
  if (f.marca) n++
  if (f.tamanho) n++
  if (f.cor) n++
  if (f.preco) n++
  if (f.disponibilidade) n++
  if (f.novidades) n++
  if (f.destaque) n++
  return n
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (p) => p.id !== product.id && p.category === product.category
  )
  const sameBrand = products.filter(
    (p) => p.id !== product.id && p.brand === product.brand && p.category !== product.category
  )
  return [...sameCategory, ...sameBrand].slice(0, limit)
}
