"use client"

import { useMemo, useState } from "react"
import { ArrowDownRight, ArrowUpRight, Search } from "lucide-react"
import { movementReasonLabel, variantLabel } from "@/lib/stock"
import type { GlobalMovement } from "@/app/admin/estoque/actions"

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function norm(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

/** Histórico global de estoque: busca + filtro por tipo, leitura pura. */
export function MovementsBoard({ movements }: { movements: GlobalMovement[] }) {
  const [q, setQ] = useState("")
  const [type, setType] = useState<"todos" | "entry" | "exit">("todos")

  const list = useMemo(() => {
    const needle = norm(q.trim())
    return movements.filter((m) => {
      if (type !== "todos" && m.movementType !== type) return false
      if (needle) {
        const hay = norm(
          `${m.productName ?? ""} ${m.productCode ?? ""} ${m.variant?.sku ?? ""} ${
            m.variant?.size ?? ""
          } ${movementReasonLabel(m.reason)} ${m.notes ?? ""} ${m.userEmail}`
        )
        if (!needle.split(/\s+/).every((t) => hay.includes(t))) return false
      }
      return true
    })
  }, [movements, q, type])

  return (
    <div>
      <h1 className="font-display text-3xl font-medium text-text-primary">Movimentações</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Cada entrada e saída de estoque, com motivo e responsável. O histórico não pode ser
        editado nem apagado.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-56 flex-1 items-center gap-2 border border-border bg-white px-3 py-2.5 sm:max-w-sm">
          <Search className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por produto, SKU, motivo ou responsável"
            aria-label="Buscar movimentação"
            className="w-full bg-transparent text-sm text-text-primary outline-none"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          aria-label="Filtrar por tipo"
          className="border border-border bg-white px-3 py-2.5 text-sm text-text-primary"
        >
          <option value="todos">Entradas e saídas</option>
          <option value="entry">Só entradas</option>
          <option value="exit">Só saídas</option>
        </select>
      </div>

      <p className="mt-4 text-[13px] text-text-secondary" aria-live="polite">
        {list.length} {list.length === 1 ? "movimentação" : "movimentações"}
      </p>

      {list.length === 0 ? (
        <div className="mt-2 border border-border bg-bg-elevated p-10 text-center">
          <p className="font-display text-2xl text-text-primary">Nenhuma movimentação.</p>
          <p className="mt-2 text-sm text-text-secondary">
            Registre entradas e saídas pela ação Estoque na listagem de produtos.
          </p>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-border border border-border bg-bg-elevated px-4">
          {list.map((m) => (
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
                    {m.productName ?? "Produto removido"}
                    {" · "}
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
  )
}
