"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { siteConfig } from "@/data/site.config"
import { categoryLabel } from "@/data/categories"
import { departments, departmentOfCategory } from "@/data/departments"
import { saleModeLabels, totalStock, variantLabel } from "@/lib/stock"
import type { AdminProduct } from "@/lib/products/db"
import type { ProductVariant, SaleMode } from "@/types"
import { StockMovementModal } from "@/components/admin/StockMovementModal"
import { StockHistoryModal } from "@/components/admin/StockHistoryModal"

/**
 * Página de estoque: KPIs + uma linha por variação ativa dos produtos com
 * controle ligado. Toda ação passa pelos mesmos modais da listagem de
 * produtos — nenhum saldo é editado direto.
 */

type Situation = "normal" | "low" | "out" | "on_request"

const situationOptions = [
  { id: "todas", label: "Todas as situações" },
  { id: "normal", label: "Estoque normal" },
  { id: "low", label: "Estoque baixo" },
  { id: "out", label: "Esgotado" },
  { id: "on_request", label: "Sob encomenda" },
] as const

// A visão geral linka com os ids de stock_status; traduz para os da página.
const situationFromQuery: Record<string, (typeof situationOptions)[number]["id"]> = {
  low_stock: "low",
  out_of_stock: "out",
  on_request: "on_request",
}

function situationOf(product: AdminProduct, variant: ProductVariant): Situation {
  if (product.saleMode === "on_request") return "on_request"
  if (variant.stockQuantity <= 0)
    return product.saleMode === "both" ? "on_request" : "out"
  if (variant.stockQuantity <= variant.minimumStock) return "low"
  return "normal"
}

const situationLabel: Record<Situation, string> = {
  normal: "Normal",
  low: "Estoque baixo",
  out: "Esgotado",
  on_request: "Sob encomenda",
}

const situationCls: Record<Situation, string> = {
  normal: "text-success",
  low: "font-semibold text-accent-strong",
  out: "font-semibold text-alert",
  on_request: "text-text-secondary",
}

