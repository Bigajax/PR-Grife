"use client"

import { useEffect, useState } from "react"
import { siteConfig } from "@/data/site.config"

// Barra fina do topo, em superfície clara. Desktop: os três avisos numa linha.
// Mobile: um por vez, para caber sem quebrar em duas linhas.
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
    <div className="border-b border-border bg-bg-surface text-text-secondary">
      <p className="shell hidden py-2 text-center text-xs md:block">
        {messages.join(" · ")}
      </p>
      <div
        className="relative flex h-8 items-center justify-center overflow-hidden md:hidden"
        aria-live="polite"
      >
        {messages.map((msg, i) => (
          <p
            key={msg}
            className={`absolute text-xs transition-opacity duration-500 ${
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
