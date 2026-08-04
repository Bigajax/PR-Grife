"use client"

import { useRef } from "react"
import Image from "next/image"
import { X, Trash2 } from "lucide-react"
import { useSelection } from "@/hooks/useSelection"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { useUtm } from "@/hooks/useUtm"
import { buildWhatsAppLink, buildOrderMessage } from "@/lib/whatsapp"
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
      {/* Véu com desfoque: o escurecimento sozinho ainda deixava a grade de
          produtos legível atrás e competindo com a seleção. O blur vem de
          utilitária do Tailwind — `backdrop-filter` escrito à mão no
          globals.css é descartado pelo Lightning CSS neste projeto. */}
      <button
        type="button"
        aria-label="Fechar minha seleção"
        onClick={closeDrawer}
        className="absolute inset-0 bg-black-soft/45 backdrop-blur-md"
      />

      {/* Painel lateral em TODAS as larguras. No mobile era folha subindo de
          baixo; agora entra pela direita como no desktop. A largura para em
          88% no celular de propósito: a tira de página que sobra à esquerda é
          o que mostra o desfoque e deixa claro que dá para tocar fora para
          fechar — ocupando 100% o véu não apareceria.
          O topo respeita a área segura porque, em tela cheia no iPhone, o
          título ficaria embaixo do notch. */}
      <div
        ref={ref}
        className="absolute inset-y-0 right-0 flex w-[88%] max-w-md flex-col border-l border-border-gray bg-off-white pt-[env(safe-area-inset-top)]"
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
              {/* Nada trava o envio aqui. A escolha de forma de pagamento (e de
                  parcelas, no cartão) já foi obrigatória neste ponto e saiu
                  junto com a da página do produto: era a última barreira entre
                  a seleção pronta e a mensagem, bem onde a intenção de compra
                  está mais alta. Quem chegou até aqui já quer falar com a loja;
                  o pagamento é assunto da conversa. */}
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
                className="tap flex min-h-12 items-center justify-center rounded-full bg-black-soft px-6 text-sm font-semibold text-off-white hover:bg-graphite"
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
