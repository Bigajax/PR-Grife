import type { Product, ProductVariant, SaleMode, StockStatus, StockType } from "@/types"

/**
 * Regras de estoque compartilhadas entre painel e vitrine — funções puras,
 * seguras no client. A autoridade sobre o SALDO é sempre o banco
 * (register_stock_movement); aqui vive só a leitura/derivação.
 */

// ── Rótulos oficiais ─────────────────────────────────────────────────────────

export const saleModeLabels: Record<SaleMode, string> = {
  in_stock: "Pronta entrega",
  on_request: "Sob encomenda",
  both: "Pronta entrega e encomenda",
}

export const stockTypeLabels: Record<StockType, string> = {
  single: "Estoque único",
  per_variant: "Estoque por tamanho e cor",
}

export type MovementReason = { id: string; label: string }

// Motivos por tipo de movimentação — mesmos ids do check de stock_movements.
export const entryReasons: MovementReason[] = [
  { id: "purchase", label: "Compra de fornecedor" },
  { id: "return", label: "Devolução" },
  { id: "cancellation", label: "Cancelamento de venda" },
  { id: "inventory_adjustment", label: "Ajuste de inventário" },
  { id: "manual_entry", label: "Entrada manual" },
]

export const exitReasons: MovementReason[] = [
  { id: "sale", label: "Venda manual" },
  { id: "loss", label: "Perda" },
  { id: "damage", label: "Avaria" },
  { id: "internal_use", label: "Uso interno" },
  { id: "inventory_adjustment", label: "Ajuste de inventário" },
  { id: "manual_exit", label: "Saída manual" },
]

export function movementReasonLabel(id: string): string {
  return (
    [...entryReasons, ...exitReasons].find((r) => r.id === id)?.label ?? id
  )
}

// ── Identidade da variação ───────────────────────────────────────────────────

/** Chave estável de uma combinação — igual ao unique do banco (nulo = ""). */
export function variantKey(size?: string | null, color?: string | null): string {
  return `${size ?? ""}|${color ?? ""}`
}

/** Rótulo humano: "Preto / M", "M" ou "Peça única". */
export function variantLabel(size?: string | null, color?: string | null): string {
  const parts = [color, size].filter(Boolean)
  return parts.length > 0 ? parts.join(" / ") : "Peça única"
}

/**
 * SKU derivado do código interno: PRG-0001-P-PRE (código + tamanho + 3 letras
 * da cor, normalizados). Partes ausentes são omitidas. A unicidade final é do
 * banco (unique em sku) — `dedupe` acrescenta -2, -3... dentro do produto.
 */
export function buildVariantSku(
  productCode: string,
  size?: string | null,
  color?: string | null,
  taken?: Set<string>
): string {
  const norm = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
  const parts = [productCode, size ? norm(size) : null, color ? norm(color).slice(0, 3) : null]
  const base = parts.filter(Boolean).join("-")
  if (!taken) return base
  let candidate = base
  for (let n = 2; taken.has(candidate); n++) candidate = `${base}-${n}`
  taken.add(candidate)
  return candidate
}

// ── Leitura de saldo ─────────────────────────────────────────────────────────

const activeVariants = (p: Product): ProductVariant[] =>
  (p.variants ?? []).filter((v) => v.isActive)

/** Soma do saldo das variações ativas (0 quando não há controle). */
export function totalStock(p: Product): number {
  return activeVariants(p).reduce((sum, v) => sum + v.stockQuantity, 0)
}

/** O produto tem estoque controlado com variações carregadas? */
export function hasTrackedStock(p: Product): boolean {
  return Boolean(p.trackStock && p.variants && p.variants.length > 0)
}

function findVariants(p: Product, size?: string | null, color?: string | null): ProductVariant[] {
  const pool = activeVariants(p)
  // Uma dimensão só filtra se as variações a carregam: no modelo por tamanho,
  // a cor do produto é informativa (variações têm color nulo) e escolher uma
  // cor não pode zerar o resultado. Idem para produto de variação única.
  const temTamanho = pool.some((v) => v.size != null)
  const temCor = pool.some((v) => v.color != null)
  return pool.filter(
    (v) =>
      (size == null || !temTamanho || v.size === size) &&
      (color == null || !temCor || v.color === color)
  )
}

/**
 * Status efetivo para a seleção atual (produto inteiro quando nada escolhido).
 * Sem controle de estoque, devolve o stockStatus do produto — comportamento
 * idêntico ao site de antes da migration.
 */
export function effectiveStatus(
  p: Product,
  size?: string | null,
  color?: string | null
): StockStatus {
  if (!hasTrackedStock(p)) return p.stockStatus
  if (p.saleMode === "on_request") return "on_request"

  const pool = findVariants(p, size, color)
  const total = pool.reduce((sum, v) => sum + v.stockQuantity, 0)
  if (total <= 0) return p.saleMode === "both" ? "on_request" : "out_of_stock"
  const low = pool.every((v) => v.stockQuantity <= 0 || v.stockQuantity <= v.minimumStock)
  return low ? "low_stock" : "available"
}

/**
 * A opção (tamanho e/ou cor, combinada com o resto da seleção) pode ser
 * escolhida? Zerada só bloqueia quando a venda é exclusivamente de pronta
 * entrega — em "both"/"on_request" ela continua selecionável como encomenda.
 */
export function isOptionAvailable(
  p: Product,
  selection: { size?: string | null; color?: string | null }
): boolean {
  if (!hasTrackedStock(p)) return true
  if (p.saleMode === "on_request" || p.saleMode === "both") return true
  const pool = findVariants(p, selection.size ?? null, selection.color ?? null)
  if (pool.length === 0) return false
  return pool.some((v) => v.stockQuantity > 0)
}
