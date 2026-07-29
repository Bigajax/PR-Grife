import type { Badge, Product, StockStatus } from "@/types"
import { isOnSale } from "@/lib/catalog"

export const badgeLabels: Record<Badge, string> = {
  novo: "Novo",
  reposicao: "Reposição",
  ultimas_unidades: "Últimas unidades",
  mais_procurado: "Mais procurado",
  escolha_da_semana: "Escolha da semana",
}

export const stockLabels: Record<StockStatus, string> = {
  available: "Disponível para consulta",
  low_stock: "Poucas unidades — confirme a disponibilidade",
  out_of_stock: "Esgotado no momento",
  on_request: "Sob encomenda — consulte prazos",
}

// Etiqueta curta de disponibilidade — canal visual próprio no card,
// separado do badge editorial (regra do Guia Mestre: nunca os dois juntos).
export const availabilityShort: Record<StockStatus, string> = {
  available: "Pronta entrega",
  low_stock: "Últimas unidades",
  out_of_stock: "Esgotado",
  on_request: "Encomenda",
}

// Badge editorial ÚNICO por card, resolvido por hierarquia:
// oferta > novo > demais badges cadastrados. Destacar tudo é não destacar.
export function editorialBadge(p: Product): string | null {
  if (isOnSale(p)) return "Oferta"
  if (p.badges?.includes("novo") || p.newArrival) return "Novo"
  const first = p.badges?.find((b) => b !== "novo" && b !== "ultimas_unidades")
  return first ? badgeLabels[first] : null
}
