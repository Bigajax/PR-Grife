"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { editorialBadge } from "@/lib/badges"
import type { Product } from "@/types"

// Galeria: swipe com snap + contador no mobile; zoom ao passar o mouse e
// miniaturas no desktop.
export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const src = product.images[active] ?? product.thumbnail
  const badge = product.stockStatus === "out_of_stock" ? null : editorialBadge(product)
  const many = product.images.length > 1

  const onTrackScroll = () => {
    const el = trackRef.current
    if (!el) return
    setMobileIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div className="lg:sticky lg:top-24">
      {/* Mobile: swipe com snap */}
      <div className="relative lg:hidden">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          aria-label={`Galeria de imagens de ${product.name}`}
        >
          {product.images.map((img, i) => (
            <div key={img} className="relative aspect-[4/5] w-full shrink-0 snap-start bg-beige-light">
              <Image
                src={img}
                alt={`${product.name} — imagem ${i + 1} de ${product.images.length}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {badge && (
          <span className="absolute left-0 top-4 bg-black-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-off-white">
            {badge}
          </span>
        )}
        {many && (
          <span
            className="absolute bottom-3 right-3 rounded-full bg-black-soft/70 px-2.5 py-1 text-[11px] font-semibold text-off-white"
            aria-live="polite"
          >
            {mobileIndex + 1}/{product.images.length}
          </span>
        )}
      </div>

      {/* Desktop: imagem principal com zoom suave */}
      <div className="hidden lg:block">
        <div
          className="group relative aspect-[4/5] w-full overflow-hidden bg-beige-light"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setZoom({
              x: ((e.clientX - r.left) / r.width) * 100,
              y: ((e.clientY - r.top) / r.height) * 100,
            })
          }}
          onMouseLeave={() => setZoom(null)}
        >
          <Image
            key={src}
            src={src}
            alt={`${product.name} — ${product.brand}`}
            fill
            priority
            sizes="50vw"
            className="object-cover transition-transform duration-200"
            style={
              zoom
                ? { transform: "scale(1.6)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                : undefined
            }
          />
          {badge && (
            <span className="absolute left-0 top-4 bg-black-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-off-white">
              {badge}
            </span>
          )}
        </div>

        {many && (
          <div className="mt-3 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver imagem ${i + 1} de ${product.name}`}
                aria-pressed={active === i}
                className={`relative aspect-square w-20 overflow-hidden border transition-colors ${
                  active === i ? "border-gold-dark" : "border-border-gray hover:border-gold"
                }`}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
