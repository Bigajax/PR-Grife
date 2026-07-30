"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2, Plus, Trash2 } from "lucide-react"
import { siteConfig } from "@/data/site.config"
import { departments, departmentOfCategory, categoriesOfDepartment } from "@/data/departments"
import { clothingSizes, shoeSizes } from "@/lib/catalog"
import { saleModeLabels } from "@/lib/stock"
import type { AdminProduct } from "@/lib/products/db"
import type { ProductColor, SaleMode } from "@/types"
import { createProduct, saveProduct, type ProductInput } from "@/app/admin/produtos/actions"
import { ImagesEditor } from "@/components/admin/ImagesEditor"
import { MoneyInput } from "@/components/admin/MoneyInput"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

/**
 * Cadastro e edição num único formulário (drawer de tela cheia).
 * Departamento não é gravado: o select só filtra as categorias — o produto
 * pertence ao departamento da categoria escolhida (data/departments.ts).
 *
 * Estoque no modelo simples: cada tamanho é uma linha Tamanho | Estoque |
 * Ativo, com o saldo editável aqui mesmo. Entrada/Saída com motivo (painel
 * de estoque) continuam registrando o histórico auditado.
 */

const stockOptions = [
  { id: "available", label: "Pronta entrega" },
  { id: "low_stock", label: "Últimas unidades" },
  { id: "on_request", label: "Encomenda" },
  { id: "out_of_stock", label: "Esgotado" },
] as const

const quickSizes = [...clothingSizes, ...shoeSizes]

type VariantRow = {
  /** id do banco quando a linha já existe; null para linha nova. */
  id: string | null
  size: string
  stock: number
  isActive: boolean
}

