"use client"

import { X } from "lucide-react"
import { categoryLabel } from "@/data/categories"
import {
  allBrands,
  brandSlug,
  priceRanges,
  availabilityOptions,
  type CatalogFilters,
} from "@/lib/catalog"

// Chave de filtro que vira chip. `sort` fica de fora: ordenação não é recorte,
// e o seletor já mostra o estado dela.
const CHIP_KEYS = [
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
] as const

type ChipKey = (typeof CHIP_KEYS)[number]

function chipLabel(key: ChipKey, value: string | boolean): string | null {
  switch (key) {
    case "q":
      return `“${value}”`
    case "categoria":
      return categoryLabel(String(value))
    case "marca":
      return allBrands.find((b) => brandSlug(b) === value) ?? String(value)
    case "tamanho":
      return `Tamanho ${value}`
    case "cor":
      return String(value)
    case "preco":
      return priceRanges.find((r) => r.id === value)?.label ?? String(value)
    case "disponibilidade":
      return availabilityOptions.find((o) => o.id === value)?.label ?? String(value)
    case "novidades":
      return "Novidades"
    case "oferta":
      return "Ofertas"
    case "destaque":
      return "Destaques"
    default:
      return null
  }
}

// Filtros aplicados, visíveis e removíveis, no topo da grade.
// Os travados pela rota não viram chip: o visitante não pode removê-los.
export function ActiveFilters({
  filters,
  lockedKeys,
  onRemove,
  onClear,
}: {
  filters: CatalogFilters
  lockedKeys: (keyof CatalogFilters)[]
  onRemove: (key: ChipKey) => void
  onClear: () => void
}) {
  const chips = CHIP_KEYS.flatMap((key) => {
    if (lockedKeys.includes(key)) return []
    const value = filters[key]
    if (value == null || value === false || value === "") return []
    const label = chipLabel(key, value as string | boolean)
    return label ? [{ key, label }] : []
  })

  if (chips.length === 0) return null

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onRemove(key)}
          aria-label={`Remover filtro ${label}`}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-accent bg-accent-soft px-3 text-[13px] text-text-primary transition-colors hover:border-accent-strong"
        >
          {label}
          <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </button>
      ))}

      <button
        type="button"
        onClick={onClear}
        className="min-h-9 px-2 text-[13px] font-medium text-accent-strong underline-offset-4 hover:underline"
      >
        Limpar tudo
      </button>
    </div>
  )
}
