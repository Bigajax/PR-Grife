// Logos OFICIAIS das marcas — arquivos originais extraídos dos canais oficiais de cada marca.
// A PR Grife, como revendedora autorizada, tem direito de exibi-los.
//
// Preferir sempre o LOCKUP (símbolo + nome escrito) ao símbolo isolado: na faixa
// rotativa e no filtro do catálogo, símbolo sozinho fica anônimo ao lado dos
// wordmarks — o pássaro da Reserva e o cavaleiro da US Polo não dizem a marca
// para quem não conhece.
//
// Fontes: Lacoste (crocodilo + wordmark, Wikimedia), Tommy Hilfiger (lockup com
// TOMMY/HILFIGER, Wikimedia Commons), Tommy Jeans (seeklogo, lockup oficial),
// Reserva (lockup "Reserva" + pássaro, CDN lojausereserva.vtexassets.com),
// Colcci (site oficial), US Polo (lockup U.S. POLO ASSN. SINCE 1890, CDN do
// uspoloassn.com), Ankor (@ankordesign, perfil oficial),
// Biotwo (@oficialbiotwo, perfil oficial).
//
// Para trocar por um arquivo de melhor qualidade: salve em public/images/brands/ e aponte aqui.
export const brandLogoAssets: Record<string, string> = {
  Lacoste: "/images/brands/lacoste.svg",
  // Lockup completo: a bandeira com TOMMY em cima e HILFIGER embaixo. O SVG
  // anterior era só a bandeirinha, e na faixa ela ficava anônima ao lado dos
  // wordmarks. Origem no Commons: "Tommy Hilfiger Logo.png" (domínio público).
  "Tommy Hilfiger": "/images/brands/tommy-hilfiger.png",
  "Tommy Jeans": "/images/brands/tommy-jeans.png",
  Reserva: "/images/brands/reserva.svg",
  Colcci: "/images/brands/colcci.svg",
  "US Polo": "/images/brands/us-polo.png",
  Ankor: "/images/brands/ankor.png",
  Biotwo: "/images/brands/biotwo.png",

  // ── Perfumaria e as marcas que entraram com os kits ────────────────────────
  // Baixados do Wikimedia Commons, todos SVG e todos marcados lá como domínio
  // público (wordmark simples fica abaixo do limiar de originalidade). Domínio
  // público é sobre DIREITO AUTORAL; a MARCA continua de cada casa — a PR Grife
  // os exibe como revendedora, igual às de cima.
  // Arquivo de origem no Commons, para reencontrar ou atualizar:
  //   Jean Paul Gaultier ← "Jean Paul Gaultier logo.svg"
  //   Rabanne            ← "Rabanne logo.svg" (identidade nova, de 2023 — é a
  //                        que está na caixa do 1 Million que fotografamos;
  //                        "Paco Rabanne logo.svg" é a anterior, não usar)
  //   Versace            ← "Versace old logo.svg"
  //   Carolina Herrera   ← "Carolina Herrera logo.svg"
  //   Dior               ← "Dior Logo 2022.svg"
  //   Dolce & Gabbana    ← "Dolce & Gabbana - logo (Italy, 1985-).svg"
  //   Mercedes-Benz      ← "Mercedes-Benz Logo 2010.svg"
  //   Montblanc          ← "Montblanc logo.svg"
  "Jean Paul Gaultier": "/images/brands/jean-paul-gaultier.svg",
  Rabanne: "/images/brands/rabanne.svg",
  Versace: "/images/brands/versace.svg",
  "Carolina Herrera": "/images/brands/carolina-herrera.svg",
  Dior: "/images/brands/dior.svg",
  "Dolce & Gabbana": "/images/brands/dolce-gabbana.svg",
  "Mercedes-Benz": "/images/brands/mercedes-benz.svg",
  Montblanc: "/images/brands/montblanc.svg",
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
  /** false tira da faixa rotativa de logos; o card da home e a navegação do
      catálogo continuam. É o par simétrico de vitrineHome — as duas vitrines
      são independentes, e sair de uma não deve derrubar a outra. */
  faixaLogos?: boolean
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
    faixaLogos: false,
  },
  // ── Perfumaria e marcas dos kits ──────────────────────────────────────────
  // Todas com vitrineHome: false — entram na faixa de logos e na navegação do
  // catálogo, mas não disputam as vagas dos cards da home, que são da moda.
  // Xerjoff fica de fora até ter arquivo: a faixa é de logos, e uma marca em
  // texto no meio delas lê como falha.
  {
    name: "Jean Paul Gaultier",
    slug: "jean-paul-gaultier",
    brands: ["Jean Paul Gaultier"],
    vitrineHome: false,
    faixaLogos: false,
  },
  { name: "Dior", slug: "dior", brands: ["Dior"], vitrineHome: false },
  { name: "Versace", slug: "versace", brands: ["Versace"], vitrineHome: false },
  { name: "Rabanne", slug: "rabanne", brands: ["Rabanne"], vitrineHome: false },
  {
    name: "Carolina Herrera",
    slug: "carolina-herrera",
    brands: ["Carolina Herrera"],
    vitrineHome: false,
  },
  {
    name: "Dolce & Gabbana",
    slug: "dolce-gabbana",
    brands: ["Dolce & Gabbana"],
    vitrineHome: false,
  },
  { name: "Montblanc", slug: "montblanc", brands: ["Montblanc"], vitrineHome: false },
  {
    name: "Mercedes-Benz",
    slug: "mercedes-benz",
    brands: ["Mercedes-Benz"],
    vitrineHome: false,
  },
]
