"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X } from "lucide-react"
import type { Product } from "@/types"
import { formatPrice } from "@/lib/format"
import { isOnSale } from "@/lib/catalog"
import { isOptionAvailable } from "@/lib/stock"
import { buildWhatsAppLink, buildOrderMessage } from "@/lib/whatsapp"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { useUtm } from "@/hooks/useUtm"
import { track } from "@/lib/tracking"

// Ver rápido: escolhe cor e tamanho sem sair da home e dispara o mesmo pedido
// padronizado da PDP. O botão fica travado até as duas escolhas existirem —
// pedido sem tamanho e cor chega incompleto no atendimento.
export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const utm = useUtm()
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)

  useFocusTrap(ref, product != null, onClose)

  // Cor única é escolha implícita: não faz sentido pedir para clicar.
  const corResolvida = useMemo(
    () => color ?? (product?.availableColors.length === 1 ? product.availableColors[0].name : null),
    [color, product]
  )

  if (!product) return null

  const precisaTamanho = product.availableSizes.length > 0
  const precisaCor = product.availableColors.length > 0
  const faltando = [
    precisaTamanho && !size ? "o tamanho" : null,
    precisaCor && !corResolvida ? "a cor" : null,
  ]
    .filter(Boolean)
    .join(" e ")
  const pronto = faltando.length === 0
  const sale = isOnSale(product)

  const href = buildWhatsAppLink(
    buildOrderMessage([
      { product, size: size ?? undefined, color: corResolvida ?? undefined },
    ]),
    utm
  )

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={product.name}>
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-text-primary/45"
      />

      <div
        ref={ref}
        className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto bg-bg-elevated sm:inset-0 sm:m-auto sm:h-fit sm:max-w-2xl"
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
            Ver rápido
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar ver rápido"
            className="-mr-2 -mt-2 flex h-10 w-10 items-center justify-center text-text-primary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[200px_1fr]">
          <div className="relative aspect-square w-full shrink-0 bg-bg-surface">
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              sizes="200px"
              className="object-contain p-3"
            />
          </div>

          <div>
            <h2 className="font-display text-xl font-medium text-text-primary">{product.name}</h2>
            {product.price != null && (
              <p className="mt-2 text-[15px] font-semibold text-text-primary">
                {formatPrice(product.price)}
                {sale && product.oldPrice != null && (
                  <span className="ml-2 text-[13px] font-normal text-text-secondary line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </p>
            )}

            {precisaCor && (
              <fieldset className="mt-5">
                <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-primary">
                  Cor
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.availableColors.map((c) => {
                    const esgotada = !isOptionAvailable(product, { size, color: c.name })
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setColor(c.name)}
                        disabled={esgotada}
                        aria-pressed={corResolvida === c.name}
                        aria-label={esgotada ? `${c.name} — esgotada` : undefined}
                        className={`min-h-10 border px-3 text-sm transition-colors ${
                          esgotada
                            ? "cursor-not-allowed border-border text-text-secondary/50 line-through"
                            : corResolvida === c.name
                              ? "border-text-primary font-semibold text-text-primary"
                              : "border-border text-text-secondary hover:border-accent"
                        }`}
                      >
                        {c.name}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}

            {precisaTamanho && (
              <fieldset className="mt-4">
                <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-primary">
                  Tamanho
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.availableSizes.map((s) => {
                    const esgotado = !isOptionAvailable(product, { size: s, color: corResolvida })
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        disabled={esgotado}
                        aria-pressed={size === s}
                        aria-label={esgotado ? `${s} — esgotado` : undefined}
                        className={`min-h-10 min-w-10 border px-3 text-sm transition-colors ${
                          esgotado
                            ? "cursor-not-allowed border-border text-text-secondary/50 line-through"
                            : size === s
                              ? "border-text-primary font-semibold text-text-primary"
                              : "border-border text-text-secondary hover:border-accent"
                        }`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}

            <div className="mt-6">
              {pronto ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track("product_whatsapp_click", {
                      product_id: product.id,
                      product_name: product.name,
                      brand: product.brand,
                      page_origin: "ver_rapido",
                      size,
                      color: corResolvida,
                    })
                  }
                  className="tap inline-flex min-h-12 w-full items-center justify-center rounded-full bg-text-primary px-6 text-sm font-semibold text-white hover:opacity-90"
                >
                  Pedir no WhatsApp
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    aria-describedby="ver-rapido-pendente"
                    className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-text-primary/40 px-6 text-sm font-semibold text-white"
                  >
                    Pedir no WhatsApp
                  </button>
                  <p id="ver-rapido-pendente" className="mt-2 text-[13px] text-accent-strong">
                    Escolha {faltando} para pedir.
                  </p>
                </>
              )}

              <Link
                href={`/produto/${product.slug}`}
                className="mt-3 inline-block text-[13px] text-text-secondary underline underline-offset-4 hover:text-accent-strong"
              >
                Ver todos os detalhes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
