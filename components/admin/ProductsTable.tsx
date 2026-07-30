"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { categoryLabel } from "@/data/categories"
import { departmentOfCategory, departments } from "@/data/departments"
import { formatPrice } from "@/lib/format"
import { isOnSale } from "@/lib/catalog"
import { totalStock } from "@/lib/stock"
import type { AdminProduct } from "@/lib/products/db"
import { setArchived, deleteProduct, duplicateProduct } from "@/app/admin/produtos/actions"
import { ProductForm } from "@/components/admin/ProductForm"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { ProductStockPanel } from "@/components/admin/ProductStockPanel"

const stockLabel: Record<string, string> = {
  available: "Pronta entrega",
  low_stock: "Últimas unidades",
  on_request: "Encomenda",
  out_of_stock: "Esgotado",
}

// Filtros rápidos — os mesmos ids que o dashboard usa em /admin/produtos?filtro=
const quickFilters = [
  { id: "todos", label: "Todos" },
  { id: "publicados", label: "Publicados" },
  { id: "arquivados", label: "Arquivados" },
  { id: "ofertas", label: "Em oferta" },
  { id: "sem-foto", label: "Sem foto" },
  { id: "estoque-baixo", label: "Estoque baixo" },
  { id: "esgotados", label: "Esgotados" },
  { id: "encomenda", label: "Sob encomenda" },
] as const

