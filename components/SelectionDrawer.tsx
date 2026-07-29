"use client"

import { useRef } from "react"
import Image from "next/image"
import { X, Trash2 } from "lucide-react"
import { useSelection } from "@/hooks/useSelection"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { useUtm } from "@/hooks/useUtm"
import { buildWhatsAppLink, buildOrderMessage } from "@/lib/whatsapp"
import { productById } from "@/data/products"
import { formatPrice } from "@/lib/format"
import { track } from "@/lib/tracking"
import { DiamondMark } from "@/components/Logo"

// Minha seleção: drawer lateral (desktop) / bottom sheet (mobile). Não é carrinho —
// o fechamento acontece no WhatsApp.
export function SelectionDrawer() {
  const { items, isOpen, closeDrawer, remove, update } = useSelection()
  const utm = useUtm()
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, isOpen, closeDrawer)

  if (!isOpen) return null

  const resolved = items
    .map((item) => ({ item, product: productById(item.productId) }))
    .filter((r): r is { item: (typeof items)[number]; product: NonNullable<ReturnType<typeof productById>> } =>
      r.product != null
    )

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Minha seleção">
      <button
        type="button"
        aria-label="Fechar minha seleção"
        onClick={closeDrawer}
        className="absolute inset-0 bg-black-soft/45"
      />

      <div
        ref={ref}
        className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl bg-off-white sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-border-gray"
      >
        <div className="flex items-center justify-between border-b border-border-gray px-5 py-4">
          <h2 className="font-display text-2xl font-medium text-black-soft">Minha seleção</h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Fechar"
            className="flex h-11 w-11 items-center justify-center rounded-full text-black-soft hover:text-gold-dark"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {resolved.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
            <DiamondMark className="h-8 w-8" stroke="#DDD2C3" />
            <p className="font-display text-xl text-black-soft">Sua seleção está vazia.</p>
            <p className="text-sm text-text-gray">
              Toque no “+” das peças que gostar para montar a sua seleção e enviar tudo de uma vez
              no WhatsApp.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border-gray overflow-y-auto px-5">
              {resolved.map(({ item, product }) => (
                <li key={product.id} className="flex gap-4 py-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-beige-light">
                    <Image src={product.thumbnail} alt={product.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-gray">
                      {product.brand}
                    </p>
                    <p className="text-sm font-medium text-black-soft">{product.name}</p>
                    {product.price != null && (
                      <p className="mt-0.5 text-[13px] font-semibold text-black-soft">
                        {formatPrice(product.price)}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {product.availableSizes.length > 0 && (
                        <label className="flex items-center gap-1.5 text-xs text-text-gray">
                          <span className="sr-only">Tamanho de {product.name}</span>
                          <select
                            value={item.size ?? ""}
                            onChange={(e) => update(product.id, { size: e.target.value || undefined })}
                            className="min-h-9 rounded-full border border-border-gray bg-white px-3 text-xs text-black-soft"
                          >
                            <option value="">Tamanho…</option>
                            {product.availableSizes.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {product.availableColors.length > 1 && (
                        <label className="flex items-center gap-1.5 text-xs text-text-gray">
                          <span className="sr-only">Cor de {product.name}</span>
                          <select
                            value={item.color ?? ""}
                            onChange={(e) => update(product.id, { color: e.target.value || undefined })}
                            className="min-h-9 rounded-full border border-border-gray bg-white px-3 text-xs text-black-soft"
                          >
                            <option value="">Cor…</option>
                            {product.availableColors.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label={`Remover ${product.name} da seleção`}
                    className="self-start p-2 text-text-gray transition-colors hover:text-gold-dark"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-border-gray px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <a
                href={buildWhatsAppLink(
                  buildOrderMessage(
                    resolved.map(({ item, product }) => ({
                      product,
                      size: item.size,
                      color: item.color,
                    }))
                  ),
                  utm
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("selection_whatsapp_click", { items: resolved.length })}
                className="flex min-h-12 items-center justify-center rounded-full bg-black-soft px-6 text-sm font-semibold text-off-white transition-colors hover:bg-graphite"
              >
                Enviar seleção no WhatsApp ({resolved.length})
              </a>
              <p className="mt-2.5 text-center text-xs text-text-gray">
                Confirmamos disponibilidade, valores e entrega no atendimento.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
