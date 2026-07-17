"use client"

import { useEffect, useState } from "react"
import { Plus, Check, Share2, Truck, Store, PackageOpen } from "lucide-react"
import type { Product } from "@/types"
import { formatPrice } from "@/lib/format"
import { stockLabels } from "@/lib/badges"
import { buildWhatsAppLink, templates } from "@/lib/whatsapp"
import { useUtm } from "@/hooks/useUtm"
import { useSelection } from "@/hooks/useSelection"
import { track } from "@/lib/tracking"

export function ProductBuyBox({ product }: { product: Product }) {
  const utm = useUtm()
  const { add, has } = useSelection()
  const inSelection = has(product.id)

  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(
    product.availableColors.length === 1 ? product.availableColors[0].name : null
  )
  const [sizeHint, setSizeHint] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  useEffect(() => {
    track("view_product", { product_id: product.id, product_name: product.name })
  }, [product.id, product.name])

  const needsSize = product.availableSizes.length > 0

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
    if (needsSize && !size) {
      e.preventDefault()
      setSizeHint(true)
      return
    }
    track("product_whatsapp_click", { product_id: product.id, size, color })
  }

  const shareProduct = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      if (navigator.share) await navigator.share({ title: product.name, url })
      else await navigator.clipboard.writeText(url)
    } catch {
      // usuário cancelou o compartilhamento
    }
  }

  const url = typeof window !== "undefined" ? window.location.href : undefined

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-gray">{product.brand}</p>
      <h1 className="font-display mt-2 text-3xl font-medium leading-tight text-black-soft sm:text-4xl">
        {product.name}
      </h1>
      <p className="mt-1.5 text-[13px] text-text-gray">Código: {product.productCode}</p>

      {product.price != null && (
        <p className="mt-4 text-2xl font-bold text-black-soft">
          {formatPrice(product.price)}
          {product.installmentText && (
            <span className="ml-2 text-sm font-normal text-text-gray">{product.installmentText}</span>
          )}
        </p>
      )}
      <p className="mt-1 text-xs text-text-gray">Valor demonstrativo — confirme no atendimento.</p>

      {needsSize && (
        <fieldset className="mt-6">
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
            {product.availableSizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => pickSize(s)}
                aria-pressed={size === s}
                className={`min-h-11 min-w-11 rounded-full border px-3 text-sm font-medium transition-colors ${
                  size === s
                    ? "border-black-soft bg-black-soft text-off-white"
                    : "border-border-gray bg-white text-black-soft hover:border-gold"
                }`}
              >
                {s}
              </button>
            ))}
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
            {product.availableColors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => pickColor(c.name)}
                aria-pressed={color === c.name}
                className={`flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors ${
                  color === c.name
                    ? "border-black-soft bg-white font-semibold text-black-soft"
                    : "border-border-gray bg-white text-text-gray hover:border-gold"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-border-gray"
                  style={{ backgroundColor: c.hex }}
                  aria-hidden="true"
                />
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <p className="mt-5 text-sm font-medium text-gold-dark">{stockLabels[product.stockStatus]}</p>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-2.5">
        <a
          href={buildWhatsAppLink(templates.produtoDetalhe(product, size ?? undefined, color ?? undefined, url), utm)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onConsult}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-black-soft px-6 text-sm font-semibold text-off-white transition-colors hover:bg-graphite"
        >
          Consultar disponibilidade
        </a>
        <div className="flex gap-2.5">
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