function norm(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

export function StockBoard({
  products,
  todayMovements,
  initialSituation,
  initialQuery,
}: {
  products: AdminProduct[]
  todayMovements: number | null
  initialSituation?: string
  /** Busca pré-preenchida — o "Gerenciar estoque" do cadastro chega por aqui. */
  initialQuery?: string
}) {
  const [q, setQ] = useState(initialQuery ?? "")
  const [brand, setBrand] = useState("todas")
  const [dep, setDep] = useState("todos")
  const [situation, setSituation] = useState<string>(
    (initialSituation && situationFromQuery[initialSituation]) ?? "todas"
  )
  const [mode, setMode] = useState<string>("todos")
  const [movement, setMovement] = useState<{
    product: AdminProduct
    mode: "entry" | "exit"
    variantId?: string
  } | null>(null)
  const [history, setHistory] = useState<AdminProduct | null>(null)

  // Universo da página: produtos não arquivados com controle de estoque.
  const tracked = useMemo(
    () => products.filter((p) => !p.archivedAt && p.trackStock),
    [products]
  )
  // Arquivados com controle ficam fora da gestão, mas o estado vazio avisa —
  // sem isso, "movimentações hoje" > 0 com tabela vazia parece bug.
  const archivedTracked = useMemo(
    () => products.filter((p) => p.archivedAt && p.trackStock).length,
    [products]
  )

  const rows = useMemo(() => {
    const needle = norm(q.trim())
    const out: { product: AdminProduct; variant: ProductVariant; situation: Situation }[] = []
    for (const product of tracked) {
      if (brand !== "todas" && product.brand !== brand) continue
      if (dep !== "todos" && departmentOfCategory(product.category)?.slug !== dep) continue
      if (mode !== "todos" && product.saleMode !== mode) continue
      if (needle) {
        const hay = norm(`${product.name} ${product.brand} ${product.productCode}`)
        if (!needle.split(/\s+/).every((t) => hay.includes(t))) continue
      }
      for (const variant of product.variants) {
        if (!variant.isActive) continue
        const s = situationOf(product, variant)
        if (situation !== "todas" && s !== situation) continue
        out.push({ product, variant, situation: s })
      }
    }
    return out
  }, [tracked, q, brand, dep, mode, situation])

  const kpis = useMemo(() => {
    const lowCount = tracked.filter((p) => p.stockStatus === "low_stock").length
    const outCount = tracked.filter((p) => p.stockStatus === "out_of_stock").length
    return [
      {
        label: "Unidades em estoque",
        value: tracked.reduce((sum, p) => sum + totalStock(p), 0),
      },
      { label: "Produtos com estoque baixo", value: lowCount },
      { label: "Produtos esgotados", value: outCount },
      { label: "Movimentações hoje", value: todayMovements ?? "—" },
    ]
  }, [tracked, todayMovements])

  const inputCls = "border border-border bg-white px-3 py-2.5 text-sm text-text-primary"

  return (
    <div>
      <h1 className="font-display text-3xl font-medium text-text-primary">Estoque</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="border border-border bg-bg-elevated p-4">
            <p className="text-3xl font-semibold tabular-nums text-text-primary">{kpi.value}</p>
            <p className="mt-1 text-[13px] text-text-secondary">{kpi.label}</p>
          </div>
        ))}
      </div>

      {todayMovements == null && (
        <p role="alert" className="mt-4 border border-accent bg-accent-soft px-3 py-2.5 text-sm text-text-primary">
          As tabelas de estoque ainda não existem no banco — rode
          {" "}supabase/migrations/0002_estoque.sql no SQL Editor do Supabase (docs/admin.md).
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-56 flex-1 items-center gap-2 border border-border bg-white px-3 py-2.5 sm:max-w-sm">
          <Search className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, marca ou código"
            aria-label="Buscar produto"
            className="w-full bg-transparent text-sm text-text-primary outline-none"
          />
        </div>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Filtrar por marca" className={inputCls}>
          <option value="todas">Todas as marcas</option>
          {siteConfig.brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select value={dep} onChange={(e) => setDep(e.target.value)} aria-label="Filtrar por departamento" className={inputCls}>
          <option value="todos">Todos os departamentos</option>
          {departments.map((d) => (
            <option key={d.slug} value={d.slug}>{d.label}</option>
          ))}
        </select>
        <select value={situation} onChange={(e) => setSituation(e.target.value)} aria-label="Filtrar por situação" className={inputCls}>
          {situationOptions.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <select value={mode} onChange={(e) => setMode(e.target.value)} aria-label="Filtrar por modo de venda" className={inputCls}>
          <option value="todos">Todos os modos de venda</option>
          {(Object.keys(saleModeLabels) as SaleMode[]).map((m) => (
            <option key={m} value={m}>{saleModeLabels[m]}</option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-[13px] text-text-secondary" aria-live="polite">
        {rows.length} {rows.length === 1 ? "variação" : "variações"}
      </p>

      {tracked.length === 0 ? (
        <div className="mt-2 border border-border bg-bg-elevated p-10 text-center">
          <p className="font-display text-2xl text-text-primary">Nenhum produto com controle de estoque.</p>
          <p className="mt-2 text-sm text-text-secondary">
            {archivedTracked > 0
              ? `${archivedTracked} produto${archivedTracked === 1 ? "" : "s"} com controle de estoque ${
                  archivedTracked === 1 ? "está arquivado" : "estão arquivados"
                } — restaure em Produtos para gerenciar o saldo aqui.`
              : 'Ative "Controlar estoque deste produto" no cadastro, na seção Controle de estoque.'}
          </p>
        </div>
      ) : (
        <div className="mt-2 overflow-x-auto border border-border bg-bg-elevated">
          <div className="grid min-w-[860px] grid-cols-[3rem_1.6fr_1fr_1fr_4.5rem_4.5rem_7rem_12rem] items-center gap-x-3 border-b border-border bg-bg-surface px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            <span aria-hidden="true" />
            <span>Produto</span>
            <span>Variação</span>
            <span>SKU</span>
            <span>Estoque</span>
            <span>Mínimo</span>
            <span>Situação</span>
            <span>Ações</span>
          </div>
          {rows.map(({ product, variant, situation: s }) => (
            <div
              key={variant.id}
              className="grid min-w-[860px] grid-cols-[3rem_1.6fr_1fr_1fr_4.5rem_4.5rem_7rem_12rem] items-center gap-x-3 border-b border-border px-3 py-2 last:border-b-0"
            >
              {product.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.thumbnail} alt="" className="h-12 w-9 border border-border object-cover" />
              ) : (
                <span className="flex h-12 w-9 items-center justify-center border border-dashed border-border text-[9px] text-text-secondary">
                  s/ foto
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{product.name}</p>
                <p className="truncate text-xs text-text-secondary">
                  {product.brand} · {categoryLabel(product.category)}
                </p>
              </div>
              <span className="text-sm text-text-primary">{variantLabel(variant.size, variant.color)}</span>
              <span className="truncate font-mono text-xs text-text-secondary">{variant.sku}</span>
              <span className={`text-sm font-semibold tabular-nums ${variant.stockQuantity <= 0 ? "text-alert" : "text-text-primary"}`}>
                {variant.stockQuantity}
              </span>
              <span className="text-sm tabular-nums text-text-secondary">{variant.minimumStock}</span>
              <span className={`text-xs ${situationCls[s]}`}>{situationLabel[s]}</span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMovement({ product, mode: "entry", variantId: variant.id })}
                  className="border border-border bg-white px-2.5 py-1.5 text-success hover:bg-bg-surface"
                >
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setMovement({ product, mode: "exit", variantId: variant.id })}
                  className="border border-border bg-white px-2.5 py-1.5 text-text-primary hover:bg-bg-surface"
                >
                  Saída
                </button>
                <button
                  type="button"
                  onClick={() => setHistory(product)}
                  className="border border-border bg-white px-2.5 py-1.5 text-text-primary hover:bg-bg-surface"
                >
                  Histórico
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-text-secondary">
              Nenhuma variação com esses filtros.
            </p>
          )}
        </div>
      )}

      {movement && (
        <StockMovementModal
          product={movement.product}
          mode={movement.mode}
          preselectVariantId={movement.variantId}
          onClose={() => setMovement(null)}
        />
      )}
      {history && <StockHistoryModal product={history} onClose={() => setHistory(null)} />}
    </div>
  )
}
