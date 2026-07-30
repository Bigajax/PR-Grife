import type { Category, Product } from "@/types"
import { categories, categoryLabel } from "@/data/categories"
import { departmentBySlug, departmentOfCategory } from "@/data/departments"
import { siteConfig } from "@/data/site.config"
import { brandShowcase, type BrandShowcaseItem } from "@/data/brands"

// Camada de consulta do catálogo — funções puras sobre uma lista de produtos.
// A lista vem do servidor (lib/products/db.ts → CatalogProvider) ou, em
// build/fallback, de data/products.ts. Nenhuma função importa o catálogo:
// quem chama fornece — é o que permite o mesmo código servir estático e banco.

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
  /** Recorte de rota (/catalogo/<depto>) — chega sempre via `locked`, nunca pela query string. */
  departamento?: string
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

// Oferta real: só existe quando o preço "de" cadastrado é maior que o atual.
// Nunca inventar desconto (regra do Guia Mestre).
export function isOnSale(p: Product): boolean {
  return p.oldPrice != null && p.price != null && p.oldPrice > p.price
}

// Slug de marca para a rota /catalogo/marca/[slug].
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

export const allBrands = siteConfig.brands

// Marcas que têm ao menos uma peça na lista. A vitrine só linka para estas:
// marca sem SKU abre um catálogo vazio, que é beco sem saída.
export const brandsInCatalog = (list: Product[]) =>
  siteConfig.brands.filter((brand) => list.some((p) => p.brand === brand))

// ── Vitrine de marcas ─────────────────────────────────────────────────────────
// A vitrine curada (data/brands.ts) mais qualquer marca que exista nos produtos
// e ainda não tenha card — assim, cadastrar produto de marca nova já a coloca
// na navegação sem mexer em mais nada.
export function showcaseBrandsFor(list: Product[]): BrandShowcaseItem[] {
  const cobertas = new Set(brandShowcase.flatMap((i) => i.brands))
  return [
    ...brandShowcase,
    ...Array.from(new Set(list.map((p) => p.brand)))
      .filter((b) => !cobertas.has(b))
      .map((b) => ({ name: b, slug: brandSlug(b), brands: [b] })),
  ]
}

// Navegação do catálogo não mostra marca sem produto.
export const showcaseBrandsWithProducts = (list: Product[]) =>
  showcaseBrandsFor(list).filter((item) =>
    item.brands.some((b) => list.some((p) => p.brand === b))
  )

// `?marca=` aceita o slug da vitrine (tommy-hilfiger cobre também Tommy Jeans)
// e continua aceitando o nome exato usado pelos chips do painel de filtros.
export function brandNamesForFilter(marca: string, list: Product[]): string[] {
  const item = showcaseBrandsFor(list).find((i) => i.slug === marca)
  if (item) return item.brands
  const porSlug = siteConfig.brands.filter((b) => brandSlug(b) === marca)
  return porSlug.length > 0 ? porSlug : [marca]
}

export const allSizes = ["P", "M", "G", "GG", "38", "39", "40", "41", "42", "43", "44", "46"]
export const clothingSizes = ["P", "M", "G", "GG"]
export const shoeSizes = ["38", "39", "40", "41", "42", "43", "44"]

export const allColorsFor = (list: Product[]) =>
  Array.from(
    new Map(list.flatMap((p) => p.availableColors).map((c) => [c.name, c])).values()
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
    if (f.departamento) {
      const dep = departmentBySlug(f.departamento)
      if (dep && !dep.categoryIds.includes(p.category)) return false
    }
    if (f.categoria && p.category !== f.categoria) return false
    if (f.marca && !brandNamesForFilter(f.marca, list).includes(p.brand)) return false
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

export function queryCatalog(list: Product[], f: CatalogFilters): Product[] {
  return sortProducts(filterProducts(list, f), f.sort)
}

export function countActiveFilters(
  f: CatalogFilters,
  ignore: (keyof CatalogFilters)[] = []
): number {
  // `departamento` fica de fora: é recorte de rota (como um lock), não filtro
  // que o visitante aplicou.
  const keys: (keyof CatalogFilters)[] = [
    "q",
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

// Categorias com ao menos um produto — chips e listas nunca oferecem filtro
// que devolve zero peças. `ids` restringe a um departamento.
export function categoriesWithProducts(list: Product[], ids?: string[]): Category[] {
  return categories.filter(
    (c) => (!ids || ids.includes(c.id)) && list.some((p) => p.category === c.id)
  )
}

// Chips da página de marca: só as categorias em que AQUELA marca tem peça.
export function categoriesWithProductsForBrand(list: Product[], marcaSlug: string): Category[] {
  const names = brandNamesForFilter(marcaSlug, list)
  return categories.filter((c) =>
    list.some((p) => p.category === c.id && names.includes(p.brand))
  )
}

// Fonte única de URL de categoria (header, footer, breadcrumb do produto).
// Departamento de categoria única (perfumes, tênis) linka direto na página do
// departamento — sem query redundante.
export function categoryHref(categoryId: string): string {
  const dep = departmentOfCategory(categoryId)
  if (!dep) return `/catalogo?categoria=${categoryId}`
  return dep.categoryIds.length === 1
    ? `/catalogo/${dep.slug}`
    : `/catalogo/${dep.slug}?categoria=${categoryId}`
}

export function relatedProducts(list: Product[], product: Product, limit = 4): Product[] {
  const sameCategory = list.filter(
    (p) => p.id !== product.id && p.category === product.category
  )
  const sameBrand = list.filter(
    (p) => p.id !== product.id && p.brand === product.brand && p.category !== product.category
  )
  return [...sameCategory, ...sameBrand].slice(0, limit)
}
