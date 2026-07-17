"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CONSENT_KEY } from "@/lib/tracking"

// Banner LGPD simples: a mensuração só liga após aceite; a recusa é respeitada.
export function ConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let shouldShow = false
    try {
      shouldShow = localStorage.getItem(CONSENT_KEY) === null
    } catch {
      // sem localStorage, sem banner
    }
    // Decisão única de exibição após montagem (localStorage indisponível no SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(shouldShow)
  }, [])

  if (!show) return null

  const decide = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(CONSENT_KEY, value)
    } catch {
      // segue sem persistir
    }
    setShow(false)
  }

  return (
    <div
      role="region"
      aria-label="Aviso de privacidade"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border-gray bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-5"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-[13px] leading-relaxed text-text-gray">
          Usamos cookies para medir o desempenho da vitrine e melhorar o seu atendimento. Você
          escolhe:{" "}
          <Link href="/politicas/privacidade" className="underline underline-offset-2 hover:text-gold-dark">
            saiba mais
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2.5">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="min-h-11 rounded-full border border-border-gray bg-white px-5 text-[13px] font-semibold text-text-gray"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="min-h-11 rounded-full bg-black-soft px-5 text-[13px] font-semibold text-off-white"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
