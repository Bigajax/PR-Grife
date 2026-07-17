"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X, ArrowUpDown, ShoppingBag } from "lucide-react"
import { categories } from "@/data/categories"
import {
  queryCatalog,
  countActiveFilters,
  priceRanges,
  availabilityOptions,
  allBrands,
  clothingSizes,
  shoeSizes,
  allColors,
  sortOptions,
  type CatalogFilters,
  type SortKey,
} from "@/lib/catalog"
import { ProductCard } from "@/components/ProductCard"
import { useSelection } from "@/hooks/useSelection"
import { track } from "@/lib/tracking"

const PAGE_SIZE = 12

function readFilters(sp: URLSearchParams, locked?: string): CatalogFilters {
  return {
    q: sp.get("q") ?? undefined,
    categoria: locked ?? sp.get("categoria") ?? undefined,
    marca: sp.get("marca") ?? undefined,
    tamanho: sp.get("tamanho") ?? undefined,
    cor: sp.get("cor") ?? undefined,
    preco: sp.get("preco") ?? undefined,
    disponibilidade: sp.get("disponibilidade") ?? undefined,
    novidades: sp.get("novidades") === "1" || undefined,
    destaque: sp.get("destaque") === "1" || undefined,
    sort: (sp.get("sort") as SortKey) ?? undefined,
  }
}

