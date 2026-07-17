"use client"

import type { ReactNode } from "react"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { useUtm } from "@/hooks/useUtm"
import { track, type TrackingEvent } from "@/lib/tracking"

type WhatsAppCtaProps = {
  message: string
  event: TrackingEvent
  payload?: Record<string, unknown>
  className?: string
  children: ReactNode
  ariaLabel?: string
}

// Todo CTA que abre o WhatsApp passa por aqui: link único (lib/whatsapp) + UTM + tracking.
export function WhatsAppCta({ message, event, payload, className, children, ariaLabel }: WhatsAppCtaProps) {
  const utm = useUtm()

  return (
    <a
      href={buildWhatsAppLink(message, utm)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() => track(event, payload)}
    >
      {children}
    </a>
  )
}
