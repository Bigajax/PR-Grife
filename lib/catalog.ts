import type { Product } from "@/types"
import { products } from "@/data/products"
import { categoryLabel } from "@/data/categories"
import { siteConfig } from "@/data/site.config"
import { brandShowcase, type BrandShowcaseItem } from "@/data/brands"

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
  { id: "available", label: "Pronta entrega" },
  { id: "low_stock", label: "Últimas unidades" },
  { id: "on_request", label: "Encomenda" },
]

export type CatalogFilters = {
  q?: string
  genero?: string
  categoria?: string
  marca?: string
  tamanho?: string
  cor?: string
  preco?: string
  disponibilidade?: string
  novidades?: boolean
  oferta?: boolean
  destaque?: boolean
  sort?: SortKey
}

export const genderOptions = [
  { id: "masculino", label: "Masculino" },
  { id: "feminino", label: "Feminino" },
]

// Oferta real: só existe quando o preço "de" cadastrado é maior que o atual.
// Nunca inventar desconto (regra do Guia Mestre).
export function isOnSale(p: Product): boolean {
  return p.oldPrice != null && p.price != null && p.oldPrice > p.price
}

export const saleProducts = () => products.filter(isOnSale)

// Slug de marca para a rota /marca/[slug].
export function brandSlug(brand: string): string {
  return brand
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export const brandBySlug = (slug: string) =>
  siteConfig.brands.find((b) => brandSlug(b) === slug)

// Facetas derivadas de todo o catálogo (independente dos filtros ativos).
export const allBrands = siteConfig.brands

// Marcas que têm ao menos uma peça cadastrada. A vitrine só linka para estas:
// marca sem SKU abre um catálogo vazio, que é beco sem saída. Assim que a peça
// entrar em data/products.ts, a marca volta a aparecer sozinha.
export const brandsInCatalog = siteConfig.brands.filter((brand) =>
  products.some((p) => p.brand === brand)
)

// ── Vitrine de marcas ─────────────────────────────────────────────────────────
// A vitrine curada (data/brands.ts) mais qualquer marca que exista nos produtos
// e ainda não tenha card — assim, cadastrar produto de marca nova já a coloca
// na navegação sem mexer em mais nada.
const marcasCobertas = new Set(brandShowcase.flatMap((i) => i.brands))

export const showcaseBrands: BrandShowcaseItem[] = [
  ...brandShowcase,
  ...Array.from(new Set(products.map((p) => p.brand)))
    .filter((b) => !marcasCobertas.has(b))
    .map((b) => ({ name: b, slug: brandSlug(b), brands: [b] })),
]

// Navegação do catálogo não mostra marca sem produto — filtro que devolve zero
// peças é beco sem saída.
export const showcaseBrandsWithProducts = showcaseBrands.filter((item) =>
  item.brands.some((b) => products.some((p) => p.brand === b))
)

// `?marca=` aceita o slug da vitrine (tommy-hilfiger cobre também Tommy Jeans)
// e continua aceitando o nome exato usado pelos chips do painel de filtros.
export function brandNamesForFilter(marca: string): string[] {
  const item = showcaseBrands.find((i) => i.slug === marca)
  if (item) return item.brands
  const porSlug = siteConfig.brands.filter((b) => brandSlug(b) === marca)
  return porSlug.length > 0 ? porSlug : [marca]
}
export const allSizes = ["P", "M", "G", "GG", "38", "39", "40", "41", "42", "43", "44", "46"]
export const clothingSizes = ["P", "M", "G", "GG"]
export const shoeSizes = ["38", "39", "40", "41", "42", "43", "44"]
export const allColors = Array.from(
  new Map(
    products.flatMap((p) => p.availableColors).map((c) => [c.name, c])
  ).values()
)

// Normaliza para busca: minúsculas e sem acentos ("calca" encontra "Calça").
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

export function matchesSearch(product: Product, q: string): boolean {
  const needle = normalize(q.trim())
  if (!needle) return true
  const haystack = normalize(
    [
      product.name,
      product.brand,
      categoryLabel(product.category),
      product.productCode,
      ...product.availableColors.map((c) => c.name),
    ].join(" ")
  )
  return needle.split(/\s+/).every((token) => haystack.includes(token))
}

export function filterProducts(list: Product[], f: CatalogFilters): Product[] {
  const range = priceRanges.find((r) => r.id === f.preco)
  return list.filter((p) => {
    if (f.genero && p.gender !== f.genero && p.gender !== "unissex") return false
    if (f.categoria && p.category !== f.categoria) return false
    if (f.marca && !brandNamesForFilter(f.marca).includes(p.brand)) return false
    if (f.tamanho && !p.availableSizes.includes(f.tamanho)) return false
    if (f.cor && !p.availableColors.some((c) => c.name === f.cor)) return false
    if (range && !(p.price != null && p.price >= range.min && p.price < range.max)) return false
    if (f.disponibilidade && p.stockStatus !== f.disponibilidade) return false
    if (f.novidades && !p.newArrival) return false
    if (f.oferta && !isOnSale(p)) return false
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

export function countActiveFilters(
  f: CatalogFilters,
  ignore: (keyof CatalogFilters)[] = []
): number {
  const keys: (keyof CatalogFilters)[] = [
    "q",
    "genero",
    "categoria",
    "marca",
    "tamanho",
    "cor",
    "preco",
    "disponibilidade",
    "novidades",
    "oferta",
    "destaque",
  ]
  return keys.filter((k) => f[k] && !ignore.includes(k)).length
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
