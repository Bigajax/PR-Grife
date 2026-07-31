"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { X, Trash2 } from "lucide-react"
import { useSelection } from "@/hooks/useSelection"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { useUtm } from "@/hooks/useUtm"
import { buildWhatsAppLink, buildOrderMessage } from "@/lib/whatsapp"
import { siteConfig } from "@/data/site.config"

type PaymentOption = (typeof siteConfig.paymentOptions)[number]
import { isOptionAvailable } from "@/lib/stock"
import { useProductLookup } from "@/components/CatalogProvider"
import { formatPrice } from "@/lib/format"
import { track } from "@/lib/tracking"
import { DiamondMark } from "@/components/Logo"

// Minha seleção: drawer lateral (desktop) / bottom sheet (mobile). Não é carrinho —
// o fechamento acontece no WhatsApp.
export function SelectionDrawer() {
  const { items, isOpen, closeDrawer, remove, update } = useSelection()
  const productById = useProductLookup()
  // Forma de pagamento e parcelas: obrigatórias para enviar a seleção, mesma
  // regra da página do produto. `parcelas` só vale para a forma que a tem.
  const [payment, setPayment] = useState<PaymentOption | null>(null)
  const [parcelas, setParcelas] = useState<number | null>(null)
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
              Toque na sacola das peças que gostar para montar a sua seleção e enviar tudo de
              uma vez no WhatsApp.
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
                            {product.availableSizes.map((s) => {
                              const esgotado = !isOptionAvailable(product, { size: s })
                              return (
                                <option key={s} value={s} disabled={esgotado}>
                                  {s}
                                  {esgotado ? " (esgotado)" : ""}
                                </option>
                              )
                            })}
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
                            {product.availableColors.map((c) => {
                              const esgotada = !isOptionAvailable(product, { color: c.name })
                              return (
                                <option key={c.name} value={c.name} disabled={esgotada}>
                                  {c.name}
                                  {esgotada ? " (esgotada)" : ""}
                                </option>
                              )
                            })}
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
              {/* Forma de pagamento: obrigatória para enviar a seleção. */}
              <fieldset className="pb-3">
                <legend className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-gray">
                  Como prefere pagar?
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {siteConfig.paymentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setPayment(payment?.id === opt.id ? null : opt)
                        setParcelas(null)
                      }}
                      aria-pressed={payment?.id === opt.id}
                      className={`min-h-9 rounded-full border px-3 text-xs font-medium transition-colors ${
                        payment?.id === opt.id
                          ? "border-black-soft bg-black-soft text-off-white"
                          : "border-border-gray bg-white text-text-gray hover:border-gold"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {payment?.parcelas ? (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-gray">
                      Em quantas vezes?
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Array.from({ length: payment.parcelas }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setParcelas((cur) => (cur === n ? null : n))}
                          aria-pressed={parcelas === n}
                          aria-label={n === 1 ? "À vista" : `Em ${n} vezes sem juros`}
                          className={`min-h-9 min-w-10 rounded-full border px-2.5 text-xs font-medium transition-colors ${
                            parcelas === n
                              ? "border-black-soft bg-black-soft text-off-white"
                              : "border-border-gray bg-white text-text-gray hover:border-gold"
                          }`}
                        >
                          {n === 1 ? "À vista" : `${n}x`}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </fieldset>
              {/* Mesma trava da página do produto: sem forma de pagamento (e
                  sem o número de vezes, no cartão) o envio fica bloqueado. */}
              {payment && !(payment.parcelas && !parcelas) ? (
                <a
                  href={buildWhatsAppLink(
                    buildOrderMessage(
                      resolved.map(({ item, product }) => ({
                        product,
                        size: item.size,
                        color: item.color,
                      })),
                      { label: payment.label, parcelas: parcelas ?? undefined }
                    ),
                    utm
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("selection_whatsapp_click", { items: resolved.length })}
                  className="tap flex min-h-12 items-center justify-center rounded-full bg-black-soft px-6 text-sm font-semibold text-off-white hover:bg-graphite"
                >
                  Enviar seleção no WhatsApp ({resolved.length})
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    aria-describedby="selecao-pendente"
                    className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-black-soft/40 px-6 text-sm font-semibold text-off-white"
                  >
                    Enviar seleção no WhatsApp ({resolved.length})
                  </button>
                  <p
                    id="selecao-pendente"
                    className="mt-2 text-center text-[13px] font-medium text-gold-dark"
                  >
                    Escolha {payment ? "em quantas vezes" : "a forma de pagamento"} para enviar.
                  </p>
                </>
              )}
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
