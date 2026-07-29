"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ShoppingBag, Search } from "lucide-react"
import { Logo } from "@/components/Logo"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { templates } from "@/lib/whatsapp"
import { queryCatalog } from "@/lib/catalog"
import { formatPrice } from "@/lib/format"
import { track } from "@/lib/tracking"
import { useSelection } from "@/hooks/useSelection"

// Quatro itens. Tudo desemboca em /catalogo, já filtrado pela query string —
// menos "Marcas", que é âncora para o carrossel da home.
const navLinks = [
  { href: "/catalogo", label: "Masculino" },
  { href: "/catalogo?destaque=novidades", label: "Novidades" },
  { href: "/#marcas", label: "Marcas" },
  { href: "/catalogo?destaque=ofertas", label: "Ofertas" },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
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
      <div className="shell flex h-16 items-center justify-between">
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
          <Link href="/" aria-label="PR Grife — início" className="shrink-0">
            <Logo variant="dark" />
          </Link>
        </div>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex"
          aria-label="Navegação principal"
        >
          {navLinks.map((link) => {
            // O href carrega query string; compara só a parte do caminho.
            const target = link.href.split("?")[0]
            const active = !link.href.includes("#") && pathname === target
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`border-b pb-0.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-accent ${
                  active ? "border-accent text-accent" : "border-transparent text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
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
            className="ml-1.5 hidden items-center rounded-full bg-text-primary px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 md:inline-flex"
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

      {/* Menu mobile */}
      {menuOpen && (
        <div className="shell max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-bg-base pb-8 pt-4 lg:hidden">
          <nav className="flex flex-col" aria-label="Navegação móvel">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-3.5 font-display text-xl font-medium text-text-primary"
              >
                {link.label}
              </Link>
            ))}
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
