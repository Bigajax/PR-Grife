"use client"

import { useEffect, useRef, useState } from "react"
import { siteConfig } from "@/data/site.config"
import { DiamondMark } from "@/components/Logo"

const MIN_SHOW = 700 // ms mínimos com a logo na tela (evita "flash")
const MAX_WAIT = 7000 // teto: sai mesmo se algum asset demorar
const ROW_STEP = 55 // ms entre uma fileira e a de cima
const JITTER = 110 // aleatoriedade por quadrado (o "pixelado")

/**
 * Tela de carregamento: overlay branco com o diamante + wordmark,
 * que se desfaz numa grade de quadrados de baixo para cima (pixel
 * dissolve). Sai no window load, com tempo mínimo e teto de segurança.
 */
export function SiteLoader() {
  const ref = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const loader = ref.current
    if (!loader) return
    document.body.classList.add("loading")
    const t0 = performance.now()
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches

    let leaving = false
    const done = () => {
      document.body.classList.remove("loading")
      setGone(true)
    }
    const leave = () => {
      if (leaving) return // load + teto de segurança podem chamar 2x
      leaving = true
      if (reduced) {
        loader.classList.add("leaving")
        setTimeout(done, 450)
        return
      }
      // grade de "pixels": ~9 colunas no celular, quadrados de ~120px no desktop
      const cell = Math.min(Math.max(window.innerWidth / 9, 44), 120)
      const cols = Math.ceil(window.innerWidth / cell)
      const rows = Math.ceil(window.innerHeight / cell)
      const grid = document.createElement("div")
      grid.className = "site-loader-grid"
      grid.setAttribute("aria-hidden", "true")
      grid.style.gridTemplateColumns = `repeat(${cols},1fr)`
      grid.style.gridTemplateRows = `repeat(${rows},1fr)`
      let maxDelay = 0
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const s = document.createElement("span")
          const delay = (rows - 1 - r) * ROW_STEP + Math.random() * JITTER
          s.style.transitionDelay = `${delay.toFixed(0)}ms`
          if (delay > maxDelay) maxDelay = delay
          grid.appendChild(s)
        }
      }
      loader.appendChild(grid)
      // dois frames: garante que a grade pintou antes de o fundo sumir
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          loader.classList.add("leaving")
          setTimeout(done, maxDelay + 350)
        })
      )
    }

    const exitAfterMin = () => {
      const elapsed = performance.now() - t0
      setTimeout(leave, Math.max(0, MIN_SHOW - elapsed))
    }
    if (document.readyState === "complete") exitAfterMin()
    else window.addEventListener("load", exitAfterMin, { once: true })
    const cap = setTimeout(leave, MAX_WAIT) // segurança: nunca prende o visitante

    return () => {
      clearTimeout(cap)
      document.body.classList.remove("loading")
    }
  }, [])

  if (gone) return null

  return (
    <div ref={ref} className="site-loader" role="status" aria-label="Carregando">
      <div className="site-loader-center">
        {/* Mesmo lockup do Logo (diamante + wordmark), empilhado para a tela cheia */}
        <DiamondMark className="h-10 w-10" />
        <span className="mt-4 font-sans text-sm font-semibold uppercase tracking-[0.32em] text-black-soft">
          {siteConfig.name}
        </span>
        <p className="site-loader-text">Carregando…</p>
      </div>
    </div>
  )
}
