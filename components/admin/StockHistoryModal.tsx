"use client"

import { useEffect, useState } from "react"
import { ArrowDownRight, ArrowUpRight, Loader2, X } from "lucide-react"
import { movementReasonLabel, variantLabel } from "@/lib/stock"
import type { AdminProduct } from "@/lib/products/db"
import type { StockMovement } from "@/types"
import { fetchMovements } from "@/app/admin/estoque/actions"

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

/** Histórico de movimentações do produto — leitura pura, nada aqui edita. */
export function StockHistoryModal({
  product,
  onClose,
}: {
  product: AdminProduct
  onClose: () => void
}) {
  const [movements, setMovements] = useState<StockMovement[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchMovements(product.id).then((result) => {
      if (cancelled) return
      if (result.ok) setMovements(result.movements)
      else setError(result.error)
    })
    return () => {
      cancelled = true
    }
  }, [product.id])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-text-primary/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Histórico de estoque de ${product.name}`}
    >
      <div className="my-auto flex max-h-[85vh] w-full max-w-2xl flex-col border border-border bg-bg-elevated">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-display text-2xl font-medium text-text-primary">Histórico de estoque</h2>
            <p className="text-sm text-text-secondary">{product.name}</p>
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

        <div className="overflow-y-auto px-5 py-4">
          {movements == null && !error && (
            <p className="flex items-center gap-2 py-6 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Carregando movimentações…
            </p>
          )}
          {error && (
            <p role="alert" className="bg-accent-soft px-3 py-2.5 text-sm font-medium text-alert">
              {error}
            </p>
          )}
          {movements != null && movements.length === 0 && (
            <p className="py-6 text-sm text-text-secondary">
              Nenhuma movimentação registrada ainda — use Entrada ou Saída na listagem.
            </p>
          )}
          {movements != null && movements.length > 0 && (
            <ul className="divide-y divide-border">
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
                        {m.variant?.sku ? ` · ${m.variant.sku}` : ""}
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
  )
}
