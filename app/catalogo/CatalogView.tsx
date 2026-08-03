"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X, ArrowUpDown, ShoppingBag, LayoutGrid } from "lucide-react"
import { departmentBySlug } from "@/data/departments"
import {
  queryCatalog,
  countActiveFilters,
  priceRanges,
  availabilityOptions,
  categoriesWithProducts,
  categoriesWithProductsForBrand,
  showcaseBrandsWithProducts,
  groupByBrand,
  clothingSizes,
  shoeSizes,
  allColorsFor,
  sortOptions,
  type CatalogFilters,
  type SortKey,
} from "@/lib/catalog"
import { useCatalog } from "@/components/CatalogProvider"
import { ProductCard } from "@/components/ProductCard"
import { ActiveFilters } from "@/components/ActiveFilters"
import { BrandLogo } from "@/components/BrandLogos"
import { useSelection } from "@/hooks/useSelection"
import { track } from "@/lib/tracking"

const PAGE_SIZE = 24

function readFilters(sp: URLSearchParams, locked: CatalogFilters): CatalogFilters {
  return {
    q: sp.get("q") ?? undefined,
    categoria: sp.get("categoria") ?? undefined,
    marca: sp.get("marca") ?? undefined,
    tamanho: sp.get("tamanho") ?? undefined,
    cor: sp.get("cor") ?? undefined,
    preco: sp.get("preco") ?? undefined,
    disponibilidade: sp.get("disponibilidade") ?? undefined,
    // `destaque` aceita duas formas: o flag antigo (=1) e o atalho por nome
    // usado nos links do header e do bloco editorial
    // (?destaque=novidades | ofertas | essenciais).
    novidades: sp.get("novidades") === "1" || sp.get("destaque") === "novidades" || undefined,
    oferta: sp.get("oferta") === "1" || sp.get("destaque") === "ofertas" || undefined,
    destaque:
      sp.get("destaque") === "1" || sp.get("destaque") === "essenciais" || undefined,
    sort: (sp.get("sort") as SortKey) ?? undefined,
    // Filtros travados pela rota (/masculino, /novidades, /marca/[slug]...)
    // sobrescrevem a query string e não aparecem na UI de filtros.
    ...locked,
  }
}

