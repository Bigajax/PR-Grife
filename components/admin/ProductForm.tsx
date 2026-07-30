"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2, Plus } from "lucide-react"
import { siteConfig } from "@/data/site.config"
import { departments, departmentOfCategory, categoriesOfDepartment } from "@/data/departments"
import { clothingSizes, shoeSizes } from "@/lib/catalog"
import type { AdminProduct } from "@/lib/products/db"
import type { ProductColor } from "@/types"
import { createProduct, saveProduct, type ProductInput } from "@/app/admin/produtos/actions"
import { ImagesEditor } from "@/components/admin/ImagesEditor"
import { MoneyInput } from "@/components/admin/MoneyInput"

/**
 * Cadastro e edição num único formulário (drawer de tela cheia).
 * Departamento não é gravado: o select só filtra as categorias — o produto
 * pertence ao departamento da categoria escolhida (data/departments.ts).
 * O produto salvo aparece automaticamente em /catalogo, /catalogo/<depto>,
 * ?categoria= e /catalogo/marca/<slug>.
 */

const stockOptions = [
  { id: "available", label: "Pronta entrega" },
  { id: "low_stock", label: "Últimas unidades" },
  { id: "on_request", label: "Encomenda" },
  { id: "out_of_stock", label: "Esgotado" },
] as const

const quickSizes = [...clothingSizes, ...shoeSizes]

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
  const [sizes, setSizes] = useState<string[]>(product?.availableSizes ?? [])
  const [customSize, setCustomSize] = useState("")
  const [colors, setColors] = useState<ProductColor[]>(product?.availableColors ?? [])
  const [stockStatus, setStockStatus] = useState<string>(product?.stockStatus ?? "available")
  const [material, setMaterial] = useState(product?.material ?? "")
  const [fit, setFit] = useState(product?.fit ?? "")
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [newArrival, setNewArrival] = useState(product?.newArrival ?? false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const depCategories = useMemo(() => categoriesOfDepartment(depSlug), [depSlug])

  const toggleSize = (s: string) =>
    setSizes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))

  const addCustomSize = () => {
    const v = customSize.trim()
    if (v && !sizes.includes(v)) setSizes((cur) => [...cur, v])
    setCustomSize("")
  }

  const ofertaAtiva =
    oldPrice != null && price != null && oldPrice > price

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) {
      setError("Escolha a categoria do produto.")
      return
    }
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
      availableSizes: sizes,
      colors,
      stockStatus: stockStatus as ProductInput["stockStatus"],
      material: material.trim() || null,
      fit: fit.trim() || null,
      featured,
      newArrival,
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

          <p className={sectionCls}>Tamanhos e cores</p>

          <div>
            <span className={labelCls}>Tamanhos</span>
            <div className="flex flex-wrap gap-2">
              {quickSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  aria-pressed={sizes.includes(s)}
                  className={`min-h-9 min-w-9 border px-2 text-[13px] font-medium transition-colors ${
                    sizes.includes(s)
                      ? "border-text-primary bg-text-primary text-white"
                      : "border-border bg-white text-text-secondary hover:border-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizes.filter((s) => !quickSizes.includes(s)).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes
                  .filter((s) => !quickSizes.includes(s))
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className="min-h-9 border border-text-primary bg-text-primary px-2.5 text-[13px] font-medium text-white"
                      title="Clique para remover"
                    >
                      {s} ×
                    </button>
                  ))}
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <input
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addCustomSize()
                  }
                }}
                placeholder="Outro tamanho (ex.: 100 ml, Único)"
                className={`${inputCls} max-w-60`}
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="flex items-center gap-1 border border-border px-3 py-2.5 text-xs font-semibold text-text-primary hover:bg-bg-surface"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Adicionar
              </button>
            </div>
          </div>

          <div>
            <span className={labelCls}>Cores</span>
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

          <div>
            <label htmlFor="pf-stock" className={labelCls}>Disponibilidade</label>
            <select id="pf-stock" value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} className={`${inputCls} max-w-60`}>
              {stockOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>

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
    </div>
  )
}
