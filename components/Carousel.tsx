"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type CarouselProps = {
  /** Título da seção, à esquerda do cabeçalho. */
  title: string
  /** Rótulo do trilho para leitores de tela. Cai no título quando ausente. */
  ariaLabel?: string
  /** Os slides. Cada um define a própria largura (ex.: w-[72%] sm:w-[28%]). */
  children: ReactNode
  /** Sem respiro entre os slides — para cards encostados com divisória de 1px. */
  colado?: boolean
}

// Carrossel horizontal único da home: categorias, produtos e marcas usam este
// mesmo componente, então as setas são idênticas nas três seções.
// A rolagem é nativa (scroll + snap); as setas só empurram o trilho.
export function Carousel({ title, ariaLabel, children, colado = false }: CarouselProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const sync = useCallback(() => {
    const el = railRef.current
    if (!el) return
    // Folga de 4px: navegadores arredondam scrollLeft e a seta piscaria no fim.
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    sync()
    el.addEventListener("scroll", sync, { passive: true })
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => {
      el.removeEventListener("scroll", sync)
      observer.disconnect()
    }
  }, [sync])

  const step = (direction: -1 | 1) => {
    const el = railRef.current
    if (!el) return
    const first = el.firstElementChild as HTMLElement | null
    const amount = first ? first.offsetWidth + 16 : el.clientWidth * 0.8
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollBy({ left: direction * amount, behavior: reduced ? "auto" : "smooth" })
  }

  return (
    <>
      <div className="flex items-end justify-between gap-6">
        <h2 className="font-display text-2xl font-medium text-text-primary sm:text-[28px]">
          {title}
        </h2>

        <div className="hidden shrink-0 gap-2 sm:flex">
          <ArrowButton
            direction="prev"
            enabled={canPrev}
            onClick={() => step(-1)}
            label={`Ver ${title.toLowerCase()} anteriores`}
          />
          <ArrowButton
            direction="next"
            enabled={canNext}
            onClick={() => step(1)}
            label={`Ver mais ${title.toLowerCase()}`}
          />
        </div>
      </div>

      {/* Sangria lateral: o primeiro slide nasce alinhado ao container e o
          último respira até a borda da tela. */}
      <div
        ref={railRef}
        className={`rail no-scrollbar mt-8 ${colado ? "gap-0" : "gap-6"}`}
        aria-label={ariaLabel ?? title}
      >
        {children}
      </div>
    </>
  )
}

function ArrowButton({
  direction,
  enabled,
  onClick,
  label,
}: {
  direction: "prev" | "next"
  enabled: boolean
  onClick: () => void
  label: string
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center border border-border transition-colors ${
        enabled
          ? "text-text-primary hover:border-text-primary"
          : "cursor-default text-text-secondary/50"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} />
    </button>
  )
}
