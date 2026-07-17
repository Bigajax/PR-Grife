"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ShoppingBag, Search } from "lucide-react"
import { Logo } from "@/components/Logo"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { templates } from "@/lib/whatsapp"
import { useSelection } from "@/hooks/useSelection"

const navLinks = [
  { href: "/#novidades", label: "Novidades" },
  { href: "/catalogo", label: "Catálogo", primary: true },
  { href: "/#marcas", label: "Marcas" },
  { href: "/#looks", label: "Looks" },
  { href: "/#condicional", label: "Condicional" },
  { href: "/#loja", label: "Nossa loja" },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [term, setTerm] = useState("")
  const { items, openDrawer } = useSelection()
  const pathname = usePathname()
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)

  const catalogActive = pathname.startsWith("/catalogo") || pathname.startsWith("/produto")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = term.trim()
    setSearchOpen(false)
    setMenuOpen(false)
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo")
  }

  const solid = scrolled || menuOpen || searchOpen

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        solid ? "border-b border-border-gray bg-off-white/95 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link href="/" aria-label="PR Grife — início" className="shrink-0">
          <Logo variant="dark" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {navLinks.map((link) => {
            const active = link.primary && catalogActive
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`border-b pb-0.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-gold-dark ${
                  link.primary
                    ? active
                      ? "border-gold text-gold-dark"
                      : "border-transparent text-black-soft"
                    : "border-transparent text-black-soft"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Buscar no catálogo"
            aria-expanded={searchOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full text-black-soft transition-colors hover:text-gold-dark"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Abrir minha seleção${items.length ? ` (${items.length} peças)` : ""}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-black-soft transition-colors hover:text-gold-dark"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {items.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold-dark px-1 text-[10px] font-bold text-white">
                {items.length}
              </span>
            )}
          </button>

          <WhatsAppCta
            message={templates.atendimentoGeral()}
            event="hero_whatsapp_click"
            payload={{ placement: "header" }}
            className="ml-1 hidden items-center rounded-full bg-black-soft px-5 py-2.5 text-[14px] font-semibold text-off-white transition-colors hover:bg-graphite md:inline-flex"
          >
            Atendimento
          </WhatsAppCta>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full text-black-soft lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Busca expansível */}
      {searchOpen && (
        <div className="border-t border-border-gray bg-off-white">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3 sm:px-6" role="search">
            <Search className="h-5 w-5 shrink-0 text-text-gray" aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar produto, marca ou categoria..."
              aria-label="Buscar no catálogo"
              className="w-full bg-transparent text-[15px] text-black-soft outline-none placeholder:text-text-gray"
            />
            <button type="submit" className="rounded-full bg-black-soft px-5 py-2 text-[13px] font-semibold text-off-white">
              Buscar
            </button>
          </form>
        </div>
      )}

      {/* Menu mobile */}
      {menuOpen && (
        <div className="border-t border-border-gray bg-off-white px-5 pb-8 pt-4 lg:hidden">
          <form onSubmit={submitSearch} className="mb-5 flex items-center gap-2 border-b-2 border-black-soft pb-2" role="search">
            <Search className="h-5 w-5 shrink-0 text-text-gray" aria-hidden="true" />
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar produto, marca..."
              aria-label="Buscar no catálogo"
              className="w-full bg-transparent text-[15px] text-black-soft outline-none placeholder:text-text-gray"
            />
          </form>
          <nav className="flex flex-col" aria-label="Navegação móvel">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`border-b border-border-gray py-3.5 font-display text-xl ${
                  link.primary ? "font-semibold text-gold-dark" : "font-medium text-black-soft"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <WhatsAppCta
            message={templates.atendimentoGeral()}
            event="hero_whatsapp_click"
            payload={{ placement: "menu_mobile" }}
            className="mt-6 flex items-center justify-center rounded-full bg-black-soft px-6 py-3.5 text-sm font-semibold text-off-white"
          >
            Receber atendimento
          </WhatsAppCta>
        </div>
      )}
    </header>
  )
}
