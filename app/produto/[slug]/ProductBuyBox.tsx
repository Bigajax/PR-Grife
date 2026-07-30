"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, Check, Share2, Heart, Truck, Store, PackageOpen } from "lucide-react"
import type { Product } from "@/types"
import { formatPrice } from "@/lib/format"
import { stockLabels } from "@/lib/badges"
import { isOnSale } from "@/lib/catalog"
import { effectiveStatus, isOptionAvailable } from "@/lib/stock"
import { buildWhatsAppLink, buildOrderMessage, templates } from "@/lib/whatsapp"
import { siteConfig } from "@/data/site.config"
import { useUtm } from "@/hooks/useUtm"
import { useSelection } from "@/hooks/useSelection"
import { useFavorites } from "@/hooks/useFavorites"
import { track } from "@/lib/tracking"

export function ProductBuyBox({ product }: { product: Product }) {
  const utm = useUtm()
  const { add, has } = useSelection()
  const favorites = useFavorites()
  const inSelection = has(product.id)
  const isFavorite = favorites.has(product.id)

  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(
    product.availableColors.length === 1 ? product.availableColors[0].name : null
  )
  const [sizeHint, setSizeHint] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const sizesRef = useRef<HTMLFieldSetElement>(null)

  useEffect(() => {
    track("view_product", {
      product_id: product.id,
      product_name: product.name,
      brand: product.brand,
      category: product.category,
      availability: product.stockStatus,
    })
  }, [product])

  const needsSize = product.availableSizes.length > 0
  const needsColor = product.availableColors.length > 0
  const soldOut = product.stockStatus === "out_of_stock"
  const sale = isOnSale(product)

  // Com estoque por variação, a linha de disponibilidade acompanha a seleção
  // (Preto/M pode estar em últimas unidades com o produto ainda "disponível").
  // Sem controle de estoque, cai no stockStatus do produto — como sempre foi.
  const selectedStatus = effectiveStatus(product, size, color)
  const onRequest = selectedStatus === "on_request"

  // Cor e tamanho são obrigatórios: sem os dois, o pedido chegaria incompleto
  // no atendimento. O botão fica desabilitado até a escolha estar feita.
  const missing = [needsSize && !size ? "o tamanho" : null, needsColor && !color ? "a cor" : null]
    .filter(Boolean)
    .join(" e ")
  const ready = missing.length === 0

  const pickSize = (s: string) => {
    setSize(s)
    setSizeHint(false)
    track("select_size", { product_id: product.id, size: s })
  }
  const pickColor = (c: string) => {
    setColor(c)
    track("select_color", { product_id: product.id, color: c })
  }

  const onConsult = (e: React.MouseEvent) => {
    if (!soldOut && needsSize && !size) {
      e.preventDefault()
      setSizeHint(true)
      sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    track(soldOut ? "notify_me_whatsapp_click" : "product_whatsapp_click", {
      product_id: product.id,
      product_name: product.name,
      brand: product.brand,
      category: product.category,
      availability: product.stockStatus,
      page_origin: "produto",
      size,
      color,
    })
  }

  const shareProduct = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    track("share_product", { product_id: product.id })
    try {
      if (navigator.share) await navigator.share({ title: product.name, url })
      else await navigator.clipboard.writeText(url)
    } catch {
      // usuário cancelou o compartilhamento
    }
  }

  // URL só após a hidratação: evita divergir do HTML do servidor (o bloco
  // LINK entra na mensagem assim que o cliente monta).
  const [url, setUrl] = useState<string | undefined>(undefined)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(window.location.href)
    // Tamanho escolhido no card da vitrine chega por ?tamanho= — a PDP abre
    // já com ele marcado.
    const wanted = new URLSearchParams(window.location.search).get("tamanho")
    // Só pré-seleciona tamanho que exista E tenha estoque (ou seja encomenda).
    if (
      wanted &&
      product.availableSizes.includes(wanted) &&
      isOptionAvailable(product, { size: wanted })
    )
      setSize(wanted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  // Rótulo do CTA acompanha a disponibilidade (regra do Guia Mestre).
  const ctaLabel = soldOut
    ? "Avise-me quando voltar"
    : onRequest
      ? "Encomendar no WhatsApp"
      : "Pedir no WhatsApp"
  const ctaHref = buildWhatsAppLink(
    soldOut
      ? templates.aviseMe(product, size ?? undefined, url)
      : buildOrderMessage([
          { product, size: size ?? undefined, color: color ?? undefined, url },
        ]),
    utm
  )

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-gray">{product.brand}</p>
      <h1 className="font-display mt-2 text-3xl font-medium leading-tight text-black-soft sm:text-4xl">
        {product.name}
      </h1>
      <p className="mt-1.5 text-[13px] text-text-gray">Código: {product.productCode}</p>

      {product.price != null && (
        <p className="mt-4 text-2xl font-bold text-black-soft">
          {sale && product.oldPrice != null && (
            <span className="mr-2 text-base font-normal text-text-gray line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          {formatPrice(product.price)}
          {product.installmentText && (
            <span className="ml-2 text-sm font-normal text-text-gray">{product.installmentText}</span>
          )}
        </p>
      )}
      {/* Formas de pagamento da loja — fonte única em site.config. */}
      <p className="mt-1.5 text-[13px] font-medium text-black-soft">{siteConfig.paymentText}</p>
      <p className="mt-1 text-xs text-text-gray">Valor demonstrativo — confirme no atendimento.</p>

      {needsSize && (
        <fieldset className="mt-6 scroll-mt-24" id="tamanhos" ref={sizesRef}>
          <div className="flex items-center justify-between">
            <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black-soft">Tamanho</legend>
            <button
              type="button"
              onClick={() => setGuideOpen((v) => !v)}
              aria-expanded={guideOpen}
              className="text-[12px] font-medium text-gold-dark hover:underline"
            >
              Guia de medidas
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {product.availableSizes.map((s) => {
              const esgotado = !isOptionAvailable(product, { size: s, color })
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => pickSize(s)}
                  disabled={esgotado}
                  aria-pressed={size === s}
                  aria-label={esgotado ? `${s} — esgotado` : undefined}
                  className={`min-h-11 min-w-11 rounded-full border px-3 text-sm font-medium transition-colors ${
                    esgotado
                      ? "cursor-not-allowed border-border-gray bg-white text-text-gray/50 line-through"
                      : size === s
                        ? "border-black-soft bg-black-soft text-off-white"
                        : "border-border-gray bg-white text-black-soft hover:border-gold"
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
          {sizeHint && (
            <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-gold-dark" role="alert">
              <span aria-hidden="true">→</span> Escolha um tamanho para consultar esta peça.
            </p>
          )}
          {guideOpen && (
            <div className="mt-3 border border-border-gray bg-off-white p-4 text-[13px] leading-relaxed text-text-gray">
              No atendimento enviamos as medidas exatas desta peça e comparamos com algo que você já
              usa. [TODO_CONFIRMAR: tabela de medidas oficial da PR Grife]
            </div>
          )}
        </fieldset>
      )}

      {product.availableColors.length > 0 && (
        <fieldset className="mt-5">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black-soft">Cor</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {product.availableColors.map((c) => {
              const esgotada = !isOptionAvailable(product, { size, color: c.name })
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => pickColor(c.name)}
                  disabled={esgotada}
                  aria-pressed={color === c.name}
                  aria-label={esgotada ? `${c.name} — esgotada` : undefined}
                  className={`flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors ${
                    esgotada
                      ? "cursor-not-allowed border-border-gray bg-white text-text-gray/50 line-through"
                      : color === c.name
                        ? "border-black-soft bg-white font-semibold text-black-soft"
                        : "border-border-gray bg-white text-text-gray hover:border-gold"
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full border border-border-gray ${esgotada ? "opacity-40" : ""}`}
                    style={{ backgroundColor: c.hex }}
                    aria-hidden="true"
                  />
                  {c.name}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <p className={`mt-5 text-sm font-medium ${selectedStatus === "out_of_stock" ? "text-text-gray" : "text-gold-dark"}`}>
        {stockLabels[selectedStatus]}
        {onRequest && ` — prazo estimado: ${siteConfig.leadTimeText}`}
      </p>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-2.5">
        {soldOut || ready ? (
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onConsult}
            className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors ${
              soldOut
                ? "border border-black-soft bg-white text-black-soft hover:border-gold-dark hover:text-gold-dark"
                : "bg-black-soft text-off-white hover:bg-graphite"
            }`}
          >
            {ctaLabel}
          </a>
        ) : (
          <>
            <button
              type="button"
              disabled
              aria-describedby="cta-pendente"
              className="inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-full bg-black-soft/40 px-6 text-sm font-semibold text-off-white"
            >
              {ctaLabel}
            </button>
            <p id="cta-pendente" className="text-[13px] font-medium text-gold-dark">
              Escolha {missing} para pedir.
            </p>
          </>
        )}
        <div className="flex gap-2.5">
          {!soldOut && (
            <button
              type="button"
              onClick={() => add(product.id, size ?? undefined, color ?? undefined)}
              className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
                inSelection
                  ? "border-gold bg-gold/10 text-gold-dark"
                  : "border-border-gray bg-white text-black-soft hover:border-gold"
              }`}
            >
              {inSelection ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" /> Na seleção
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Adicionar à seleção
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => favorites.toggle(product.id)}
            aria-pressed={isFavorite}
            className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
              isFavorite
                ? "border-gold bg-gold/10 text-gold-dark"
                : "border-border-gray bg-white text-black-soft hover:border-gold"
            }`}
          >
            <Heart
              className="h-4 w-4"
              fill={isFavorite ? "currentColor" : "none"}
              aria-hidden="true"
            />
            {isFavorite ? "Nos favoritos" : "Salvar nos favoritos"}
          </button>
          <button
            type="button"
            onClick={shareProduct}
            aria-label="Compartilhar produto"
            className="inline-flex min-h-12 w-12 items-center justify-center rounded-full border border-border-gray bg-white text-black-soft transition-colors hover:border-gold"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* CTA fixo no mobile: some no desktop; respeita safe-area do iPhone. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-border-gray bg-off-white/95 px-5 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        {product.price != null && (
          <span className="shrink-0 text-base font-bold text-black-soft">
            {formatPrice(product.price)}
          </span>
        )}
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onConsult}
          className={`inline-flex min-h-12 flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold ${
            soldOut
              ? "border border-black-soft bg-white text-black-soft"
              : "bg-black-soft text-off-white"
          }`}
        >
          {ctaLabel}
        </a>
      </div>

      {/* Descrição e ficha */}
      <div className="mt-8 border-t border-border-gray pt-6">
        <p className="text-sm leading-relaxed text-text-gray">
          {product.fullDescription ?? product.shortDescription}
        </p>
        <dl className="mt-4 space-y-1.5 text-sm text-text-gray">
          {product.material && (
            <div className="flex gap-2">
              <dt className="font-medium text-black-soft">Material:</dt>
              <dd>{product.material}</dd>
            </div>
          )}
          {product.fit && (
            <div className="flex gap-2">
              <dt className="font-medium text-black-soft">Modelagem:</dt>
              <dd>{product.fit}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Entrega, retirada, condicional */}
      <ul className="mt-6 space-y-3 border-t border-border-gray pt-6 text-sm text-text-gray">
        <li className="flex items-start gap-3">
          <Truck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-dark" strokeWidth={1.5} aria-hidden="true" />
          Entrega para todo o Brasil — combinamos prazo e frete no atendimento.
        </li>
        <li className="flex items-start gap-3">
          <Store className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-dark" strokeWidth={1.5} aria-hidden="true" />
          Retirada na loja física em Maringá.
        </li>
        <li className="flex items-start gap-3">
          <PackageOpen className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-dark" strokeWidth={1.5} aria-hidden="true" />
          Condicional sob consulta — sujeito à localização, análise, disponibilidade e regras da loja.
        </li>
      </ul>
    </div>
  )
}
