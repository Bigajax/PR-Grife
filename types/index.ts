export type StockStatus = "available" | "low_stock" | "out_of_stock" | "on_request"

/** Como o produto é vendido: pronta entrega, só encomenda, ou os dois. */
export type SaleMode = "in_stock" | "on_request" | "both"

/** Estoque único (uma quantidade) ou por combinação tamanho × cor. */
export type StockType = "single" | "per_variant"

/**
 * Uma combinação vendável do produto. No "estoque único" existe exatamente
 * uma variação com size/color ausentes. Espelha public.product_variants.
 */
export type ProductVariant = {
  id: string
  size?: string
  color?: string
  sku: string
  stockQuantity: number
  minimumStock: number
  isActive: boolean
}

export type StockMovementType = "entry" | "exit"

/** Linha do histórico imutável (public.stock_movements), já em camelCase. */
export type StockMovement = {
  id: string
  productId: string
  variantId: string
  movementType: StockMovementType
  reason: string
  quantity: number
  previousQuantity: number
  balanceAfter: number
  notes?: string
  userEmail: string
  createdAt: string
  /** Dados da variação, quando a leitura faz o join. */
  variant?: { size?: string; color?: string; sku: string }
}

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
  // ── Controle de estoque (migration 0002) ──────────────────────────────────
  // Todos opcionais: o catálogo estático (data/products.ts) e bancos sem a
  // migration continuam válidos — sem estes campos, o site se comporta como
  // antes (stockStatus manual, nenhuma variação desabilitada).
  trackStock?: boolean
  stockType?: StockType
  saleMode?: SaleMode
  allowNegativeStock?: boolean
  minimumStock?: number
  /** Variações ativas com saldo — presentes só quando trackStock. */
  variants?: ProductVariant[]
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
