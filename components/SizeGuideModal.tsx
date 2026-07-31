"use client"

import { useRef } from "react"
import { X, Ruler } from "lucide-react"
import { tabelaPara } from "@/data/size-guide"
import { useFocusTrap } from "@/hooks/useFocusTrap"

/**
 * Modal do guia de medidas. Abre a tabela de referência do tipo certo — corpo
 * para roupa, comprimento do pé para calçado — decidido pelos tamanhos da
 * própria peça.
 *
 * Centralizado e não lateral (ao contrário da sacola): tabela é conteúdo para
 * ler e comparar, não uma gaveta de ação. No celular ele encosta nas bordas e
 * a tabela rola sozinha na horizontal se não couber, para a página nunca
 * ganhar barra de rolagem lateral.
 */
export function SizeGuideModal({
  open,
  onClose,
  tamanhos,
}: {
  open: boolean
  onClose: () => void
  tamanhos: string[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onClose)

  if (!open) return null

  const tabela = tabelaPara(tamanhos)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Guia de medidas — ${tabela.titulo}`}
    >
      <button
        type="button"
        aria-label="Fechar guia de medidas"
        onClick={onClose}
        className="absolute inset-0 bg-black-soft/45 backdrop-blur-md"
      />

      <div
        ref={ref}
        className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-2xl bg-off-white sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border-gray px-5 py-4">
          <h2 className="flex items-center gap-2.5 font-display text-2xl font-medium text-black-soft">
            <Ruler className="h-5 w-5 text-gold-dark" strokeWidth={1.6} aria-hidden="true" />
            Guia de medidas
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-black-soft hover:text-gold-dark"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">
            {tabela.titulo}
          </p>

          {/* A tabela rola dentro da própria caixa: em telas estreitas ela é
              mais larga que o modal, e sem isto a página inteira ganharia
              rolagem horizontal. */}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border-gray">
                  {tabela.colunas.map((c) => (
                    <th
                      key={c}
                      scope="col"
                      className="whitespace-nowrap py-2.5 pr-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-gray"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabela.linhas.map((linha) => (
                  <tr key={linha.tamanho} className="border-b border-border-gray/60">
                    <th
                      scope="row"
                      className="whitespace-nowrap py-3 pr-4 text-sm font-semibold text-black-soft"
                    >
                      {linha.tamanho}
                    </th>
                    {linha.numerico != null && (
                      <td className="whitespace-nowrap py-3 pr-4 text-text-gray">
                        {linha.numerico}
                      </td>
                    )}
                    {linha.colunas.map((valor, i) => (
                      <td key={i} className="whitespace-nowrap py-3 pr-4 text-text-gray">
                        {valor}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-text-gray">{tabela.observacao}</p>

          {/* O aviso que sustenta a honestidade da tabela: os números acima são
              de CORPO e de referência de mercado, não das peças da loja. */}
          <p className="mt-4 border-t border-border-gray pt-4 text-[13px] leading-relaxed text-text-gray">
            Esta é uma referência de medidas do corpo. Cada marca tem a sua
            modelagem — no atendimento enviamos as medidas exatas desta peça e
            comparamos com algo que você já usa.
          </p>
        </div>
      </div>
    </div>
  )
}
