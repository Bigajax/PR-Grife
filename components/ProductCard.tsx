"use client"

import Image from "next/image"
import Link from "next/link"
import { Eye, MessageCircle, ShoppingBag } from "lucide-react"
import type { Product } from "@/types"
import { formatPrice } from "@/lib/format"
import { isOnSale } from "@/lib/catalog"
import { isOptionAvailable } from "@/lib/stock"
import { templates } from "@/lib/whatsapp"
import { FavoriteButton } from "@/components/FavoriteButton"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { useSelection } from "@/hooks/useSelection"

// Um único badge por card, resolvido por hierarquia: oferta > últimas
// unidades > novo. Destacar tudo é não destacar nada. A etiqueta de oferta
// aparece sozinha assim que o dono preenche o preço "de" no painel, e ganha
// o rosé da casa para não se confundir com as etiquetas informativas.
function cardBadge(product: Product): { text: string; oferta?: boolean } | null {
  if (product.stockStatus === "out_of_stock") return { text: "Esgotado" }
  if (isOnSale(product) && product.oldPrice && product.price) {
    const off = Math.round((1 - product.price / product.oldPrice) * 100)
    return { text: off > 0 ? `Oferta · -${off}%` : "Oferta", oferta: true }
  }
  if (product.stockStatus === "low_stock") return { text: "Últimas unidades" }
  if (product.newArrival || product.badges?.includes("novo")) return { text: "Novo" }
  return null
}

// Rodapé do card: contagem de cores quando há variação, senão a faixa de
// tamanhos. Nunca os dois — a PDP mostra o detalhe.
function variantLine(product: Product): string | null {
  const colors = product.availableColors.length
  if (colors > 1) return `+${colors} cores`
  const sizes = product.availableSizes
  if (sizes.length > 1) return `${sizes[0]}–${sizes[sizes.length - 1]}`
  return sizes[0] ?? null
}

export function ProductCard({
  product,
  compact = false,
  onQuickView,
}: {
  product: Product
  /** Versão de vitrine curta: sem coração e sem tamanhos no hover. */
  compact?: boolean
  /** Quando presente, mostra o botão "ver rápido" no canto da imagem. */
  onQuickView?: (product: Product) => void
}) {
  const { add, has, openDrawer } = useSelection()
  const soldOut = product.stockStatus === "out_of_stock"
  const sale = isOnSale(product)
  const badge = cardBadge(product)
  const hoverImage = product.images[1]
  const variant = variantLine(product)
  const href = `/produto/${product.slug}`
  // Nunca oferecer chip de tamanho zerado (estoque por variação).
  const sizes =
    compact || soldOut
      ? []
      : product.availableSizes.filter((s) => isOptionAvailable(product, { size: s }))

  return (
    <article className="group relative flex flex-col">
      {/* Irmão do link, não filho: tocar no coração não navega. */}
      {!compact && (
        <div className="absolute right-1 top-1 z-20">
          <FavoriteButton
            productId={product.id}
            productName={product.name}
            className="rounded-full"
          />
        </div>
      )}

      <div className="relative aspect-square w-full overflow-hidden bg-bg-surface">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 62vw"
            className={`object-contain p-3 ${soldOut ? "opacity-60 saturate-0" : ""} ${
              hoverImage && !soldOut ? "transition-opacity duration-300 group-hover:opacity-0" : ""
            }`}
          />
          {hoverImage && !soldOut && (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 62vw"
              className="object-contain p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
          {badge &&
            (badge.oferta ? (
              // Oferta: ouro da casa (mesmo #C2A15D do diamante do logo), no
              // canto superior esquerdo para saltar aos olhos sem brigar com o
              // coração de favoritos (superior direito).
              <span
                className="absolute left-0 top-0 z-10 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-text-primary shadow-sm"
                style={{
                  background:
                    "linear-gradient(135deg, #E3CD9A 0%, #C2A15D 55%, #A8853F 100%)",
                }}
              >
                {badge.text}
              </span>
            ) : (
              <span className="absolute bottom-0 left-0 z-10 bg-text-primary px-2 py-1 text-[11px] font-semibold text-white">
                {badge.text}
              </span>
            ))}
        </Link>

        {/* Tamanhos no hover: cada um leva à PDP já com ele escolhido.
            Irmãos do link da imagem para não aninhar âncoras. */}
        {sizes.length > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden translate-y-1 flex-wrap justify-center gap-1.5 bg-bg-surface/95 p-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
            {sizes.map((size) => (
              <Link
                key={size}
                href={`${href}?tamanho=${encodeURIComponent(size)}`}
                aria-label={`${product.name} no tamanho ${size}`}
                className="min-w-8 border border-border bg-bg-elevated px-2 py-1 text-center text-xs text-text-primary transition-colors hover:border-accent hover:text-accent-strong"
              >
                {size}
              </Link>
            ))}
          </div>
        )}

        {/* Ver rápido: irmão do link da imagem, senão o clique navegaria. */}
        {onQuickView && !soldOut && (
          <button
            type="button"
            onClick={() => onQuickView(product)}
            aria-label={`Ver rápido: ${product.name}`}
            className="absolute bottom-0 right-0 z-10 flex h-10 w-10 items-center justify-center bg-text-primary text-white transition-opacity hover:opacity-90"
          >
            <Eye className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} />
          </button>
        )}
      </div>

      <Link href={href} className="flex flex-1 flex-col pt-3">
        {product.price != null && (
          <p className="text-[15px] font-semibold text-text-primary">
            {formatPrice(product.price)}
            {sale && product.oldPrice != null && (
              <span className="ml-2 text-[13px] font-normal text-text-secondary line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </p>
        )}

        <h3 className="mt-1 truncate text-sm text-text-primary">{product.name}</h3>

        {variant && <p className="mt-1 text-xs text-text-secondary">{variant}</p>}
      </Link>

      {/* CTA do card: a conversão da loja é o WhatsApp; a sacola ao lado monta
          a seleção para pedir várias peças de uma vez. Esgotado vira pedido de
          aviso de reposição e a sacola some — o card nunca fica sem ação. */}
      <div className="mt-2.5 flex items-stretch gap-2">
        <WhatsAppCta
          message={soldOut ? templates.aviseMe(product) : templates.produto(product)}
          event="product_whatsapp_click"
          payload={{ productId: product.id, placement: "card" }}
          ariaLabel={`${soldOut ? "Pedir aviso de reposição" : "Pedir no WhatsApp"}: ${product.name}`}
          className="flex min-h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap border border-text-primary px-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-primary transition-colors hover:bg-text-primary hover:text-white"
        >
          <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={1.6} />
          {/* Rótulo num span único: como o link é flex, texto solto + span
              virariam dois itens com gap no meio. "Pedir" = mesmo verbo da
              mensagem que abre no WhatsApp ("quero fazer um pedido"). */}
          {soldOut ? (
            <span>Avise-me</span>
          ) : (
            <span>
              Pedir<span className="hidden sm:inline"> no WhatsApp</span>
            </span>
          )}
        </WhatsAppCta>

        {!soldOut && (
          <button
            type="button"
            onClick={() => {
              if (!has(product.id)) add(product.id)
              openDrawer()
            }}
            aria-label={
              has(product.id)
                ? `${product.name} já está na seleção — abrir`
                : `Adicionar ${product.name} à seleção`
            }
            className={`flex w-11 shrink-0 items-center justify-center border transition-colors ${
              has(product.id)
                ? "border-text-primary bg-text-primary text-white"
                : "border-text-primary text-text-primary hover:bg-text-primary hover:text-white"
            }`}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} />
          </button>
        )}
      </div>
    </article>
  )
}