// Rotas dedicadas passam `locked` para fixar um recorte do catálogo.
export function CatalogView({
  locked = {},
  editorial = false,
  agruparPorMarca = false,
}: {
  locked?: CatalogFilters
  /**
   * Grade larga, de menos colunas. Para recortes em que a foto É o produto —
   * hoje só os Kits, que são looks inteiros em retrato. Na grade normal, de
   * até cinco colunas, cada look cai para ~220px e a composição deixa de ser
   * legível: não dá para ver o que vem no kit, que é a única pergunta que a
   * pessoa faz nessa página.
   */
  editorial?: boolean
  /**
   * Um bloco de grade por marca, com título ("Tênis Tommy Hilfiger"), em vez de
   * uma grade só. Vem de `agruparPorMarca` no departamento (data/departments.ts).
   * Só vale enquanto a pessoa não escolheu uma marca: escolhida, a página já é
   * daquela marca e um título único em cima da grade seria redundante.
   */
  agruparPorMarca?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const catalog = useCatalog()

  const lockedKeys = useMemo(
    () => Object.keys(locked) as (keyof CatalogFilters)[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const filters = useMemo(
    () => readFilters(searchParams, locked),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  )
  const results = useMemo(() => queryCatalog(catalog, filters), [catalog, filters])
  const activeCount = countActiveFilters(filters, lockedKeys)

  // Peças do recorte da página (só os filtros travados — departamento, marca
  // ou categoria), ignorando o que a pessoa escolheu. É daqui que saem as
  // opções de Tamanho e Cor: mesma regra dos chips de categoria, nunca
  // oferecer filtro que devolve zero peças. Numa página de Kits, por exemplo,
  // nenhum produto tem tamanho nem cor — os dois grupos somem.
  const noRecorte = useMemo(
    () => queryCatalog(catalog, locked as CatalogFilters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalog]
  )
  const sizesNoRecorte = useMemo(() => {
    const presentes = new Set(noRecorte.flatMap((p) => p.availableSizes))
    return [...clothingSizes, ...shoeSizes].filter((s) => presentes.has(s))
  }, [noRecorte])
  const coresNoRecorte = useMemo(() => allColorsFor(noRecorte), [noRecorte])

  // As duas grades ficam escritas por extenso: o Tailwind não gera classe
  // montada em runtime. Mobile continua em duas colunas nos dois casos.
  const gradeClasses = editorial
    ? "grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 2xl:grid-cols-4"
    : "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"

  const { items: selection, openDrawer } = useSelection()

  const [searchText, setSearchText] = useState(filters.q ?? "")
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [ready, setReady] = useState(false)

  // Blocos por marca (departamentos com `agruparPorMarca`). Some assim que a
  // pessoa escolhe uma marca — aí a página inteira já é daquela marca. Agrupa a
  // FATIA VISÍVEL, e não a lista inteira: assim o "Ver mais produtos" continua
  // valendo para a página toda, alimentando os blocos conforme ela avança.
  const gruposPorMarca = useMemo(
    () =>
      agruparPorMarca && !filters.marca
        ? groupByBrand(results.slice(0, visible), catalog)
        : null,
    [agruparPorMarca, filters.marca, results, visible, catalog]
  )

  useEffect(() => {
    // Marca hidratação (para trocar o skeleton) e registra a visita ao catálogo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true)
    track("view_catalog", {
      departamento: locked.departamento ?? "todos",
      categoria: locked.categoria ?? "todas",
      marca: locked.marca ?? "todas",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const isLocked = (key: keyof CatalogFilters) => lockedKeys.includes(key)
  // Categorias contextuais ao recorte: na página de marca, só as categorias em
  // que a marca tem peça; num departamento, só as categorias dele com produto;
  // no catálogo geral, todas as categorias com produto. Nunca chip que devolve
  // zero peças.
  const quickCategories = isLocked("categoria")
    ? []
    : locked.marca
      ? categoriesWithProductsForBrand(catalog, locked.marca)
      : locked.departamento
        ? categoriesWithProducts(catalog, departmentBySlug(locked.departamento)?.categoryIds)
        : categoriesWithProducts(catalog)

  const filterPanel = (
    <div className="flex flex-col gap-6">
      {/* Painel enxuto de propósito: categoria e marca já têm navegação
          própria acima da grade (chips e faixa de logos) — repetir aqui era
          só ruído. Novidades e ofertas têm página no menu. */}
      {sizesNoRecorte.length > 0 && (
        <FilterGroup legend="Tamanho">
          {sizesNoRecorte.map((s) => (
            <Chip key={s} active={filters.tamanho === s} onClick={() => toggleParam("tamanho", s)} compact>
              {s}
            </Chip>
          ))}
        </FilterGroup>
      )}

      {/* Só a bolinha da cor — o nome vai no title/aria e no chip de filtro
          ativo quando selecionada. */}
      {coresNoRecorte.length > 0 && (
      <FilterGroup legend="Cor">
        {coresNoRecorte.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => toggleParam("cor", c.name)}
            aria-pressed={filters.cor === c.name}
            aria-label={`Cor ${c.name}`}
            title={c.name}
            className={`h-9 w-9 rounded-full border-2 p-0.5 transition-colors ${
              filters.cor === c.name
                ? "border-black-soft"
                : "border-transparent hover:border-border-gray"
            }`}
          >
            <span
              className="block h-full w-full rounded-full border border-border-gray"
              style={{ backgroundColor: c.hex }}
              aria-hidden="true"
            />
          </button>
        ))}
      </FilterGroup>
      )}

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

    </div>
  )

  return (
    <div className="shell pb-28 pt-6 lg:pb-20">
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
            className="tap rounded-full bg-black-soft px-4 py-1.5 text-[13px] font-semibold text-off-white"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Navegação por marca: espelho da vitrine da home. A seleção vive na
          query string (?marca=slug), então troca sem recarregar e convive com
          os demais filtros. As marcas saem do RECORTE da página, não do
          catálogo inteiro: em /catalogo/tenis só aparece quem tem tênis, senão
          a faixa oferece Dior numa página de calçado e devolve zero peças. */}
      {!isLocked("marca") && (
        <div
          className="mt-6 flex items-start gap-3 overflow-x-auto pb-1 no-scrollbar"
          role="group"
          aria-label="Comprar por marca"
        >
          <button
            type="button"
            onClick={() => setParam("marca", null)}
            aria-pressed={!filters.marca}
            className="group w-24 shrink-0 text-center"
          >
            <span
              className={`flex aspect-square items-center justify-center border bg-white transition-colors ${
                !filters.marca ? "border-black-soft" : "border-border-gray group-hover:border-gold"
              }`}
            >
              <LayoutGrid
                className={`h-6 w-6 ${!filters.marca ? "text-black-soft" : "text-text-gray"}`}
                strokeWidth={1.4}
                aria-hidden="true"
              />
            </span>
            <span
              className={`mt-1.5 block text-[11px] leading-tight ${
                !filters.marca ? "font-semibold text-black-soft" : "text-text-gray"
              }`}
            >
              Todas as marcas
            </span>
          </button>

          {showcaseBrandsWithProducts(noRecorte).map((item) => {
            const ativa = filters.marca === item.slug || item.brands.includes(filters.marca ?? "")
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => {
                  setParam("marca", ativa ? null : item.slug)
                  track("apply_filter", { key: "marca", value: item.slug })
                }}
                aria-pressed={ativa}
                className="group w-24 shrink-0 text-center"
              >
                <span
                  className={`flex aspect-square items-center justify-center border bg-white p-3 transition-colors ${
                    ativa ? "border-black-soft" : "border-border-gray group-hover:border-gold"
                  }`}
                >
                  <BrandLogo name={item.name} className="h-8 w-auto max-w-full" />
                </span>
                <span
                  className={`mt-1.5 block text-[11px] leading-tight ${
                    ativa ? "font-semibold text-black-soft" : "text-text-gray"
                  }`}
                >
                  {item.name}
                </span>
              </button>
            )
          })}
        </div>
      )}

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
          <ActiveFilters
            filters={filters}
            lockedKeys={lockedKeys}
            onRemove={(key) => setParam(key, null)}
            onClear={clearFilters}
          />

          {!ready ? (
            <div className={gradeClasses}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white pb-5">
                  <div className="aspect-[4/5] w-full bg-beige-light" />
                  <div className="mx-4 mt-4 h-3 w-1/3 bg-beige-light" />
                  <div className="mx-4 mt-2 h-3 w-2/3 bg-beige-light" />
                  <div className="mx-4 mt-3 h-4 w-1/2 bg-beige-light" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              {gruposPorMarca ? (
                <div className="flex flex-col gap-14">
                  {gruposPorMarca.map((grupo) => (
                    <section key={grupo.slug ?? "outras"} aria-label={grupo.label}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border-gray pb-3">
                        <h2 className="font-display text-2xl font-medium text-black-soft">
                          {grupo.label}
                          <span className="ml-3 align-middle text-[13px] font-sans font-normal text-text-gray">
                            {grupo.products.length}{" "}
                            {grupo.products.length === 1 ? "modelo" : "modelos"}
                          </span>
                        </h2>
                        {/* Bloco sem slug é a sobra ("Sem marca"/"Multimarcas"):
                            não existe filtro que o isole, então também não há
                            para onde este link levar. */}
                        {grupo.slug && (
                          <button
                            type="button"
                            onClick={() => {
                              setParam("marca", grupo.slug)
                              track("apply_filter", { key: "marca", value: grupo.slug! })
                            }}
                            className="text-[13px] font-semibold text-gold-dark underline-offset-4 hover:underline"
                          >
                            Ver só {grupo.label} <span aria-hidden="true">→</span>
                          </button>
                        )}
                      </div>
                      <div className={`${gradeClasses} mt-6`}>
                        {grupo.products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className={gradeClasses}>
                  {results.slice(0, visible).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
              {visible < results.length && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  <p className="text-[13px] text-text-gray">
                    Você viu {Math.min(visible, results.length)} de {results.length} peças
                  </p>
                  <div
                    className="h-px w-40 overflow-hidden bg-border-gray"
                    role="progressbar"
                    aria-label="Progresso do catálogo"
                    aria-valuenow={Math.min(visible, results.length)}
                    aria-valuemin={0}
                    aria-valuemax={results.length}
                  >
                    <div
                      className="h-full bg-gold"
                      style={{ width: `${Math.min(100, (visible / results.length) * 100)}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="tap mt-1 rounded-full border border-black-soft px-8 py-3 text-sm font-semibold text-black-soft hover:border-gold-dark hover:text-gold-dark"
                  >
                    Ver mais produtos
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="border border-border-gray bg-white p-10 text-center">
              <p className="font-display text-2xl text-black-soft">Nenhum produto encontrado.</p>
              <p className="mt-2 text-sm text-text-gray">
                Tente remover algum filtro ou explorar outra categoria.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="tap rounded-full border border-black-soft px-6 py-2.5 text-sm font-semibold text-black-soft hover:border-gold-dark hover:text-gold-dark"
                  >
                    Limpar filtros
                  </button>
                )}
                {/* Recorte travado pela rota (marca/departamento sem produto):
                    "limpar" não desfaz o lock, então o caminho é sair dele. */}
                {lockedKeys.length > 0 && (
                  <Link
                    href="/catalogo"
                    className="tap rounded-full bg-black-soft px-6 py-2.5 text-sm font-semibold text-off-white hover:opacity-90"
                  >
                    Explorar o catálogo completo
                  </Link>
                )}
              </div>
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
