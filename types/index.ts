export type StockStatus = "available" | "low_stock" | "out_of_stock" | "on_request"

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
  shortDescription: string
  fullDescription?: string
  price?: number
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
