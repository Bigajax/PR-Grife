"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ShoppingBag, Search, ChevronDown, Heart, UserRound } from "lucide-react"
import { Logo, DiamondMark } from "@/components/Logo"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { NavDropdown } from "@/components/NavDropdown"
import { siteConfig } from "@/data/site.config"
import { templates } from "@/lib/whatsapp"
import { queryCatalog, categoryHref, showcaseBrandsFor } from "@/lib/catalog"
import { useCatalog } from "@/components/CatalogProvider"
import { departments, categoriesOfDepartment } from "@/data/departments"
import { formatPrice } from "@/lib/format"
import { track } from "@/lib/tracking"
import { useSelection } from "@/hooks/useSelection"

// Conteúdo dos painéis de navegação, derivado de data/departments.ts — a
// categoria homônima do departamento (perfumes, tenis, acessorios) não vira
// item próprio: o "Ver tudo" do departamento já é esse link.
const navDepartments = departments.map((dep) => ({
  ...dep,
  items: categoriesOfDepartment(dep.slug).filter((c) => c.id !== dep.slug),
}))

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  // Accordion aberto no menu mobile (um por vez); null = todos fechados.
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [term, setTerm] = useState("")
  const { items, openDrawer } = useSelection()
  const catalog = useCatalog()
  // Marca nova cadastrada no painel entra na navegação automaticamente.
  const navBrands = useMemo(() => showcaseBrandsFor(catalog), [catalog])
  const pathname = usePathname()
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)

  // Mobile: a linha de busca recolhe suavemente ao rolar para baixo (depois de
  // uma rolagem maior) e volta ao primeiro gesto para cima — nunca some com o
  // menu aberto nem no meio de uma digitação.
  // O mesmo listener liga o vidro do header (.header-glass) assim que a página
  // sai do topo — um só scroll handler para as duas coisas.
  const [searchRowHidden, setSearchRowHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)
  useEffect(() => {
    // Recarregar no meio da página já entra rolado — sem isto o vidro só
    // apareceria no primeiro gesto. Um quadro depois da montagem, e não no
    // corpo do efeito, para o primeiro render continuar igual ao do servidor.
    const raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8))
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 8)
      const delta = y - lastY.current
      lastY.current = y
      if (menuOpen || term.trim().length >= 2) {
        setSearchRowHidden(false)
        return
      }
      // Histerese: o fim do momentum repete o mesmo y (delta 0) — sem o
      // limiar, esse eco desfazia o recolhimento no mesmo instante.
      if (Math.abs(delta) < 2) return
      if (delta > 0 && y > 240) setSearchRowHidden(true)
      else if (delta < 0) setSearchRowHidden(false)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
    }
  }, [menuOpen, term])

  useEffect(() => {
    if (!menuOpen && !searchOpen && term.trim().length < 2) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false)
        setSearchOpen(false)
        setTerm("")
      }
    }
    document.addEventListener("keydown", onKey)
    if (menuOpen) document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [menuOpen, searchOpen, term])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Resultados em tempo real (dados estáticos — filtro instantâneo, sem debounce).
  const liveResults = useMemo(() => {
    const q = term.trim()
    if (q.length < 2) return null
    return queryCatalog(catalog, { q }).slice(0, 6)
  }, [catalog, term])

  const closeAll = () => {
    setMenuOpen(false)
    setSearchOpen(false)
    setOpenSection(null)
    setTerm("")
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = term.trim()
    if (q) track("search_product", { term: q })
    closeAll()
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo")
  }

  // Painel de busca aberto = campo com resultados logo abaixo da barra.
  const searchPanelOpen = searchOpen || term.trim().length >= 2
  const glass = scrolled && !menuOpen && !searchPanelOpen

  return (
    <header
      className={`site-header sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] ${
        glass
          ? "header-glass backdrop-blur-2xl backdrop-saturate-150"
          : "border-border bg-bg-elevated"
      }`}
    >
      {/* ── Mobile: header em duas linhas ────────────────────────────────────
          Linha 1 (58px): menu | logo | conta — grade 1fr/auto/1fr, então o
          centro da logo não se move com a largura dos ícones laterais.
          Linha 2 (48px): busca sempre visível + favoritos + sacola; recolhe
          suave ao rolar para baixo (searchRowHidden). */}
      <div className="lg:hidden">
        <div className="grid h-[58px] grid-cols-[1fr_auto_1fr] items-center px-[18px]">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              className="-ml-2.5 flex h-11 w-11 items-center justify-center text-text-primary"
            >
              {menuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Lockup maior que o do desktop: o header de duas linhas dá espaço
              para a marca respirar. Mesmos elementos do Logo — não é redesenho. */}
          <Link href="/" aria-label="PR Grife — início" className="flex items-center gap-2.5">
            <DiamondMark className="h-[22px] w-[22px] shrink-0" />
            <span className="whitespace-nowrap font-sans text-[15px] font-semibold uppercase tracking-[0.32em] text-black-soft">
              {siteConfig.name}
            </span>
          </Link>

          {/* Coluna direita vazia de propósito: equilibra a grade e mantém a
              logo no centro exato. Quando houver conta de cliente, o ícone
              de perfil volta aqui. */}
          <div aria-hidden="true" />
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            searchRowHidden ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
          }`}
        >
          <div className="flex h-12 items-center gap-4 px-[18px] pb-1.5">
            <form
              onSubmit={submitSearch}
              role="search"
              className="flex min-w-0 flex-1 items-center gap-2.5 border-b border-border pb-1.5"
            >
              <Search className="h-[18px] w-[18px] shrink-0 text-text-primary" strokeWidth={1.6} aria-hidden="true" />
              <input
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Encontre a sua próxima peça"
                aria-label="Buscar por nome, marca, categoria, cor ou referência"
                className="h-9 w-full bg-transparent text-[15px] text-text-primary outline-none placeholder:font-light placeholder:italic placeholder:text-text-secondary"
              />
              {term && (
                <button
                  type="button"
                  onClick={() => setTerm("")}
                  aria-label="Limpar busca"
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-text-secondary"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </form>

            <Link
              href="/favoritos"
              aria-label="Favoritos"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-text-primary"
            >
              <Heart className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Abrir minha seleção${items.length ? ` (${items.length} peças)` : ""}`}
              className="relative -mr-1 flex h-11 w-11 shrink-0 items-center justify-center text-text-primary"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
              {items.length > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-text-primary px-1 text-[10px] font-bold text-white">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop: barra única existente ──────────────────────────────────── */}
      <div className="shell relative hidden h-16 items-center justify-between lg:flex">
        <Link href="/" aria-label="PR Grife — início" className="shrink-0">
          <Logo variant="dark" />
        </Link>

        {/* gap menor até xl: com cinco itens, o gap-7 encostava na logo em ~1024px. */}
        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 xl:gap-7 lg:flex"
          aria-label="Navegação principal"
        >
          <Link
            href="/novidades"
            aria-current={pathname === "/novidades" ? "page" : undefined}
            className={`border-b pb-0.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-accent ${
              pathname === "/novidades"
                ? "border-accent text-accent"
                : "border-transparent text-text-primary"
            }`}
          >
            Novidades
          </Link>

          <NavDropdown
            label="Catálogo"
            href="/catalogo"
            active={pathname.startsWith("/catalogo")}
            panelClassName="w-[min(56rem,calc(100vw-4rem))] px-9"
          >
            <div className="grid grid-cols-4 gap-9">
              {navDepartments.map((dep) => (
                <div key={dep.slug}>
                  <Link
                    href={`/catalogo/${dep.slug}`}
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark transition-colors hover:text-accent"
                  >
                    {dep.label}
                  </Link>
                  <span className="hairline-gold mt-2.5 block w-12" aria-hidden="true" />
                  <ul className="mt-3.5 flex flex-col gap-2">
                    {dep.items.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={categoryHref(c.id)}
                          className="text-[13.5px] text-text-primary transition-colors hover:text-accent"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href={`/catalogo/${dep.slug}`}
                        className="text-[13.5px] font-medium text-text-secondary underline underline-offset-4 transition-colors hover:text-accent"
                      >
                        {dep.items.length > 0 ? "Ver tudo" : `Todos os ${dep.label.toLowerCase()}`}
                      </Link>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </NavDropdown>

          <NavDropdown label="Marcas" href="/#marcas" panelClassName="w-60 px-7">
            <ul className="flex flex-col gap-2.5">
              {navBrands.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/catalogo/marca/${item.slug}`}
                    className="text-[13.5px] text-text-primary transition-colors hover:text-accent"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </NavDropdown>

          <Link
            href="/ofertas"
            aria-current={pathname === "/ofertas" ? "page" : undefined}
            className={`border-b pb-0.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-accent ${
              pathname === "/ofertas"
                ? "border-accent text-accent"
                : "border-transparent text-text-primary"
            }`}
          >
            Ofertas
          </Link>

          <Link
            href="/loja-fisica"
            aria-current={pathname === "/loja-fisica" ? "page" : undefined}
            className={`border-b pb-0.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-accent ${
              pathname === "/loja-fisica"
                ? "border-accent text-accent"
                : "border-transparent text-text-primary"
            }`}
          >
            Loja Física
          </Link>
        </nav>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Buscar no catálogo"
            aria-expanded={searchOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full text-text-primary transition-colors hover:text-accent"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link
            href="/favoritos"
            aria-label="Favoritos"
            className="flex h-11 w-11 items-center justify-center rounded-full text-text-primary transition-colors hover:text-accent"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Abrir minha seleção${items.length ? ` (${items.length} peças)` : ""}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-text-primary transition-colors hover:text-accent"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {items.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-text-primary px-1 text-[10px] font-bold text-white">
                {items.length}
              </span>
            )}
          </button>

          <WhatsAppCta
            message={templates.atendimentoGeral()}
            event="hero_whatsapp_click"
            payload={{ placement: "header" }}
            className="tap ml-1.5 hidden items-center rounded-full bg-text-primary px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 lg:inline-flex"
          >
            Falar no WhatsApp
          </WhatsAppCta>
        </div>
      </div>

      {/* Busca com resultados em tempo real. No mobile o campo é o da segunda
          linha do header (sempre visível): o painel só entra com os resultados
          quando há 2+ caracteres. No desktop, abre com o botão de lupa. */}
      {searchPanelOpen && (
        <div className="border-t border-border bg-bg-elevated">
          <form
            onSubmit={submitSearch}
            className="shell hidden items-center gap-3 py-3 lg:flex"
            role="search"
          >
            <Search className="h-5 w-5 shrink-0 text-text-secondary" aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Encontre uma peça"
              aria-label="Buscar por nome, marca, categoria, cor ou referência"
              className="w-full bg-transparent text-base text-text-primary outline-none placeholder:text-text-secondary"
            />
            {term && (
              <button
                type="button"
                onClick={() => {
                  setTerm("")
                  searchRef.current?.focus()
                }}
                aria-label="Limpar busca"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="submit"
              className="tap shrink-0 rounded-full bg-text-primary px-5 py-2 text-[13px] font-semibold text-white"
            >
              Buscar
            </button>
          </form>

          {liveResults && (
            <div className="shell pb-4" aria-live="polite">
              {liveResults.length > 0 ? (
                <>
                  <ul className="divide-y divide-border border-t border-border">
                    {liveResults.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/produto/${p.slug}`}
                          onClick={closeAll}
                          className="flex items-center gap-4 py-2.5 transition-colors hover:bg-bg-surface"
                        >
                          <span className="relative block h-14 w-11 shrink-0 overflow-hidden bg-bg-surface">
                            <Image
                              src={p.thumbnail}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                              {p.brand}
                            </span>
                            <span className="block truncate text-[14px] font-medium text-text-primary">
                              {p.name}
                            </span>
                          </span>
                          {p.price != null && (
                            <span className="shrink-0 text-[13px] font-semibold text-text-primary">
                              {formatPrice(p.price)}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={submitSearch}
                    className="mt-3 inline-flex items-center gap-1.5 border-b border-text-primary pb-0.5 text-[13px] font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent"
                  >
                    Ver todos os resultados
                    <span aria-hidden="true">→</span>
                  </button>
                </>
              ) : (
                <div className="border-t border-border py-6 text-center">
                  <p className="text-[15px] text-text-primary">
                    Nenhuma peça encontrada para “{term.trim()}”.
                  </p>
                  <p className="mt-1 text-[13px] text-text-secondary">
                    Tente outro termo ou veja todas as peças.
                  </p>
                  <Link
                    href="/catalogo"
                    onClick={closeAll}
                    className="tap mt-4 inline-flex min-h-11 items-center rounded-full border border-text-primary px-6 text-[13px] font-semibold text-text-primary hover:border-accent hover:text-accent"
                  >
                    Ver todas as peças
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Menu mobile: itens diretos + accordions (um aberto por vez) para
          departamentos com subcategorias e para as marcas. */}
      {menuOpen && (
        <div className="max-h-[calc(100dvh-106px)] overflow-y-auto border-t border-border bg-bg-elevated px-[18px] pb-8 pt-4 lg:hidden">
          <nav className="flex flex-col" aria-label="Navegação móvel">
            <Link
              href="/novidades"
              onClick={closeAll}
              className="border-b border-border py-3.5 font-display text-xl font-medium text-text-primary"
            >
              Novidades
            </Link>
            <Link
              href="/catalogo"
              onClick={closeAll}
              className="border-b border-border py-3.5 font-display text-xl font-medium text-text-primary"
            >
              Catálogo
            </Link>

            {navDepartments.map((dep) =>
              dep.items.length === 0 ? (
                <Link
                  key={dep.slug}
                  href={`/catalogo/${dep.slug}`}
                  onClick={closeAll}
                  className="border-b border-border py-3.5 font-display text-xl font-medium text-text-primary"
                >
                  {dep.label}
                </Link>
              ) : (
                <MobileAccordion
                  key={dep.slug}
                  id={dep.slug}
                  label={dep.label}
                  open={openSection === dep.slug}
                  onToggle={() =>
                    setOpenSection((cur) => (cur === dep.slug ? null : dep.slug))
                  }
                >
                  <Link
                    href={`/catalogo/${dep.slug}`}
                    onClick={closeAll}
                    className="block py-2 text-[14px] font-medium text-text-primary"
                  >
                    Ver tudo de {dep.label.toLowerCase()}
                  </Link>
                  {dep.items.map((c) => (
                    <Link
                      key={c.id}
                      href={categoryHref(c.id)}
                      onClick={closeAll}
                      className="block py-2 text-[14px] text-text-secondary"
                    >
                      {c.label}
                    </Link>
                  ))}
                </MobileAccordion>
              )
            )}

            <MobileAccordion
              id="marcas"
              label="Marcas"
              open={openSection === "marcas"}
              onToggle={() => setOpenSection((cur) => (cur === "marcas" ? null : "marcas"))}
            >
              {navBrands.map((item) => (
                <Link
                  key={item.slug}
                  href={`/catalogo/marca/${item.slug}`}
                  onClick={closeAll}
                  className="block py-2 text-[14px] text-text-secondary"
                >
                  {item.name}
                </Link>
              ))}
            </MobileAccordion>

            <Link
              href="/ofertas"
              onClick={closeAll}
              className="border-b border-border py-3.5 font-display text-xl font-medium text-text-primary"
            >
              Ofertas
            </Link>
            <Link
              href="/loja-fisica"
              onClick={closeAll}
              className="border-b border-border py-3.5 font-display text-xl font-medium text-text-primary"
            >
              Loja física
            </Link>
          </nav>
          <WhatsAppCta
            message={templates.atendimentoGeral()}
            event="hero_whatsapp_click"
            payload={{ placement: "menu_mobile" }}
            className="tap mt-6 flex min-h-12 items-center justify-center rounded-full bg-text-primary px-6 text-sm font-semibold text-white"
          >
            Falar no WhatsApp
          </WhatsAppCta>
        </div>
      )}
    </header>
  )
}

// Seção expansível do menu mobile — mesmo peso visual dos itens diretos, com
// a seta indicando estado.
function MobileAccordion({
  id,
  label,
  open,
  onToggle,
  children,
}: {
  id: string
  label: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`menu-${id}`}
        className="flex w-full items-center justify-between py-3.5 font-display text-xl font-medium text-text-primary"
      >
        {label}
        <ChevronDown
          className={`h-5 w-5 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id={`menu-${id}`} className="pb-3 pl-1">
          {children}
        </div>
      )}
    </div>
  )
}
