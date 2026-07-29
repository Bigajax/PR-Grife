export type StockStatus = "available" | "low_stock" | "out_of_stock" | "on_request"

export type Gender = "masculino" | "feminino" | "unissex"

export type Badge =
  | "novo"
  | "reposicao"
  | "ultimas_unidades"
  | "mais_procurado"
  | "escolha_da_semana"

export type ProductColor = { name: string; hex: string }

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  gender: Gender
  shortDescription: string
  fullDescription?: string
  price?: number
  /** Preço anterior ("de"). Só exibido riscado quando maior que `price` — nunca inventar desconto. */
  oldPrice?: number
  installmentText?: string
  images: string[]
  thumbnail: string
  availableSizes: string[]
  availableColors: ProductColor[]
  stockStatus: StockStatus
  badges?: Badge[]
  productCode: string
  material?: string
  fit?: string
  featured?: boolean
  newArrival?: boolean
}

export type Category = {
  id: string
  label: string
  image: string
}

export type LookPiece = {
  role: string
  name: string
}

export type Look = {
  id: string
  name: string
  context: string
  image: string
  pieces: LookPiece[]
}

export type InstagramPost = {
  image: string
  url: string
  alt: string
  type: "post" | "reel"
}

export type FaqItem = {
  question: string
  answer: string
  todoConfirmar?: boolean
}

export type SelectionItem = {
  productId: string
  size?: string
  color?: string
}

/** Banner do mosaico da home. Estrutura espelha a tabela `banners` do Guia Mestre
 *  (supabase/schema.sql) — quando o painel existir, a troca é 1:1. */
export type Banner = {
  id: string
  /** Rótulo curto acima do título. Exibido em caixa alta pelo CSS. */
  eyebrow?: string
  title: string
  text: string
  ctaLabel: string
  href: string
  imageDesktop: string
  /** Recorte específico para mobile; sem ele, usa a imagem desktop. */
  imageMobile?: string
  textPosition?: "left" | "center"
  active: boolean
  order: number
}
