// Logos OFICIAIS das marcas — arquivos originais extraídos dos canais oficiais de cada marca.
// A PR Grife, como revendedora autorizada, tem direito de exibi-los.
//
// Fontes: Lacoste (crocodilo + wordmark, Wikimedia), Tommy Hilfiger (flag, Wikimedia Commons),
// Tommy Jeans (seeklogo, lockup oficial), Reserva (vtexassets do usereserva.com),
// Colcci (site oficial), US Polo (site oficial BR), Ankor (@ankordesign, perfil oficial),
// Biotwo (@oficialbiotwo, perfil oficial).
//
// Para trocar por um arquivo de melhor qualidade: salve em public/images/brands/ e aponte aqui.
export const brandLogoAssets: Record<string, string> = {
  Lacoste: "/images/brands/lacoste.svg",
  "Tommy Hilfiger": "/images/brands/tommy-hilfiger.svg",
  "Tommy Jeans": "/images/brands/tommy-jeans.png",
  Reserva: "/images/brands/reserva.svg",
  Colcci: "/images/brands/colcci.svg",
  "US Polo": "/images/brands/us-polo.png",
  Ankor: "/images/brands/ankor.png",
  Biotwo: "/images/brands/biotwo.png",
}

// ── Vitrine de marcas ─────────────────────────────────────────────────────────
// Fonte única da navegação por marca: seção "Compre por marca" da home, faixa
// de logos e navegação do catálogo. A ordem aqui é a ordem de exibição.
//
// `brands` lista os nomes reais em data/products.ts que o card cobre — Tommy
// Hilfiger e Tommy Jeans são variações da mesma marca e viram um card só.
// `cover` vale SÓ para a vitrine "Compre por marca" da home: card com capa
// mostra a arte; sem capa, mostra o LOGO oficial (brandLogoAssets). A navegação
// do catálogo usa sempre logo. `coverPosition` desloca o corte da capa
// (object-position) quando a arte é mais larga que o card.
// Capas fotográficas extras ficam em /images/brands/covers/ (CDNs oficiais).
export type BrandShowcaseItem = {
  name: string
  slug: string
  brands: string[]
  cover?: string
  coverPosition?: string
  /** false tira o card da vitrine da home; a marca segue na faixa de logos e
      na navegação do catálogo. Pedido do proprietário para a perfumaria. */
  vitrineHome?: boolean
}

export const brandShowcase: BrandShowcaseItem[] = [
  {
    name: "Lacoste",
    slug: "lacoste",
    brands: ["Lacoste"],
    cover: "/images/brands/covers/lacoste-vitrine-v1.png",
    coverPosition: "55% center",
  },
  {
    name: "Tommy Hilfiger",
    slug: "tommy-hilfiger",
    brands: ["Tommy Hilfiger", "Tommy Jeans"],
    cover: "/images/brands/covers/tommy-hilfiger-vitrine-v1.png",
    coverPosition: "60% center",
  },
  {
    name: "Colcci",
    slug: "colcci",
    brands: ["Colcci"],
    cover: "/images/brands/covers/colcci-vitrine-v1.png",
    coverPosition: "55% center",
  },
  // US Polo antes da Reserva de propósito: na vitrine da home, a 4ª posição
  // é o card largo da segunda linha — pedido do proprietário.
  {
    name: "US Polo",
    slug: "us-polo",
    brands: ["US Polo"],
    cover: "/images/brands/covers/us-polo-vitrine-v1.png",
    coverPosition: "left center",
  },
  {
    name: "Reserva",
    slug: "reserva",
    brands: ["Reserva"],
    cover: "/images/brands/covers/reserva-vitrine-v1.png",
    coverPosition: "40% center",
  },
  {
    name: "Ankor",
    slug: "ankor",
    brands: ["Ankor"],
    cover: "/images/brands/covers/ankor-vitrine-v1.png",
    coverPosition: "40% center",
  },
  {
    name: "Biotwo",
    slug: "biotwo",
    brands: ["Biotwo"],
    cover: "/images/brands/covers/biotwo-vitrine-v1.png",
    coverPosition: "55% center",
  },
  {
    name: "Jean Paul Gaultier",
    slug: "jean-paul-gaultier",
    brands: ["Jean Paul Gaultier"],
    vitrineHome: false,
  },
]
