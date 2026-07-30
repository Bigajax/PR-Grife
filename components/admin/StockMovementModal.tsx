"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { entryReasons, exitReasons, variantLabel } from "@/lib/stock"
import type { AdminProduct } from "@/lib/products/db"
import { registerMovement } from "@/app/admin/estoque/actions"

/**
 * Entrada/Saída de estoque. O saldo nunca é editado direto: este modal é o
 * único caminho, e cada confirmação vira uma linha imutável no histórico.
 * A validação de saldo aqui é espelho para UX — a autoridade é a função SQL.
 */
export function StockMovementModal({
  product,
  mode,
  preselectVariantId,
  onClose,
  onDone,
}: {
  product: AdminProduct
  mode: "entry" | "exit"
  preselectVariantId?: string
  onClose: () => void
  /** Saldo novo da variação movimentada — quem abre atualiza a própria UI. */
  onDone?: (variantId: string, balance: number) => void
}) {
  const router = useRouter()
  const variants = useMemo(
    () => product.variants.filter((v) => v.isActive),
    [product]
  )
  const [variantId, setVariantId] = useState(
    preselectVariantId ?? (variants.length === 1 ? variants[0].id : "")
  )
  const [quantity, setQuantity] = useState(1)
  const reasons = mode === "entry" ? entryReasons : exitReasons
  const [reason, setReason] = useState(reasons[0].id)
  const [notes, setNotes] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const variant = variants.find((v) => v.id === variantId)
  const after =
    variant != null ? variant.stockQuantity + (mode === "entry" ? quantity : -quantity) : null
  const insufficient =
    mode === "exit" && after != null && after < 0 && !product.allowNegativeStock

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!variantId) {
      setError("Escolha a variação.")
      return
    }
    if (insufficient) return
    setError(null)
    setBusy(true)
    const result = await registerMovement({
      variantId,
      type: mode,
      quantity,
      reason,
      notes: notes.trim() || null,
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onDone?.(variantId, result.balance)
    router.refresh()
    onClose()
  }

  const inputCls =
    "w-full border border-border bg-white px-3 py-2.5 text-sm text-text-primary focus:border-accent-strong focus:outline-none"
  const labelCls =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-text-primary"

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-text-primary/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "entry" ? "Adicionar estoque" : "Retirar estoque"}
    >
      <form
        onSubmit={submit}
        className="my-auto max-h-[85vh] w-full max-w-md overflow-y-auto border border-border bg-bg-elevated p-5"
      >
        <h2 className="font-display text-2xl font-medium text-text-primary">
          {mode === "entry" ? "Adicionar estoque" : "Retirar estoque"}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{product.name}</p>

        <div className="mt-5 flex flex-col gap-4">
          {variants.length > 1 && (
            <div>
              <label htmlFor="mv-var" className={labelCls}>Variação</label>
              <select
                id="mv-var"
                required
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className={inputCls}
              >
                <option value="" disabled>Escolha…</option>
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {variantLabel(v.size, v.color)} — {v.stockQuantity} un
                  </option>
                ))}
              </select>
            </div>
          )}
          {variants.length === 1 && (
            <p className="text-sm text-text-secondary">
              Variação: <span className="font-medium text-text-primary">{variantLabel(variants[0].size, variants[0].color)}</span>
            </p>
          )}

          <div>
            <label htmlFor="mv-qtd" className={labelCls}>Quantidade</label>
            <input
              id="mv-qtd"
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className={`${inputCls} max-w-32`}
            />
          </div>

          <div>
            <label htmlFor="mv-motivo" className={labelCls}>Motivo</label>
            <select
              id="mv-motivo"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputCls}
            >
              {reasons.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mv-obs" className={labelCls}>Observação (opcional)</label>
            <input
              id="mv-obs"
              maxLength={300}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={mode === "entry" ? "Reposição do pedido 547" : "Venda pelo WhatsApp"}
              className={inputCls}
            />
          </div>

          {variant && (
            <p className="bg-bg-surface px-3 py-2.5 text-sm text-text-primary">
              Estoque atual: <span className="font-semibold">{variant.stockQuantity}</span>
              <span className="mx-2 text-text-secondary" aria-hidden="true">→</span>
              {mode === "entry" ? "após a entrada" : "após a saída"}:{" "}
              <span className={`font-semibold ${after != null && after < 0 ? "text-alert" : ""}`}>
                {after}
              </span>
            </p>
          )}

          {insufficient && (
            <p role="alert" className="bg-accent-soft px-3 py-2.5 text-sm font-medium text-alert">
              Saldo insuficiente: apenas {variant?.stockQuantity} em estoque. Ative &quot;permitir
              venda sem estoque&quot; no cadastro se quiser liberar saldo negativo.
            </p>
          )}
          {error && (
            <p role="alert" className="bg-accent-soft px-3 py-2.5 text-sm font-medium text-alert">
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-surface"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy || insufficient || !variantId}
            className="flex items-center gap-2 bg-text-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {mode === "entry" ? "Confirmar entrada" : "Confirmar saída"}
          </button>
        </div>
      </form>
    </div>
  )
}