export function CatalogView({ lockedCategory }: { lockedCategory?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo(() => readFilters(searchParams, lockedCategory), [searchParams, lockedCategory])
  const results = useMemo(() => queryCatalog(filters), [filters])
  const activeCount = countActiveFilters(filters, Boolean(lockedCategory))

  const { items: selection, openDrawer } = useSelection()

  const [searchText, setSearchText] = useState(filters.q ?? "")
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Marca hidratação (para trocar o skeleton) e registra a visita ao catálogo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true)
    track("view_catalog", { categoria: lockedCategory ?? "todos" })
  }, [lockedCategory])

  // Sincroniza o campo de busca com a URL (fonte da verdade dos filtros).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setSearchText(filters.q ?? ""), [filters.q])
  // Reinicia a paginação sempre que os filtros mudam.
  const filterKey = searchParams.toString()
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setVisible(PAGE_SIZE), [filterKey])

  // Atualiza a URL preservando UTMs; source-of-truth dos filtros vive na query string.
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value == null || value === "") params.delete(key)
      else params.set(key, value)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  const toggleParam = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key)
      setParam(key, current === value ? null : value)
      track("apply_filter", { key, value })
    },
    [searchParams, setParam]
  )

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams()
    // Preserva UTMs ao limpar.
    for (const k of ["utm_source", "utm_campaign", "utm_medium"]) {
      const v = searchParams.get(k)
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [searchParams, router, pathname])

  const submitSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setParam("q", searchText.trim() || null)
      if (searchText.trim()) track("search_product", { q: searchText.trim() })
    },
    [searchText, setParam]
  )

  const quickCategories = lockedCategory ? [] : categories

  const filterPanel = (
    <div className="flex flex-col gap-6">
      {!lockedCategory && (
        <FilterGroup legend="Categoria">
          {categories.map((c) => (
            <Chip
              key={c.id}
              active={filters.categoria === c.id}
              onClick={() => toggleParam("categoria", c.id)}
            >
              {c.label}
            </Chip>
          ))}
        </FilterGroup>
      )}

      <FilterGroup legend="Marca">
        {allBrands.map((b) => (
          <Chip key={b} active={filters.marca === b} onClick={() => toggleParam("marca", b)}>
            {b}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup legend="Tamanho">
        {[...clothingSizes, ...shoeSizes].map((s) => (
          <Chip key={s} active={filters.tamanho === s} onClick={() => toggleParam("tamanho", s)} compact>
            {s}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup legend="Cor">
        {allColors.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => toggleParam("cor", c.name)}
            aria-pressed={filters.cor === c.name}
            className={`flex min-h-10 items-center gap-2 rounded-full border px-3 text-[13px] transition-colors ${
              filters.cor === c.name
                ? "border-black-soft bg-white font-semibold text-black-soft"
                : "border-border-gray bg-white text-text-gray hover:border-gold"
            }`}
          >
            <span
              className="h-3.5 w-3.5 rounded-full border border-border-gray"
              style={{ backgroundColor: c.hex }}
              aria-hidden="true"
            />
            {c.name}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup legend="Preço">
        {priceRanges.map((r) => (
          <Chip key={r.id} active={filters.preco === r.id} onClick={() => toggleParam("preco", r.id)}>
            {r.label}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup legend="Disponibilidade">
        {availabilityOptions.map((o) => (
          <Chip
            key={o.id}
            active={filters.disponibilidade === o.id}
            onClick={() => toggleParam("disponibilidade", o.id)}
          >
            {o.label}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup legend="Destaques">
        <Chip active={Boolean(filters.novidades)} onClick={() => toggleParam("novidades", "1")}>
          Novidades
        </Chip>
        <Chip active={Boolean(filters.destaque)} onClick={() => toggleParam("destaque", "1")}>
          Favoritos da loja
        </Chip>
      </FilterGroup>
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-5 pb-28 pt-6 sm:px-6 lg:pb-20">
      {/* Busca */}
      <form onSubmit={submitSearch} className="mt-6" role="search">
        <div className="flex items-center gap-2 border-b-2 border-black-soft pb-2">
          <Search className="h-5 w-5 shrink-0 text-text-gray" aria-hidden="true" />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar produto, marca ou categoria..."
            aria-label="Buscar no catálogo"
            className="w-full bg-transparent text-[15px] text-black-soft outline-none placeholder:text-text-gray"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => {
                setSearchText("")
                setParam("q", null)
              }}
              aria-label="Limpar busca"
              className="text-text-gray hover:text-gold-dark"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="submit"
            className="rounded-full bg-black-soft px-4 py-1.5 text-[13px] font-semibold text-off-white"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Chips de categoria rápida */}
      {quickCategories.length > 0 && (
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setParam("categoria", null)}
            aria-pressed={!filters.categoria}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
              !filters.categoria
                ? "border-black-soft bg-black-soft text-off-white"
                : "border-border-gray bg-white text-text-gray hover:border-gold"
            }`}
          >
            Tudo
          </button>
          {quickCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setParam("categoria", filters.categoria === c.id ? null : c.id)
                track("select_category", { categoria: c.id })
              }}
              aria-pressed={filters.categoria === c.id}
              className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                filters.categoria === c.id
                  ? "border-black-soft bg-black-soft text-off-white"
                  : "border-border-gray bg-white text-text-gray hover:border-gold"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Barra de resultados: contagem + ordenação (desktop) */}
      <div className="mt-6 flex items-center justify-between gap-4 border-b border-border-gray pb-4">
        <p className="text-[13px] text-text-gray" aria-live="polite">
          <span className="font-semibold text-black-soft">{results.length}</span>{" "}
          {results.length === 1 ? "produto" : "produtos"}
          {activeCount > 0 && ` · ${activeCount} ${activeCount === 1 ? "filtro" : "filtros"}`}
        </p>
        <div className="hidden items-center gap-3 lg:flex">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[13px] font-medium text-gold-dark underline-offset-4 hover:underline"
            >
              Limpar filtros
            </button>
          )}
          <label className="flex items-center gap-2 text-[13px] text-text-gray">
            <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Ordenar por</span>
            <select
              value={filters.sort ?? "recentes"}
              onChange={(e) => setParam("sort", e.target.value)}
              className="min-h-10 rounded-full border border-border-gray bg-white px-3 text-[13px] font-medium text-black-soft"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Layout: filtros desktop + grade */}
      <div className="mt-8 lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black-soft">Filtros</h2>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[12px] font-medium text-gold-dark hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>
            <div className="mt-5">{filterPanel}</div>
          </div>
        </aside>

        <div>
          {!ready ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] w-full bg-beige-light" />
                  <div className="mt-4 h-3 w-1/3 bg-beige-light" />
                  <div className="mt-2 h-3 w-2/3 bg-beige-light" />
                  <div className="mt-3 h-4 w-1/2 bg-beige-light" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
                {results.slice(0, visible).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {visible < results.length && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="rounded-full border border-black-soft px-8 py-3 text-sm font-semibold text-black-soft transition-colors hover:border-gold-dark hover:text-gold-dark"
                  >
                    Carregar mais ({results.length - visible})
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="border border-border-gray bg-white p-10 text-center">
              <p className="font-display text-2xl text-black-soft">Nenhuma peça encontrada.</p>
              <p className="mt-2 text-sm text-text-gray">
                Ajuste a busca ou os filtros — ou fale com a gente, a curadoria vai além da vitrine.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full border border-black-soft px-6 py-2.5 text-sm font-semibold text-black-soft"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra fixa mobile: Filtrar · Ordenar · Minha seleção */}
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border-gray bg-off-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex min-h-14 items-center justify-center gap-2 text-[13px] font-semibold text-black-soft"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filtrar{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <button
          type="button"
          onClick={() => setSortOpen(true)}
          className="flex min-h-14 items-center justify-center gap-2 border-x border-border-gray text-[13px] font-semibold text-black-soft"
        >
          <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
          Ordenar
        </button>
        <button
          type="button"
          onClick={openDrawer}
          className="relative flex min-h-14 items-center justify-center gap-2 text-[13px] font-semibold text-black-soft"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Seleção{selection.length > 0 ? ` (${selection.length})` : ""}
        </button>
      </div>

      {/* Bottom sheet de filtros (mobile) */}
      {filtersOpen && (
        <BottomSheet title="Filtros" onClose={() => setFiltersOpen(false)}>
          {filterPanel}
          <div className="mt-8 flex gap-3">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 rounded-full border border-border-gray bg-white py-3 text-sm font-semibold text-black-soft"
              >
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex-1 rounded-full bg-black-soft py-3 text-sm font-semibold text-off-white"
            >
              Ver {results.length} {results.length === 1 ? "peça" : "peças"}
            </button>
          </div>
        </BottomSheet>
      )}

      {/* Bottom sheet de ordenação (mobile) */}
      {sortOpen && (
        <BottomSheet title="Ordenar por" onClose={() => setSortOpen(false)}>
          <div className="flex flex-col">
            {sortOptions.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => {
                  setParam("sort", o.key)
                  setSortOpen(false)
                }}
                aria-pressed={(filters.sort ?? "recentes") === o.key}
                className={`flex min-h-12 items-center justify-between border-b border-border-gray text-left text-sm ${
                  (filters.sort ?? "recentes") === o.key ? "font-semibold text-black-soft" : "text-text-gray"
                }`}
              >
                {o.label}
                {(filters.sort ?? "recentes") === o.key && <span className="text-gold-dark">✓</span>}
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  )
}

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-gray">{legend}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

function Chip({
  active,
  onClick,
  children,
  compact,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-10 rounded-full border text-[13px] font-medium transition-colors ${
        compact ? "min-w-10 px-3" : "px-3.5"
      } ${
        active
          ? "border-black-soft bg-black-soft text-off-white"
          : "border-border-gray bg-white text-text-gray hover:border-gold"
      }`}
    >
      {children}
    </button>
  )
}

function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black-soft/40" />
      <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl bg-off-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-medium text-black-soft">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-11 w-11 items-center justify-center rounded-full text-black-soft"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
