"use client"

import Image from "next/image"
import Link from "next/link"
import { Plus, Check } from "lucide-react"
import type { Product } from "@/types"
import { formatPrice } from "@/lib/format"
import { badgeLabels, stockLabels } from "@/lib/badges"
import { useSelection } from "@/hooks/useSelection"

export function ProductCard({ product }: { product: Product }) {
  const { add, has } = useSelection()
  const inSelection = has(product.id)
  const hoverImage = product.images[1]
  const href = `/produto/${product.slug}`

  return (
    <article className="group relative flex flex-col">
      {/* Controle de seleção: irmão do link (fica acima) para não navegar ao clicar. */}
      <button
        type="button"
        onClick={() => add(product.id)}
        aria-label={
          inSelection ? `${product.name} já está na sua seleção` : `Adicionar ${product.name} à minha seleção`
        }
        title={inSelection ? "Na sua seleção" : "Adicionar à seleção"}
        className={`absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
          inSelection
            ? "border-gold bg-gold text-white"
            : "border-border-gray bg-white/95 text-black-soft hover:border-gold hover:text-gold-dark"
        }`}
      >
        {inSelection ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
      </button>

      <Link href={href} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-beige-light transition-shadow duration-300 group-hover:shadow-[0_16px_40px_-20px_rgba(23,23,22,0.28)]">
          <Image
            src={product.thumbnail}
            alt={`${product.name} — ${product.brand}`}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={`img-zoom object-cover ${hoverImage ? "transition-opacity duration-300 group-hover:opacity-0" : ""}`}
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
          {product.badges?.[0] && (
            <span className="absolute left-3 top-3 bg-off-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-dark">
              {badgeLabels[product.badges[0]]}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-gray">{product.brand}</p>
          {/* Altura reservada para 2 linhas: mantém preço/cores/CTA alinhados entre cards vizinhos */}
          <h3 className="mt-1.5 line-clamp-2 min-h-[2.7rem] text-[15px] font-medium leading-snug text-black-soft">
            {product.name}
          </h3>

          {product.price != null && (
            <p className="mt-2 text-base font-bold text-black-soft">
              {formatPrice(product.price)}
              {product.installmentText && (
                <span className="ml-1.5 text-[13px] font-normal text-text-gray">{product.installmentText}</span>
              )}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            {product.availableColors.slice(0, 4).map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="h-3.5 w-3.5 rounded-full border border-border-gray"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {product.availableSizes.length > 0 && (
              <span className="ml-auto text-[13px] text-text-gray">
                {product.availableSizes[0]}–{product.availableSizes[product.availableSizes.length - 1]}
              </span>
            )}
          </div>

          <p
            className={`mt-2 text-[13px] ${
              product.stockStatus === "available" ? "text-text-gray" : "text-gold-dark"
            }`}
          >
            {stockLabels[product.stockStatus]}
          </p>

          <span className="mt-auto inline-flex items-center gap-1.5 self-start border-b border-black-soft pb-0.5 pt-3 text-[13px] font-semibold text-black-soft transition-colors group-hover:border-gold group-hover:text-gold-dark">
            Ver detalhes
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  )
}
