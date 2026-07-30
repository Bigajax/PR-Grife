"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ShoppingBag, Search, ChevronDown } from "lucide-react"
import { Logo } from "@/components/Logo"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { NavDropdown } from "@/components/NavDropdown"
import { templates } from "@/lib/whatsapp"
import { queryCatalog, categoryHref, showcaseBrands } from "@/lib/catalog"
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
  const pathname = usePathname()
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!menuOpen && !searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false)
        setSearchOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    if (menuOpen) document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [menuOpen, searchOpen])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Resultados em tempo real (dados estáticos — filtro instantâneo, sem debounce).
  const liveResults = useMemo(() => {
    const q = term.trim()
    if (q.length < 2) return null
    return queryCatalog({ q }).slice(0, 6)
  }, [term])

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

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-base">
      {/* `relative` na barra: a logo centralizada no mobile ancora aqui — não no
          header inteiro, cuja altura muda quando busca/menu abrem embaixo. */}
      <div className="shell relative flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-text-primary lg:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          {/* Mobile: logo centralizada na barra. Desktop: volta à esquerda e o
              centro é da navegação. */}
          <Link
            href="/"
            aria-label="PR Grife — início"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0 lg:static lg:translate-x-0 lg:translate-y-0"
          >
            <Logo variant="dark" />
          </Link>
        </div>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex"
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
              {showcaseBrands.map((item) => (
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
            className="ml-1.5 hidden items-center rounded-full bg-text-primary px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 lg:inline-flex"
          >
            Falar no WhatsApp
          </WhatsAppCta>
        </div>
      </div>

      {/* Busca com resultados em tempo real */}
      {searchOpen && (
        <div className="border-t border-border bg-bg-base">
          <form
            onSubmit={submitSearch}
            className="shell flex items-center gap-3 py-3"
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
              className="shrink-0 rounded-full bg-text-primary px-5 py-2 text-[13px] font-semibold text-white"
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
                    className="mt-4 inline-flex min-h-11 items-center rounded-full border border-text-primary px-6 text-[13px] font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent"
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
        <div className="shell max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-bg-base pb-8 pt-4 lg:hidden">
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
              {showcaseBrands.map((item) => (
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
          </nav>
          <WhatsAppCta
            message={templates.atendimentoGeral()}
            event="hero_whatsapp_click"
            payload={{ placement: "menu_mobile" }}
            className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-text-primary px-6 text-sm font-semibold text-white"
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
