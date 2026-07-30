"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Shirt, Boxes, Users, Settings, ExternalLink, LogOut, Menu, X } from "lucide-react"
import { signOut } from "@/app/admin/actions"
import { DiamondMark } from "@/components/Logo"

const items = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Shirt },
  { href: "/admin/estoque", label: "Estoque", icon: Boxes },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
]

// Navegação do painel: sidebar no desktop, topbar com menu expansível no
// mobile. Grafite da casa; o item ativo ganha o traço ouro rosé.
export function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  const links = (
    <ul className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            onClick={() => setOpen(false)}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex items-center gap-3 border-l-2 px-4 py-2.5 text-sm transition-colors ${
              isActive(href)
                ? "border-accent bg-white/5 font-semibold text-off-white"
                : "border-transparent text-sand hover:text-off-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )

  const footer = (
    <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
      <p className="truncate px-4 pb-1 text-xs text-sand" title={userEmail}>
        {userEmail}
      </p>
      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-2 text-sm text-sand transition-colors hover:text-off-white"
      >
        <ExternalLink className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
        Voltar ao site
      </Link>
      <button
        type="button"
        onClick={() => signOut()}
        className="flex items-center gap-3 px-4 py-2 text-left text-sm text-sand transition-colors hover:text-off-white"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
        Sair
      </button>
    </div>
  )

  return (
    <nav aria-label="Navegação do painel">
      {/* Topbar mobile */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <DiamondMark className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-off-white">
            Painel
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="flex h-10 w-10 items-center justify-center text-off-white"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 pb-4 pt-2 lg:hidden">
          {links}
          <div className="mt-2">{footer}</div>
        </div>
      )}

      {/* Sidebar desktop */}
      <div className="hidden min-h-screen flex-col justify-between py-6 lg:flex">
        <div>
          <Link href="/admin" className="mb-8 flex items-center gap-2.5 px-4">
            <DiamondMark className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-off-white">
              Painel
            </span>
          </Link>
          {links}
        </div>
        {footer}
      </div>
    </nav>
  )
}
