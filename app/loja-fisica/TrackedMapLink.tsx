"use client"

import type { ReactNode } from "react"
import { track } from "@/lib/tracking"

// Link externo de mapa (rota ou busca no Google Maps) com o evento
// location_click — declarado em lib/tracking.ts e usado somente aqui.
export function TrackedMapLink({
  href,
  placement,
  className,
  children,
  ariaLabel,
}: {
  href: string
  placement: string
  className?: string
  children: ReactNode
  ariaLabel?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() => track("location_click", { placement })}
    >
      {children}
    </a>
  )
}
