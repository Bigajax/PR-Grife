"use client"

import { useEffect, useState } from "react"
import type { UtmData } from "@/lib/whatsapp"

const UTM_KEY = "prgrife-utm"

// Captura UTMs na entrada e preserva durante toda a navegação (sessionStorage).
export function useUtm(): UtmData {
  const [utm, setUtm] = useState<UtmData>({})

  useEffect(() => {
    let next: UtmData | null = null
    try {
      const params = new URLSearchParams(window.location.search)
      const source = params.get("utm_source")
      const campaign = params.get("utm_campaign")
      if (source) {
        next = { utm_source: source, utm_campaign: campaign ?? undefined }
        sessionStorage.setItem(UTM_KEY, JSON.stringify(next))
      } else {
        const stored = sessionStorage.getItem(UTM_KEY)
        if (stored) next = JSON.parse(stored)
      }
    } catch {
      // sessionStorage indisponível — segue sem UTM
    }
    // Hidratação única a partir da URL/sessionStorage (indisponível no SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (next) setUtm(next)
  }, [])

  return utm
}
