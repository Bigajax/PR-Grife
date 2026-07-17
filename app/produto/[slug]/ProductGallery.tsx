"use client"

import { useState } from "react"
import Image from "next/image"
import { badgeLabels } from "@/lib/badges"
import type { Product } from "@/types"

// Galeria: imagem principal com zoom ao passar o mouse (desktop) e miniaturas.
// Mobile: troca por toque nas miniaturas.
export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const src = product.images[active] ?? product.thumbnail

  return (
    <div className="lg:sticky lg:top-24">
      <div
        className="group relative aspect-[4/5] w-full overflow-hidden bg-beige-light"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          key={src}
          src={src}
          alt={`${product.name} — ${product.brand}`}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-200"
          style={zoom ? { transform: "scale(1.6)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
        {product.badges?.[0] && (
          <span className="absolute left-4 top-4 bg-off-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-dark">
            {badgeLabels[product.badges[0]]}
          </span>
        )}
      </div>

      {product.images.length > 1 && (
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
  )
}
