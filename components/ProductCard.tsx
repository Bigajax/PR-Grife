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
  // O kit é vendido pela foto: o look inteiro montado. O enquadramento padrão
  // (quadrado com respiro interno) encolheria justamente a única coisa que ele
  // tem para mostrar, então a foto ocupa o card inteiro.
  const editorial = product.category === "kits"
  // Retrato SEMPRE que for kit, inclusive no carrossel. Já tentei deixar o
  // trilho quadrado para as alturas baterem, mas um recorte quadrado numa foto
  // 9:16 come 44% da altura: o boné encosta na borda de cima e o tênis na de
  // baixo, e o look aparece cortado nas duas pontas. Emenda de altura no
  // trilho é problema menor que decapitar a composição.
  const retrato = editorial
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

      <div
        className={`relative w-full overflow-hidden bg-bg-surface ${
          retrato ? "aspect-[3/4]" : "aspect-square"
        }`}
      >
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {/* Produto publicado sem foto derrubava o next/image em runtime
              ("Image is missing required src"), quebrando a grade inteira por
              causa de UM cadastro. O painel já tratava esse caso; aqui não.
              Agora o card degrada para um selo discreto, como no painel. */}
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 62vw"
              className={`${editorial ? "img-zoom object-cover" : "object-contain p-3"} ${
                soldOut ? "opacity-60 saturate-0" : ""
              } ${
                hoverImage && !soldOut ? "transition-opacity duration-300 group-hover:opacity-0" : ""
              }`}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.18em] text-text-secondary">
              Sem foto
            </span>
          )}
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
              // Pílula solta do canto, não etiqueta colada na quina: com raio
              // total e sombra baixa ela pousa sobre a foto em vez de recortar
              // o card — é o mesmo acabamento dos botões do site.
              <span
                className="absolute left-2.5 top-2.5 z-10 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase leading-none tracking-[0.08em] text-text-primary shadow-[0_2px_8px_rgba(28,28,26,0.22)]"
                style={{
                  background:
                    "linear-gradient(135deg, #E3CD9A 0%, #C2A15D 55%, #A8853F 100%)",
                }}
              >
                {badge.text}
              </span>
            ) : (
              // Mesma pílula em grafite. Fica embaixo porque é informativa
              // ("Novo", "Esgotado"): não disputa a primeira leitura do card.
              <span className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-text-primary px-3 py-1.5 text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-white shadow-[0_2px_8px_rgba(28,28,26,0.22)]">
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
          className="tap flex min-h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-text-primary px-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-primary hover:bg-text-primary hover:text-white"
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
            className={`tap flex w-11 shrink-0 items-center justify-center rounded-full border ${
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
