import type { Badge, StockStatus } from "@/types"

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
