"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

// Item de navegação com painel suspenso (desktop). O gatilho é um Link de
// verdade: clique navega para `href`; hover/foco abrem o painel. Hover com
// intenção (pequeno atraso para abrir e outro maior para fechar) evita que o
// painel pisque ao atravessar o menu com o mouse.
const OPEN_DELAY = 60
const CLOSE_DELAY = 150

export function NavDropdown({
  label,
  href,
  active = false,
  panelClassName = "",
  children,
}: {
  label: string
  href: string
  active?: boolean
  /** Largura/layout do painel — o conteúdo decide. */
  panelClassName?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()

  const schedule = (next: boolean, delay: number) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(next), delay)
  }

  // Navegou = fechou. (O Link não fecha sozinho porque o painel persiste no DOM.)
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [open])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return (
    <div
      ref={wrapRef}
      // h-16 = altura do header: o painel (top-full) abre rente à borda de
      // baixo da barra e o mouse nunca cruza um vão que dispare o fechamento.
      className="relative flex h-16 items-center"
      onMouseEnter={() => schedule(true, OPEN_DELAY)}
      onMouseLeave={() => schedule(false, CLOSE_DELAY)}
      onBlur={(e) => {
        // Tab saiu do conjunto gatilho+painel → fecha.
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      <Link
        ref={triggerRef}
        href={href}
        aria-expanded={open}
        aria-haspopup="true"
        aria-current={active ? "page" : undefined}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
            requestAnimationFrame(() => panelRef.current?.querySelector("a")?.focus())
          }
        }}
        className={`inline-flex items-center gap-1 border-b pb-0.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-accent ${
          active ? "border-accent text-accent" : "border-transparent text-text-primary"
        }`}
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </Link>

      {open && (
        <div
          ref={panelRef}
          className={`absolute left-1/2 top-full z-50 -translate-x-1/2 border border-border bg-bg-elevated pt-5 pb-6 shadow-[0_18px_40px_-20px_rgba(28,28,26,0.25)] ${panelClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  )
}
