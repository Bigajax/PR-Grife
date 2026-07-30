"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2, Plus } from "lucide-react"
import { siteConfig } from "@/data/site.config"
import { departments, departmentOfCategory, categoriesOfDepartment } from "@/data/departments"
import { clothingSizes, shoeSizes } from "@/lib/catalog"
import {
  buildVariantSku,
  saleModeLabels,
  stockTypeLabels,
  variantKey,
  variantLabel,
} from "@/lib/stock"
import type { AdminProduct } from "@/lib/products/db"
import type { ProductColor, SaleMode, StockType } from "@/types"
import { createProduct, saveProduct, type ProductInput } from "@/app/admin/produtos/actions"
import { ImagesEditor } from "@/components/admin/ImagesEditor"
import { MoneyInput } from "@/components/admin/MoneyInput"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

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

  // ── Controle de estoque ────────────────────────────────────────────────────
  const [saleMode, setSaleMode] = useState<SaleMode>(product?.saleMode ?? "in_stock")
  const [trackStock, setTrackStock] = useState(product?.trackStock ?? false)
  const [stockType, setStockType] = useState<StockType>(product?.stockType ?? "single")
  const [minimumStock, setMinimumStock] = useState(product?.minimumStock ?? 0)
  const [allowNegative, setAllowNegative] = useState(product?.allowNegativeStock ?? false)
  // Dados por combinação, chaveados por variantKey. O record nunca é podado:
  // remover um tamanho/cor só tira a linha da tabela — re-adicionar reencontra
  // o que estava preenchido (pedido do proprietário: não perder dados).
  const [variantData, setVariantData] = useState<
    Record<string, { initialQuantity: number; minimumStock: number; isActive: boolean }>
  >(() =>
    Object.fromEntries(
      (product?.variants ?? []).map((v) => [
        variantKey(v.size, v.color),
        { initialQuantity: 0, minimumStock: v.minimumStock, isActive: v.isActive },
      ])
    )
  )
  // Confirmação pendente de remoção de variações com saldo.
  const [confirmLoss, setConfirmLoss] = useState<string[] | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Variações já gravadas no banco. O cadastro só CONFIGURA o estoque; o
  // saldo é gerenciado na página Estoque (separação pedida pelo proprietário:
  // editar produto e movimentar estoque são tarefas diferentes).
  const savedList = useMemo(() => product?.variants ?? [], [product])
  const savedVariants = useMemo(
    () => new Map(savedList.map((v) => [variantKey(v.size, v.color), v])),
    [savedList]
  )

  const colorNames = useMemo(
    () => colors.map((c) => c.name.trim()).filter(Boolean),
    [colors]
  )

  // Combinações da tabela, na ordem cor-maior (Preto/P, Preto/M, Branco/P...).
  const combos = useMemo(() => {
    if (stockType !== "per_variant") return []
    if (sizes.length === 0 && colorNames.length === 0) return []
    const sizeList: (string | null)[] = sizes.length > 0 ? sizes : [null]
    const colorList: (string | null)[] = colorNames.length > 0 ? colorNames : [null]
    const out: { size: string | null; color: string | null }[] = []
    for (const color of colorList) for (const size of sizeList) out.push({ size, color })
    return out
  }, [stockType, sizes, colorNames])

  const variantEntry = (key: string) =>
    variantData[key] ?? { initialQuantity: 0, minimumStock, isActive: true }

  const setVariantField = (
    key: string,
    field: "initialQuantity" | "minimumStock" | "isActive",
    value: number | boolean
  ) =>
    setVariantData((cur) => ({
      ...cur,
      [key]: { ...(cur[key] ?? { initialQuantity: 0, minimumStock, isActive: true }), [field]: value },
    }))

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

  // Combinações que o submit vai enviar (linha única no estoque simples).
  const buildVariantsInput = (): ProductInput["variants"] => {
    if (!trackStock) return []
    if (stockType === "single") {
      const entry = variantEntry(variantKey(null, null))
      return [
        {
          size: null,
          color: null,
          minimumStock,
          isActive: true,
          initialQuantity: entry.initialQuantity,
        },
      ]
    }
    return combos.map(({ size, color }) => {
      const entry = variantEntry(variantKey(size, color))
      return {
        size,
        color,
        minimumStock: entry.minimumStock,
        isActive: entry.isActive,
        initialQuantity: entry.initialQuantity,
      }
    })
  }

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
      availableSizes: sizes,
      colors,
      stockStatus: stockStatus as ProductInput["stockStatus"],
      material: material.trim() || null,
      fit: fit.trim() || null,
      featured,
      newArrival,
      saleMode,
      trackStock,
      stockType,
      minimumStock,
      allowNegativeStock: allowNegative,
      variants: buildVariantsInput(),
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
    // Remover combinação que ainda tem saldo pede confirmação: a variação será
    // desativada (histórico preservado), mas some da vitrine e da tabela.
    if (editing && trackStock) {
      const keeping = new Set(
        stockType === "single"
          ? [variantKey(null, null)]
          : combos.map(({ size, color }) => variantKey(size, color))
      )
      const losing = savedList
        .filter((v) => !keeping.has(variantKey(v.size, v.color)) && v.stockQuantity > 0)
        .map((v) => `${variantLabel(v.size, v.color)} (${v.stockQuantity} un)`)
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

          <p className={sectionCls}>Controle de estoque</p>

          <div>
            <label htmlFor="pf-modo" className={labelCls}>Modo de venda</label>
            <select
              id="pf-modo"
              value={saleMode}
              onChange={(e) => setSaleMode(e.target.value as SaleMode)}
              className={`${inputCls} max-w-72`}
            >
              {(Object.keys(saleModeLabels) as SaleMode[]).map((mode) => (
                <option key={mode} value={mode}>{saleModeLabels[mode]}</option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={trackStock}
              onChange={(e) => setTrackStock(e.target.checked)}
              className="h-4 w-4 accent-accent-strong"
            />
            Controlar estoque deste produto
          </label>
          {!trackStock && (
            <p className="-mt-4 text-xs text-text-secondary">
              Desligado: sem limite de quantidade — a disponibilidade continua manual, como hoje.
            </p>
          )}

          {trackStock && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
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
                    No mínimo ou abaixo, o produto mostra &quot;Últimas unidades&quot;.
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2.5 self-start pt-6 text-sm text-text-primary">
                  <input
                    type="checkbox"
                    checked={allowNegative}
                    onChange={(e) => setAllowNegative(e.target.checked)}
                    className="h-4 w-4 accent-accent-strong"
                  />
                  Permitir venda sem estoque (saldo negativo)
                </label>
              </div>

              <div>
                <span className={labelCls}>Tipo de estoque</span>
                <div className="flex flex-col gap-2">
                  {(Object.keys(stockTypeLabels) as StockType[]).map((t) => {
                    const semVariacoes = t === "per_variant" && sizes.length === 0 && colorNames.length === 0
                    return (
                      <label
                        key={t}
                        className={`flex items-center gap-2.5 text-sm ${
                          semVariacoes ? "cursor-not-allowed text-text-secondary/60" : "cursor-pointer text-text-primary"
                        }`}
                      >
                        <input
                          type="radio"
                          name="pf-stocktype"
                          checked={stockType === t}
                          disabled={semVariacoes}
                          onChange={() => setStockType(t)}
                          className="h-4 w-4 accent-accent-strong"
                        />
                        {stockTypeLabels[t]}
                        {semVariacoes && " — cadastre tamanhos ou cores acima"}
                      </label>
                    )
                  })}
                </div>
              </div>

              {stockType === "single" ? (
                <div>
                  <label htmlFor="pf-qtd" className={labelCls}>Quantidade disponível</label>
                  {savedVariants.has(variantKey(null, null)) ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm text-text-primary">
                        <span className="font-semibold">
                          {savedVariants.get(variantKey(null, null))!.stockQuantity} unidades
                        </span>
                      </p>
                      <a
                        href={`/admin/estoque?q=${encodeURIComponent(product?.productCode ?? "")}`}
                        className="border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-surface"
                      >
                        Gerenciar estoque
                      </a>
                      <span className="w-full text-xs text-text-secondary">
                        Entrada, saída e histórico ficam na página Estoque — toda alteração é registrada.
                      </span>
                    </div>
                  ) : (
                    <input
                      id="pf-qtd"
                      type="number"
                      min={0}
                      value={variantEntry(variantKey(null, null)).initialQuantity}
                      onChange={(e) =>
                        setVariantField(
                          variantKey(null, null),
                          "initialQuantity",
                          Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className={`${inputCls} max-w-40`}
                    />
                  )}
                </div>
              ) : (
                combos.length > 0 && (
                  <div>
                    <span className={`${labelCls} flex items-center justify-between`}>
                      Variações ({combos.length})
                      {editing && savedList.length > 0 && (
                        <a
                          href={`/admin/estoque?q=${encodeURIComponent(product?.productCode ?? "")}`}
                          className="border border-border bg-white px-3 py-1.5 text-[11px] font-semibold normal-case tracking-normal text-text-primary hover:bg-bg-surface"
                        >
                          Gerenciar estoque
                        </a>
                      )}
                    </span>
                    <div className="overflow-x-auto border border-border bg-white">
                      <div className="grid min-w-[640px] grid-cols-[1.3fr_1.1fr_9.5rem_5rem_3.5rem] items-center gap-x-3 border-b border-border bg-bg-surface px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                        <span>Variação</span>
                        <span>SKU</span>
                        <span>Estoque</span>
                        <span>Mínimo</span>
                        <span>Ativa</span>
                      </div>
                      {(() => {
                        // SKUs de preview desviam dos já gravados e entre si.
                        const taken = new Set(savedList.map((v) => v.sku))
                        return combos.map(({ size, color }) => {
                          const key = variantKey(size, color)
                          const saved = savedVariants.get(key)
                          const entry = variantEntry(key)
                          const sku =
                            saved?.sku ??
                            buildVariantSku(product?.productCode ?? "PRG-XXXX", size, color, taken)
                          return (
                            <div
                              key={key}
                              className="grid min-w-[640px] grid-cols-[1.3fr_1.1fr_9.5rem_5rem_3.5rem] items-center gap-x-3 border-b border-border px-3 py-2 last:border-b-0"
                            >
                              <span className="text-sm text-text-primary">{variantLabel(size, color)}</span>
                              <span className="font-mono text-xs text-text-secondary">{sku}</span>
                              {saved ? (
                                <span
                                  className="text-sm font-semibold tabular-nums text-text-primary"
                                  title="Saldo gerenciado na página Estoque"
                                >
                                  {saved.stockQuantity}
                                </span>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  aria-label={`Estoque inicial de ${variantLabel(size, color)}`}
                                  value={entry.initialQuantity}
                                  onChange={(e) =>
                                    setVariantField(key, "initialQuantity", Math.max(0, Number(e.target.value) || 0))
                                  }
                                  className="w-20 border border-border bg-white px-2 py-1.5 text-sm text-text-primary focus:border-accent-strong focus:outline-none"
                                />
                              )}
                              <input
                                type="number"
                                min={0}
                                aria-label={`Estoque mínimo de ${variantLabel(size, color)}`}
                                value={entry.minimumStock}
                                onChange={(e) =>
                                  setVariantField(key, "minimumStock", Math.max(0, Number(e.target.value) || 0))
                                }
                                className="w-16 border border-border bg-white px-2 py-1.5 text-sm text-text-primary focus:border-accent-strong focus:outline-none"
                              />
                              <input
                                type="checkbox"
                                aria-label={`Variação ${variantLabel(size, color)} ativa`}
                                checked={entry.isActive}
                                onChange={(e) => setVariantField(key, "isActive", e.target.checked)}
                                className="h-4 w-4 accent-accent-strong"
                              />
                            </div>
                          )
                        })
                      })()}
                    </div>
                    <p className="mt-1.5 text-xs text-text-secondary">
                      Combinações novas aceitam estoque inicial. O saldo das já cadastradas é
                      gerenciado na página Estoque (Entrada/Saída com histórico registrado).
                    </p>
                  </div>
                )
              )}
            </>
          )}

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

          {trackStock ? (
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
          title="Variações com estoque serão removidas"
          message={`${confirmLoss.join(", ")} ${
            confirmLoss.length === 1 ? "sai" : "saem"
          } do cadastro. O saldo deixa de valer e a variação é desativada — o histórico de movimentações fica preservado.`}
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
