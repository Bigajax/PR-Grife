"use client"

import { useEffect, useState } from "react"
import { siteConfig } from "@/data/site.config"

// Barra fina de avisos. Desktop: mensagens distribuídas. Mobile: uma por vez.
export function AnnouncementBar() {
  const messages = siteConfig.announcements
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4000)
    return () => clearInterval(id)
  }, [messages.length])

  return (
    <div className="bg-graphite text-off-white">
      <div className="mx-auto hidden max-w-6xl items-center justify-between gap-6 px-6 py-2 md:flex">
        {messages.map((msg) => (
          <p key={msg} className="text-[11px] font-medium uppercase tracking-[0.18em] text-sand">
            {msg}
          </p>
        ))}
      </div>
      <div className="relative flex h-8 items-center justify-center overflow-hidden md:hidden" aria-live="polite">
        {messages.map((msg, i) => (
          <p
            key={msg}
            className={`absolute text-[11px] font-medium uppercase tracking-[0.18em] text-sand transition-opacity duration-500 ${
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
