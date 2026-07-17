import { siteConfig } from "@/data/site.config"
import type { Product, SelectionItem, Look } from "@/types"
import { formatPrice } from "@/lib/format"

export type UtmData = {
  utm_source?: string
  utm_campaign?: string
}

// Única função geradora de links de WhatsApp do site.
export function buildWhatsAppLink(message: string, utm?: UtmData): string {
  let full = message
  if (utm?.utm_source) {
    full += `\n\nOrigem: ${utm.utm_source}`
    if (utm.utm_campaign) full += ` • Campanha: ${utm.utm_campaign}`
  }
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(full)}`
}

// Templates oficiais — não alterar o texto sem alinhar com o proprietário.
export const templates = {
  atendimentoGeral: () =>
    `Olá! Conheci a vitrine da PR Grife e gostaria de receber um atendimento personalizado. Podem me ajudar a encontrar algumas peças?`,

  produto: (p: Product, size?: string, color?: string) =>
    [
      `Olá! Vi este produto na vitrine da PR Grife:`,
      `Produto: ${p.name} / Marca: ${p.brand} / Código: ${p.productCode} / Tamanho: ${size ?? "a definir"} / Cor: ${color ?? p.availableColors[0]?.name ?? "a definir"} / Valor exibido: ${p.price != null ? formatPrice(p.price) : "sob consulta"}`,
      `Gostaria de confirmar a disponibilidade, as formas de pagamento e as opções de entrega.`,
    ].join("\n"),

  // Usado na página de produto: inclui a URL da peça para o atendimento abrir o mesmo item.
  produtoDetalhe: (p: Product, size?: string, color?: string, url?: string) =>
    [
      `Olá! Vi esta peça na vitrine da PR Grife:`,
      ``,
      `Produto: ${p.name}`,
      `Marca: ${p.brand}`,
      `Código: ${p.productCode}`,
      `Tamanho: ${size ?? "a definir"}`,
      `Cor: ${color ?? p.availableColors[0]?.name ?? "a definir"}`,
      `Valor exibido: ${p.price != null ? formatPrice(p.price) : "sob consulta"}`,
      ...(url ? [``, `Link: ${url}`] : []),
      ``,
      `Gostaria de confirmar a disponibilidade, as formas de pagamento e a entrega.`,
    ].join("\n"),

  duvidaProduto: (p: Product) =>
    [
      `Olá! Vi este produto na vitrine da PR Grife:`,
      `Produto: ${p.name} / Marca: ${p.brand} / Código: ${p.productCode}`,
      `Tenho uma dúvida sobre esta peça. Podem me ajudar?`,
    ].join("\n"),

  selecaoPersonalizada: () =>
    [
      `Olá! Gostaria de receber uma seleção personalizada.`,
      `Ocasião: / Tipo de peça: / Tamanho: / Cores que prefiro: / Cidade:`,
      `Podem me ajudar?`,
    ].join("\n"),

  look: (look: Look) =>
    [
      `Olá! Vi este look na vitrine da PR Grife e gostaria de consultar as peças:`,
      `Look: ${look.name} / Tamanho de camisa: / Tamanho de calça: / Calçado:`,
      `Gostaria de saber a disponibilidade e o valor do conjunto.`,
    ].join("\n"),

  condicional: () =>
    [
      `Olá! Gostaria de entender como funciona o condicional.`,
      `Nome: / Cidade: / Bairro: / Tipo de peça: / Tamanhos:`,
      `Podem me explicar as condições para a minha região?`,
    ].join("\n"),

  minhaSelecao: (items: { item: SelectionItem; product: Product }[]) =>
    [
      `Olá! Montei esta seleção na vitrine da PR Grife:`,
      ...items.map(({ item, product }, i) => {
        const size = item.size ? `tamanho ${item.size}` : "tamanho ainda não selecionado"
        const color = item.color ? ` — cor ${item.color}` : ""
        return `${i + 1}. ${product.name} — ${product.brand} — ${size}${color}`
      }),
      `Gostaria de confirmar a disponibilidade, os valores e as opções de entrega.`,
    ].join("\n"),
}
