import { siteConfig } from "@/data/site.config"
import type { Product, SelectionItem, Look } from "@/types"
import { formatPrice } from "@/lib/format"

export type UtmData = {
  utm_source?: string
  utm_campaign?: string
}

// ── Anatomia da mensagem (Guia Mestre) ────────────────────────────────────────
// 1. saudação contextual  2. blocos *RÓTULO* + valor  3. campos vazios omitidos
// 4. fecho com pergunta. Formatação inteira apoiada no *negrito* nativo do
// WhatsApp — nunca emoji, travessão, meia-risca ou NBSP (corrompem no Desktop).

const block = (label: string, value?: string | null) =>
  value ? `*${label}*\n${value}` : null

const compose = (...parts: (string | null | undefined)[]) =>
  parts.filter(Boolean).join("\n\n")

// Divisor de itens em listas: ASCII puro, nunca caracteres de caixa Unicode.
const DIVIDER = "----------------"

function sanitize(message: string): string {
  return message.replace(/[—–]/g, "-").replace(/ /g, " ")
}

// Única função geradora de links de WhatsApp do site.
// encodeURIComponent na mensagem INTEIRA, uma única vez.
export function buildWhatsAppLink(message: string, utm?: UtmData): string {
  let full = message
  if (utm?.utm_source) {
    const origem = utm.utm_campaign
      ? `${utm.utm_source} - ${utm.utm_campaign}`
      : utm.utm_source
    full += `\n\n${block("ORIGEM", origem)}`
  }
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(sanitize(full))}`
}

// ── Contexto de disponibilidade ───────────────────────────────────────────────

function availabilityText(p: Product): string {
  switch (p.stockStatus) {
    case "on_request":
      return `Encomenda (prazo estimado informado na vitrine: ${siteConfig.leadTimeText})`
    case "low_stock":
      return "Pronta entrega, últimas unidades"
    case "out_of_stock":
      return "Esgotado na vitrine"
    default:
      return "Pronta entrega"
  }
}

function greeting(p: Product): string {
  if (p.stockStatus === "on_request")
    return `Olá! Quero fazer uma encomenda na ${siteConfig.name}!`
  return `Olá! Vi esta peça na Vitrine Digital da ${siteConfig.name} e quero fazer um pedido!`
}

function closing(p: Product, size?: string): string {
  const sizeResolved = Boolean(size) || p.availableSizes.length === 0
  if (p.stockStatus === "on_request")
    return sizeResolved
      ? "Pode confirmar a disponibilidade e o prazo?"
      : "Pode confirmar os tamanhos e o prazo?"
  return sizeResolved
    ? "Pode me passar as formas de pagamento e entrega?"
    : "Pode confirmar os tamanhos disponíveis?"
}

// Resumo compacto da peça: nome em negrito na primeira linha e um dado por
// linha ("Campo: valor"), campos vazios omitidos. Sem link, sem código e sem
// linha de disponibilidade (pedido do proprietário): o atendimento localiza a
// peça pelo nome, e encomenda/esgotado já aparecem na saudação e no fecho.
function productSummary(p: Product, size?: string, color?: string): string {
  const resolvedColor =
    color ?? (p.availableColors.length === 1 ? p.availableColors[0].name : undefined)
  const valor =
    p.price != null
      ? `${formatPrice(p.price)}${p.installmentText ? ` (${p.installmentText})` : ""}`
      : null
  return [
    `*${p.name}* - ${p.brand}`,
    size ? `Tamanho: ${size}` : null,
    resolvedColor ? `Cor: ${resolvedColor}` : null,
    valor ? `Valor: ${valor}` : null,
  ]
    .filter(Boolean)
    .join("\n")
}

// Linha de pagamento: com a forma escolhida na UI, sai qualificada
// ("Pagamento: Pix"); sem escolha, sai a régua completa da loja.
function paymentLine(payment?: string): string {
  return `Pagamento: ${payment ?? siteConfig.paymentText}`
}

// ── Pedido padronizado ────────────────────────────────────────────────────────
// Formato único do pedido, usado tanto para uma peça (PDP) quanto para a
// seleção inteira. Tamanho e cor são obrigatórios na origem: a UI só habilita
// o botão quando ambos estão escolhidos.

export type OrderItem = {
  product: Product
  size?: string
  color?: string
}

export function buildOrderMessage(items: OrderItem[], payment?: string): string {
  const single = items.length === 1
  const blocks = items.map(({ product, size, color }, i) => {
    const summary = productSummary(product, size, color)
    return single ? summary : `${i + 1}. ${summary}`
  })

  // Total só quando todas as peças têm preço — nunca somar por cima de "a
  // confirmar" (regra da casa: não afirmar valor que não está na vitrine).
  const todosComPreco = items.every(({ product }) => product.price != null)
  const total =
    !single && todosComPreco
      ? `Total das peças: ${formatPrice(
          items.reduce((sum, { product }) => sum + (product.price ?? 0), 0)
        )}`
      : null

  return compose(
    single
      ? `Olá! Vi esta peça na Vitrine Digital da ${siteConfig.name} e quero fazer um pedido!`
      : `Olá! Montei uma seleção na Vitrine Digital da ${siteConfig.name} e quero fazer um pedido:`,
    blocks.join(`\n${DIVIDER}\n`),
    total,
    paymentLine(payment),
    `Pode confirmar a disponibilidade, os valores e as opções de entrega?`
  )
}

// Templates oficiais — não alterar o texto sem alinhar com o proprietário.
export const templates = {
  atendimentoGeral: () =>
    compose(
      `Olá! Conheci a Vitrine Digital da ${siteConfig.name} e gostaria de um atendimento personalizado.`,
      `Podem me ajudar a encontrar algumas peças?`
    ),

  // Página /loja-fisica: quem quer visitar ou falar direto com a loja.
  lojaFisica: () =>
    `Olá! Vim pelo site da ${siteConfig.name} e gostaria de falar com a loja.`,

  // Botão flutuante presente no site inteiro.
  informacoesProdutos: () =>
    `Olá! Vim pelo site da ${siteConfig.name} e gostaria de informações sobre os produtos.`,

  produto: (p: Product, size?: string, color?: string, payment?: string) =>
    compose(greeting(p), productSummary(p, size, color), paymentLine(payment), closing(p, size)),

  // Peça esgotada: pedido de aviso de reposição.
  aviseMe: (p: Product, size?: string) =>
    compose(
      `Olá! Vi esta peça esgotada na Vitrine Digital da ${siteConfig.name}:`,
      [`*${p.name}* - ${p.brand}`, size ? `Tamanho: ${size}` : null].filter(Boolean).join("\n"),
      `Podem me avisar quando ela voltar?`
    ),

  duvidaProduto: (p: Product) =>
    compose(
      `Olá! Vi esta peça na Vitrine Digital da ${siteConfig.name} e tenho uma dúvida:`,
      `*${p.name}* - ${p.brand}`,
      `Podem me ajudar?`
    ),

  selecaoPersonalizada: () =>
    compose(
      `Olá! Gostaria de receber uma seleção personalizada da ${siteConfig.name}.`,
      block("OCASIÃO", "..."),
      block("TIPO DE PEÇA", "..."),
      block("TAMANHO", "..."),
      block("CORES QUE PREFIRO", "..."),
      block("CIDADE", "..."),
      `Podem montar uma seleção para mim?`
    ),

  look: (look: Look) =>
    compose(
      `Olá! Vi este look na Vitrine Digital da ${siteConfig.name} e quero consultar as peças:`,
      block("LOOK", look.name),
      block("TAMANHO DE CAMISA", "..."),
      block("TAMANHO DE CALÇA", "..."),
      block("CALÇADO", "..."),
      `Pode me passar a disponibilidade e o valor do conjunto?`
    ),

  condicional: () =>
    compose(
      `Olá! Gostaria de entender como funciona o condicional da ${siteConfig.name}.`,
      block("NOME", "..."),
      block("CIDADE", "..."),
      block("BAIRRO", "..."),
      block("TIPO DE PEÇA", "..."),
      block("TAMANHOS", "..."),
      `Podem me explicar as condições para a minha região?`
    ),

  minhaSelecao: (items: { item: SelectionItem; product: Product }[]) =>
    compose(
      `Olá! Montei esta seleção na Vitrine Digital da ${siteConfig.name}:`,
      items
        .map(({ item, product }, i) => {
          const lines = [
            `${i + 1}. ${product.name} - ${product.brand}`,
            item.size ? `Tamanho: ${item.size}` : `Tamanho: a confirmar`,
            item.color ? `Cor: ${item.color}` : null,
            product.price != null ? `Valor: ${formatPrice(product.price)}` : null,
          ].filter(Boolean)
          return lines.join("\n")
        })
        .join(`\n${DIVIDER}\n`),
      `Pode confirmar a disponibilidade, os valores e as opções de entrega?`
    ),
}