function norm(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

export function ProductsTable({
  products,
  initialFilter = "todos",
}: {
  products: AdminProduct[]
  initialFilter?: string
}) {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState(
    quickFilters.some((f) => f.id === initialFilter) ? initialFilter : "todos"
  )
  const [dep, setDep] = useState("todos")
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AdminProduct | null>(null)
  const [stockPanel, setStockPanel] = useState<AdminProduct | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const list = useMemo(() => {
    const needle = norm(q.trim())
    return products.filter((p) => {
      if (filter === "publicados" && p.archivedAt) return false
      if (filter === "arquivados" && !p.archivedAt) return false
      if (filter === "ofertas" && !isOnSale(p)) return false
      if (filter === "sem-foto" && p.images.length > 0) return false
      if (filter === "estoque-baixo" && p.stockStatus !== "low_stock") return false
      if (filter === "esgotados" && p.stockStatus !== "out_of_stock") return false
      if (filter === "encomenda" && p.stockStatus !== "on_request") return false
      if (dep !== "todos" && departmentOfCategory(p.category)?.slug !== dep) return false
      if (needle) {
        const hay = norm(`${p.name} ${p.brand} ${categoryLabel(p.category)} ${p.productCode}`)
        if (!needle.split(/\s+/).every((t) => hay.includes(t))) return false
      }
      return true
    })
  }, [products, q, filter, dep])

  const run = async (id: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusyId(id)
    setNotice(null)
    const result = await fn()
    setBusyId(null)
    if (!result.ok) {
      setNotice(result.error ?? "Não foi possível concluir agora.")
      return false
    }
    router.refresh()
    return true
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-medium text-text-primary">Produtos</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-text-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo produto
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-56 flex-1 items-center gap-2 border border-border bg-white px-3 py-2.5 sm:max-w-sm">
          <Search className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, marca, categoria ou código"
            aria-label="Buscar produto"
            className="w-full bg-transparent text-sm text-text-primary outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filtrar por status"
          className="border border-border bg-white px-3 py-2.5 text-sm text-text-primary"
        >
          {quickFilters.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
        <select
          value={dep}
          onChange={(e) => setDep(e.target.value)}
          aria-label="Filtrar por departamento"
          className="border border-border bg-white px-3 py-2.5 text-sm text-text-primary"
        >
          <option value="todos">Todos os departamentos</option>
          {departments.map((d) => (
            <option key={d.slug} value={d.slug}>{d.label}</option>
          ))}
        </select>
      </div>

      {notice && (
        <p role="alert" className="mt-4 bg-accent-soft px-3 py-2.5 text-sm font-medium text-alert">
          {notice}
        </p>
      )}

      <p className="mt-4 text-[13px] text-text-secondary" aria-live="polite">
        {list.length} {list.length === 1 ? "produto" : "produtos"}
      </p>

      <ul className="mt-2 flex flex-col gap-2">
        {list.map((p) => {
          const dept = departmentOfCategory(p.category)
          const busy = busyId === p.id
          return (
            <li
              key={p.id}
              className={`flex flex-wrap items-center gap-3 border border-border bg-bg-elevated p-3 ${p.archivedAt ? "opacity-60" : ""}`}
            >
              {p.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.thumbnail} alt="" className="h-14 w-11 shrink-0 border border-border object-cover" />
              ) : (
                <span className="flex h-14 w-11 shrink-0 items-center justify-center border border-dashed border-border text-[10px] text-text-secondary">
                  sem foto
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">{p.name}</p>
                <p className="mt-0.5 truncate text-xs text-text-secondary">
                  {p.brand} · {dept?.label ?? "—"} › {categoryLabel(p.category)} · {p.productCode}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-medium text-text-primary">
                    {p.price != null ? formatPrice(p.price) : "sem preço"}
                  </span>
                  <span className="text-text-secondary">{stockLabel[p.stockStatus]}</span>
                  {p.trackStock && (
                    <span className={p.stockStatus === "low_stock" || p.stockStatus === "out_of_stock" ? "font-semibold text-alert" : "text-text-secondary"}>
                      {totalStock(p)} un ·{" "}
                      {p.variants.filter((v) => v.isActive).length}{" "}
                      {p.variants.filter((v) => v.isActive).length === 1 ? "variação" : "variações"}
                    </span>
                  )}
                  {isOnSale(p) && <span className="font-semibold text-accent-strong">Oferta</span>}
                  {p.newArrival && <span className="text-text-secondary">Novidade</span>}
                  {p.featured && <span className="text-text-secondary">Destaque</span>}
                  {p.archivedAt && <span className="font-semibold text-alert">Arquivado</span>}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5 text-xs font-semibold">
                {p.trackStock && p.variants.some((v) => v.isActive) && (
                  <button
                    type="button"
                    onClick={() => setStockPanel(p)}
                    disabled={busy}
                    className="border border-border bg-white px-3 py-2 text-accent-strong hover:bg-bg-surface disabled:opacity-50"
                  >
                    Estoque
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  disabled={busy}
                  className="border border-border bg-white px-3 py-2 text-text-primary hover:bg-bg-surface disabled:opacity-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => run(p.id, () => duplicateProduct(p.id))}
                  disabled={busy}
                  className="border border-border bg-white px-3 py-2 text-text-primary hover:bg-bg-surface disabled:opacity-50"
                >
                  Duplicar
                </button>
                <button
                  type="button"
                  onClick={() => run(p.id, () => setArchived(p.id, !p.archivedAt))}
                  disabled={busy}
                  className="border border-border bg-white px-3 py-2 text-text-primary hover:bg-bg-surface disabled:opacity-50"
                >
                  {p.archivedAt ? "Restaurar" : "Arquivar"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(p)}
                  disabled={busy}
                  className="border border-border bg-white px-3 py-2 text-alert hover:bg-bg-surface disabled:opacity-50"
                >
                  Excluir
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {list.length === 0 && (
        <div className="mt-6 border border-border bg-bg-elevated p-10 text-center">
          <p className="font-display text-2xl text-text-primary">Nenhum produto encontrado.</p>
          <p className="mt-2 text-sm text-text-secondary">
            Ajuste a busca ou os filtros — ou cadastre o primeiro produto.
          </p>
        </div>
      )}

      {(creating || editing) && (
        <ProductForm
          product={editing}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
        />
      )}

      {stockPanel && (
        <ProductStockPanel product={stockPanel} onClose={() => setStockPanel(null)} />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir produto"
          message={`"${confirmDelete.name}" será excluído em definitivo. Para tirar da vitrine sem perder o cadastro, use Arquivar.`}
          confirmLabel="Excluir em definitivo"
          danger
          busy={busyId === confirmDelete.id}
          onConfirm={async () => {
            const ok = await run(confirmDelete.id, () => deleteProduct(confirmDelete.id))
            if (ok) setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
