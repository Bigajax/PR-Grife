"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowDownRight, ArrowUpRight, Loader2, X } from "lucide-react"
import { movementReasonLabel, variantLabel } from "@/lib/stock"
import type { AdminProduct } from "@/lib/products/db"
import type { ProductVariant, StockMovement } from "@/types"
import { fetchMovements } from "@/app/admin/estoque/actions"
import { StockMovementModal } from "@/components/admin/StockMovementModal"

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function situacao(product: AdminProduct, v: ProductVariant): { label: string; cls: string } {
  if (product.saleMode === "on_request") return { label: "Sob encomenda", cls: "text-text-secondary" }
  if (v.stockQuantity <= 0)
    return product.saleMode === "both"
      ? { label: "Sob encomenda", cls: "text-text-secondary" }
      : { label: "Esgotado", cls: "font-semibold text-alert" }
  if (v.stockQuantity <= v.minimumStock)
    return { label: "Estoque baixo", cls: "font-semibold text-accent-strong" }
  return { label: "Normal", cls: "text-success" }
}

/**
 * Painel de estoque do produto, aberto pela ação "Estoque" da listagem.
 * Concentra a operação num lugar só — variações com Entrada/Saída e o
 * histórico logo abaixo — mantendo o cadastro (Editar) só com configuração.
 */
export function ProductStockPanel({
  product,
  onClose,
}: {
  product: AdminProduct
  onClose: () => void
}) {
  // Cópia local dos saldos: cada movimentação atualiza a linha na hora.
  const [variants, setVariants] = useState(product.variants)
  const [movement, setMovement] = useState<{ mode: "entry" | "exit"; variantId: string } | null>(null)
  const [movements, setMovements] = useState<StockMovement[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadMovements = useCallback(() => {
    fetchMovements(product.id).then((result) => {
      if (result.ok) setMovements(result.movements)
      else setError(result.error)
    })
  }, [product.id])

  useEffect(() => {
    loadMovements()
  }, [loadMovements])

  const ativas = variants.filter((v) => v.isActive)
  const total = ativas.reduce((sum, v) => sum + v.stockQuantity, 0)

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-text-primary/50"
      role="dialog"
      aria-modal="true"
      aria-label={`Estoque de ${product.name}`}
    >
      <div className="ml-auto flex min-h-full w-full max-w-xl flex-col bg-bg-elevated">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg-elevated px-6 py-4">
          <div>
            <h2 className="font-display text-2xl font-medium text-text-primary">Estoque</h2>
            <p className="text-sm text-text-secondary">
              {product.name} · {total} {total === 1 ? "unidade" : "unidades"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-10 w-10 items-center justify-center text-text-primary hover:text-accent-strong"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Variações com ação direta */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-strong">
              Variações
            </p>
            <ul className="mt-3 divide-y divide-border border border-border bg-white">
              {ativas.map((v) => {
                const s = situacao(product, v)
                return (
                  <li key={v.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {variantLabel(v.size, v.color)}
                      </p>
                      <p className="font-mono text-xs text-text-secondary">{v.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-text-primary">
                        {v.stockQuantity} un
                      </p>
                      <p className={`text-xs ${s.cls}`}>{s.label}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setMovement({ mode: "entry", variantId: v.id })}
                        className="border border-border bg-white px-2.5 py-1.5 text-success hover:bg-bg-surface"
                      >
                        Entrada
                      </button>
                      <button
                        type="button"
                        onClick={() => setMovement({ mode: "exit", variantId: v.id })}
                        className="border border-border bg-white px-2.5 py-1.5 text-text-primary hover:bg-bg-surface"
                      >
                        Saída
                      </button>
                    </div>
                  </li>
                )
              })}
              {ativas.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-text-secondary">
                  Nenhuma variação ativa — configure em Editar, na seção Controle de estoque.
                </li>
              )}
            </ul>
          </div>

          {/* Histórico */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-strong">
              Histórico de movimentações
            </p>
            {movements == null && !error && (
              <p className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Carregando…
              </p>
            )}
            {error && (
              <p role="alert" className="mt-3 bg-accent-soft px-3 py-2.5 text-sm font-medium text-alert">
                {error}
              </p>
            )}
            {movements != null && movements.length === 0 && (
              <p className="mt-3 text-sm text-text-secondary">Nenhuma movimentação registrada ainda.</p>
            )}
            {movements != null && movements.length > 0 && (
              <ul className="mt-3 divide-y divide-border border-y border-border">
                {movements.map((m) => (
                  <li key={m.id} className="flex gap-3 py-3">
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border ${
                        m.movementType === "entry"
                          ? "border-success/40 text-success"
                          : "border-alert/40 text-alert"
                      }`}
                    >
                      {m.movementType === "entry" ? (
                        <ArrowDownRight className="h-4 w-4" strokeWidth={1.6} />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium text-text-primary">
                        {m.movementType === "entry" ? "Entrada" : "Saída"} de {m.quantity}{" "}
                        {m.quantity === 1 ? "unidade" : "unidades"}
                        <span className="ml-2 font-normal text-text-secondary">
                          {variantLabel(m.variant?.size, m.variant?.color)}
                        </span>
                      </p>
                      <p className="text-text-secondary">
                        Motivo: {movementReasonLabel(m.reason)}
                        {m.notes ? ` — ${m.notes}` : ""}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {dateFmt.format(new Date(m.createdAt))} · Saldo: {m.previousQuantity} →{" "}
                        <span className="font-semibold text-text-primary">{m.balanceAfter}</span>
                        {m.userEmail ? ` · ${m.userEmail}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {movement && (
        <StockMovementModal
          product={{ ...product, variants }}
          mode={movement.mode}
          preselectVariantId={movement.variantId}
          onClose={() => setMovement(null)}
          onDone={(variantId, balance) => {
            setVariants((cur) =>
              cur.map((v) => (v.id === variantId ? { ...v, stockQuantity: balance } : v))
            )
            loadMovements()
          }}
        />
      )}
    </div>
  )
}
