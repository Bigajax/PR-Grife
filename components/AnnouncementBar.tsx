"use client"

import { useEffect, useState } from "react"
import { siteConfig } from "@/data/site.config"
import { DiamondMark } from "@/components/Logo"

// Faixa do topo em grafite — o único bloco escuro do site, o que a destaca do
// header branco quente logo abaixo. Desktop: todos os avisos numa linha, com o
// diamante da casa como separador. Mobile: um por vez, com fade.
export function AnnouncementBar() {
  const messages = siteConfig.announcements
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4000)
    return () => clearInterval(id)
  }, [messages.length])

  const textCls =
    "text-[10.5px] font-semibold uppercase tracking-[0.22em] text-off-white"

  return (
    <div className="bg-text-primary">
      <div className="shell hidden h-9 items-center justify-center gap-4 md:flex">
        {messages.map((msg, i) => (
          <p key={msg} className={`flex items-center gap-4 ${textCls}`}>
            {i > 0 && (
              <DiamondMark className="h-2 w-2 shrink-0 opacity-80" aria-hidden />
            )}
            {msg}
          </p>
        ))}
      </div>
      <div
        className="relative flex h-9 items-center justify-center overflow-hidden md:hidden"
        aria-live="polite"
      >
        {messages.map((msg, i) => (
          <p
            key={msg}
            className={`absolute transition-opacity duration-500 ${textCls} ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            {msg}
          </p>
        ))}
      </div>
    </div>
  )
}