export function ProductForm({
  product,
  onClose,
}: {
  product: AdminProduct | null
  onClose: () => void
}) {
  const router = useRouter()
  const editing = product != null

  const [name, setName] = useState(product?.name ?? "")
  const [depSlug, setDepSlug] = useState(
    () => (product ? departmentOfCategory(product.category)?.slug : undefined) ?? "roupas"
  )
  const [category, setCategory] = useState(product?.category ?? "")
  const [brand, setBrand] = useState(product?.brand ?? siteConfig.brands[0])
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "")
  const [fullDescription, setFullDescription] = useState(product?.fullDescription ?? "")
  const [price, setPrice] = useState<number | null>(product?.price ?? null)
  const [oldPrice, setOldPrice] = useState<number | null>(product?.oldPrice ?? null)
  const [installmentText, setInstallmentText] = useState(product?.installmentText ?? "")
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [colors, setColors] = useState<ProductColor[]>(product?.availableColors ?? [])
  const [stockStatus, setStockStatus] = useState<string>(product?.stockStatus ?? "available")
  const [material, setMaterial] = useState(product?.material ?? "")
  const [fit, setFit] = useState(product?.fit ?? "")
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [newArrival, setNewArrival] = useState(product?.newArrival ?? false)
  const [saleMode, setSaleMode] = useState<SaleMode>(product?.saleMode ?? "in_stock")
  const [minimumStock, setMinimumStock] = useState(product?.minimumStock ?? 0)
  const [customSize, setCustomSize] = useState("")

  // Linhas de tamanho/estoque. Produto antigo sem variações herda os tamanhos
  // cadastrados com saldo zero — é só digitar as quantidades e salvar.
  const [rows, setRows] = useState<VariantRow[]>(() => {
    if (product?.variants?.length) {
      return product.variants.map((v) => ({
        id: v.id,
        size: v.size ?? "Único",
        stock: v.stockQuantity,
        isActive: v.isActive,
      }))
    }
    return (product?.availableSizes ?? []).map((s) => ({
      id: null,
      size: s,
      stock: 0,
      isActive: true,
    }))
  })

  // Confirmação pendente de remoção de tamanhos com saldo.
  const [confirmLoss, setConfirmLoss] = useState<string[] | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const depCategories = useMemo(() => categoriesOfDepartment(depSlug), [depSlug])

  const hasSize = (s: string) => rows.some((r) => r.size.toUpperCase() === s.toUpperCase())

  const addSize = (s: string) => {
    const size = s.trim()
    if (!size || hasSize(size)) return
    setRows((cur) => [...cur, { id: null, size, stock: 0, isActive: true }])
  }

  const toggleQuickSize = (s: string) => {
    if (hasSize(s)) setRows((cur) => cur.filter((r) => r.size.toUpperCase() !== s.toUpperCase()))
    else addSize(s)
  }

  const patchRow = (index: number, patch: Partial<VariantRow>) =>
    setRows((cur) => cur.map((r, i) => (i === index ? { ...r, ...patch } : r)))

  const removeRow = (index: number) => setRows((cur) => cur.filter((_, i) => i !== index))

  const ofertaAtiva = oldPrice != null && price != null && oldPrice > price

  const doSubmit = async () => {
    setError(null)
    setSaving(true)
    const input: ProductInput = {
      name,
      category,
      brand,
      shortDescription,
      fullDescription: fullDescription.trim() || null,
      price,
      oldPrice,
      installmentText: installmentText.trim() || null,
      images,
      // A vitrine mostra os tamanhos ativos, na ordem das linhas.
      availableSizes: rows.filter((r) => r.isActive).map((r) => r.size),
      colors,
      stockStatus: stockStatus as ProductInput["stockStatus"],
      material: material.trim() || null,
      fit: fit.trim() || null,
      featured,
      newArrival,
      saleMode,
      minimumStock,
      variants: rows.map((r) => ({
        id: r.id,
        size: r.size,
        stockQuantity: r.stock,
        isActive: r.isActive,
      })),
    }
    const result = editing ? await saveProduct(product.id, input) : await createProduct(input)
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    router.refresh()
    onClose()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) {
      setError("Escolha a categoria do produto.")
      return
    }
    if (rows.some((r) => !r.size.trim())) {
      setError("Todo tamanho precisa de um nome — preencha ou remova a linha vazia.")
      return
    }
    // Remover linha que ainda tem saldo pede confirmação (o histórico fica).
    if (editing) {
      const keptIds = new Set(rows.map((r) => r.id).filter(Boolean))
      const losing = (product?.variants ?? [])
        .filter((v) => !keptIds.has(v.id) && v.stockQuantity > 0)
        .map((v) => `${v.size ?? "Único"} (${v.stockQuantity} un)`)
      if (losing.length > 0) {
        setConfirmLoss(losing)
        return
      }
    }
    await doSubmit()
  }

  const inputCls =
    "w-full border border-border bg-white px-3 py-2.5 text-sm text-text-primary focus:border-accent-strong focus:outline-none"
  const labelCls =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-text-primary"
  const sectionCls =
    "border-b border-border pb-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark"

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-text-primary/50" role="dialog" aria-modal="true" aria-label={editing ? "Editar produto" : "Novo produto"}>
      <div className="ml-auto flex min-h-full w-full max-w-2xl flex-col bg-bg-elevated">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg-elevated px-6 py-4">
          <h2 className="font-display text-2xl font-medium text-text-primary">
            {editing ? "Editar produto" : "Novo produto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-10 w-10 items-center justify-center text-text-primary hover:text-accent-strong"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-6 px-6 py-6">
          <p className={sectionCls}>Produto</p>

          <div>
            <label htmlFor="pf-nome" className={labelCls}>Nome</label>
            <input id="pf-nome" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="pf-dep" className={labelCls}>Departamento</label>
              <select
                id="pf-dep"
                value={depSlug}
                onChange={(e) => {
                  setDepSlug(e.target.value as typeof depSlug)
                  const cats = categoriesOfDepartment(e.target.value)
                  // Departamento de categoria única já escolhe a categoria.
                  setCategory(cats.length === 1 ? cats[0].id : "")
                }}
                className={inputCls}
              >
                {departments.map((d) => (
                  <option key={d.slug} value={d.slug}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pf-cat" className={labelCls}>Categoria</label>
              <select
                id="pf-cat"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                <option value="" disabled>Escolha…</option>
                {depCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pf-marca" className={labelCls}>Marca</label>
              <select id="pf-marca" value={brand} onChange={(e) => setBrand(e.target.value)} className={inputCls}>
                {siteConfig.brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="pf-desc" className={labelCls}>Descrição curta (aparece no card)</label>
            <input id="pf-desc" required maxLength={200} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label htmlFor="pf-full" className={labelCls}>Descrição completa (opcional)</label>
            <textarea id="pf-full" rows={3} value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} className={inputCls} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-material" className={labelCls}>Material (opcional)</label>
              <input id="pf-material" value={material} onChange={(e) => setMaterial(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="pf-fit" className={labelCls}>Caimento (opcional)</label>
              <input id="pf-fit" value={fit} onChange={(e) => setFit(e.target.value)} placeholder="Regular, Slim…" className={inputCls} />
            </div>
          </div>

          <p className={sectionCls}>Fotos</p>
          <ImagesEditor images={images} onChange={setImages} />

          <p className={sectionCls}>Tamanhos e estoque</p>

          <div>
            <span className={labelCls}>Adicionar tamanho</span>
            <div className="flex flex-wrap gap-2">
              {quickSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleQuickSize(s)}
                  aria-pressed={hasSize(s)}
                  className={`min-h-9 min-w-9 border px-2 text-[13px] font-medium transition-colors ${
                    hasSize(s)
                      ? "border-text-primary bg-text-primary text-white"
                      : "border-border bg-white text-text-secondary hover:border-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSize(customSize)
                    setCustomSize("")
                  }
                }}
                placeholder="Outro tamanho (ex.: 100 ml, Único)"
                className={`${inputCls} max-w-60`}
              />
              <button
                type="button"
                onClick={() => {
                  addSize(customSize)
                  setCustomSize("")
                }}
                className="flex items-center gap-1 border border-border px-3 py-2.5 text-xs font-semibold text-text-primary hover:bg-bg-surface"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Adicionar
              </button>
            </div>
          </div>

          {rows.length > 0 ? (
            <div>
              <div className="overflow-x-auto border border-border bg-white">
                <div className="grid min-w-[400px] grid-cols-[6rem_7rem_1fr_3rem] items-center gap-x-3 border-b border-border bg-bg-surface px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  <span>Tamanho</span>
                  <span>Estoque</span>
                  <span>Ativo</span>
                  <span className="sr-only">Remover</span>
                </div>
                {rows.map((r, i) => (
                  <div
                    key={r.id ?? `nova-${i}`}
                    className="grid min-w-[400px] grid-cols-[6rem_7rem_1fr_3rem] items-center gap-x-3 border-b border-border px-3 py-2 last:border-b-0"
                  >
                    <input
                      value={r.size}
                      onChange={(e) => patchRow(i, { size: e.target.value })}
                      aria-label={`Nome do tamanho ${i + 1}`}
                      className="w-20 border border-border bg-white px-2 py-1.5 text-sm uppercase text-text-primary focus:border-accent-strong focus:outline-none"
                    />
                    <input
                      type="number"
                      min={0}
                      value={r.stock}
                      onChange={(e) => patchRow(i, { stock: Math.max(0, Number(e.target.value) || 0) })}
                      aria-label={`Estoque do tamanho ${r.size || i + 1}`}
                      className="w-24 border border-border bg-white px-2 py-1.5 text-sm tabular-nums text-text-primary focus:border-accent-strong focus:outline-none"
                    />
                    <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-semibold text-text-primary">
                      <input
                        type="checkbox"
                        checked={r.isActive}
                        onChange={(e) => patchRow(i, { isActive: e.target.checked })}
                        className="h-4 w-4 accent-accent-strong"
                      />
                      Ativo
                    </label>
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      aria-label={`Remover tamanho ${r.size || i + 1}`}
                      className="justify-self-end p-1.5 text-text-secondary hover:text-alert"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-text-secondary">
                O estoque salvo aqui vale na hora. Para registrar entrada/saída com motivo e
                histórico, use a ação Estoque na listagem ou a página Estoque.
              </p>
            </div>
          ) : (
            <p className="text-xs text-text-secondary">
              Sem tamanhos, o produto fica sem controle de estoque — a disponibilidade é escolhida
              manualmente abaixo (útil para perfumes e acessórios de peça única… ou adicione o
              tamanho &quot;Único&quot; para controlar o saldo).
            </p>
          )}

          <p className={sectionCls}>Cores</p>

          <div>
            <ul className="flex flex-col gap-2">
              {colors.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) =>
                      setColors((cur) => cur.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))
                    }
                    aria-label={`Cor ${c.name || i + 1}`}
                    className="h-9 w-9 shrink-0 cursor-pointer border border-border bg-white p-0.5"
                  />
                  <input
                    value={c.name}
                    onChange={(e) =>
                      setColors((cur) => cur.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                    }
                    placeholder="Nome da cor"
                    className={`${inputCls} max-w-52`}
                  />
                  <button
                    type="button"
                    onClick={() => setColors((cur) => cur.filter((_, j) => j !== i))}
                    aria-label="Remover cor"
                    className="text-text-secondary hover:text-alert"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setColors((cur) => [...cur, { name: "", hex: "#1c1c1a" }])}
              className="mt-2 flex items-center gap-1 border border-border px-3 py-2.5 text-xs font-semibold text-text-primary hover:bg-bg-surface"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Adicionar cor
            </button>
          </div>

          <p className={sectionCls}>Preço e disponibilidade</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="pf-preco" className={labelCls}>Preço</label>
              <MoneyInput id="pf-preco" value={price} onChange={setPrice} />
            </div>
            <div>
              <label htmlFor="pf-de" className={labelCls}>Preço &quot;de&quot; (oferta)</label>
              <MoneyInput id="pf-de" value={oldPrice} onChange={setOldPrice} />
              <p className="mt-1 text-xs text-text-secondary">
                {ofertaAtiva
                  ? "Oferta ativa: aparece em /ofertas com o preço riscado."
                  : "Preencher com valor maior que o preço ativa a oferta."}
              </p>
            </div>
            <div>
              <label htmlFor="pf-parc" className={labelCls}>Parcelamento (texto)</label>
              <input id="pf-parc" value={installmentText} onChange={(e) => setInstallmentText(e.target.value)} placeholder="em até 3x sem juros" className={inputCls} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-modo" className={labelCls}>Modo de venda</label>
              <select
                id="pf-modo"
                value={saleMode}
                onChange={(e) => setSaleMode(e.target.value as SaleMode)}
                className={inputCls}
              >
                {(Object.keys(saleModeLabels) as SaleMode[]).map((mode) => (
                  <option key={mode} value={mode}>{saleModeLabels[mode]}</option>
                ))}
              </select>
            </div>
            {rows.length > 0 && (
              <div>
                <label htmlFor="pf-minimo" className={labelCls}>Estoque mínimo para alerta</label>
                <input
                  id="pf-minimo"
                  type="number"
                  min={0}
                  value={minimumStock}
                  onChange={(e) => setMinimumStock(Math.max(0, Number(e.target.value) || 0))}
                  className={`${inputCls} max-w-40`}
                />
                <p className="mt-1 text-xs text-text-secondary">
                  No mínimo ou abaixo, mostra &quot;Últimas unidades&quot;.
                </p>
              </div>
            )}
          </div>

          {rows.length > 0 ? (
            <p className="text-sm text-text-secondary">
              Disponibilidade calculada automaticamente pelo estoque
              {" — "}acima do mínimo: pronta entrega; no mínimo: últimas unidades; zerado:
              {saleMode === "in_stock" ? " esgotado." : " encomenda."}
            </p>
          ) : (
            <div>
              <label htmlFor="pf-stock" className={labelCls}>Disponibilidade</label>
              <select
                id="pf-stock"
                value={saleMode === "on_request" ? "on_request" : stockStatus}
                disabled={saleMode === "on_request"}
                onChange={(e) => setStockStatus(e.target.value)}
                className={`${inputCls} max-w-60 disabled:opacity-60`}
              >
                {stockOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
              {saleMode === "on_request" && (
                <p className="mt-1 text-xs text-text-secondary">
                  Produto sob encomenda: a disponibilidade fica travada em &quot;Encomenda&quot;.
                </p>
              )}
            </div>
          )}

          <p className={sectionCls}>Exibição</p>

          <div className="flex flex-col gap-2.5">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-text-primary">
              <input type="checkbox" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} className="h-4 w-4 accent-accent-strong" />
              Novidade (aparece em /novidades e ganha selo)
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-text-primary">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-accent-strong" />
              Destaque da loja (prioridade nos recomendados)
            </label>
          </div>

          {error && (
            <p role="alert" className="bg-accent-soft px-3 py-2.5 text-sm font-medium text-alert">
              {error}
            </p>
          )}

          <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-border bg-bg-elevated px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-border bg-white px-5 py-3 text-sm font-semibold text-text-primary hover:bg-bg-surface"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-text-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {saving ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar produto"}
            </button>
          </div>
        </form>
      </div>

      {confirmLoss && (
        <ConfirmDialog
          title="Tamanhos com estoque serão removidos"
          message={`${confirmLoss.join(", ")} ${
            confirmLoss.length === 1 ? "sai" : "saem"
          } do cadastro. O saldo deixa de valer — o histórico de movimentações fica preservado.`}
          confirmLabel="Remover mesmo assim"
          danger
          busy={saving}
          onConfirm={async () => {
            await doSubmit()
            setConfirmLoss(null)
          }}
          onCancel={() => setConfirmLoss(null)}
        />
      )}
    </div>
  )
}
