// Fonte única de verdade para todo dado editável do site.
// Nenhum texto de contato, endereço, marca ou política deve ser hardcoded em componente.
export const siteConfig = {
  name: "PR Grife",
  tagline: "Autoestima em forma de peças de roupa.",
  whatsapp: "5544XXXXXXXXX", // TODO_CONFIRMAR — número oficial de WhatsApp da loja
  instagram: "https://www.instagram.com/useprgrife/",
  instagramHandle: "@useprgrife",
  address: "Avenida Tiradentes, 202 — Maringá, PR", // TODO_CONFIRMAR — conferir complemento/CEP (bio do IG: 87013260)
  hours: "Seg a Sáb, 9h às 19h", // TODO_CONFIRMAR — horário oficial de funcionamento
  mapsUrl: "https://maps.google.com/?q=Avenida+Tiradentes+202+Maringá+PR", // TODO_CONFIRMAR — link oficial do Google Maps
  yearsActive: 3,
  // Prazo padrão de encomenda — é da LOJA, não do produto (regra do Guia Mestre).
  // Aparece em etiquetas, página de produto e mensagem de WhatsApp.
  leadTimeText: "15 a 25 dias úteis", // TODO_CONFIRMAR — prazo real praticado
  // TODO_CONFIRMAR — exibir somente marcas confirmadas pelo proprietário.
  // Destaques do Instagram confirmam: Reserva, Colcci, U.S Polo, Ankor, Tommy Jeans, Biotwo, Lacoste (post de 05/07/2026).
  // Ordem de exibição: Tommy Hilfiger e Tommy Jeans separadas para não ficarem lado a lado.
  brands: [
    "Lacoste",
    "Tommy Hilfiger",
    "Reserva",
    "Colcci",
    "Tommy Jeans",
    "US Polo",
    "Ankor",
    "Biotwo",
    "Jean Paul Gaultier", // perfumaria — presente no catálogo (p19/p20)
  ],
  // Barra fina do topo. Dois itens, sem caixa alta pesada.
  announcements: ["Entrega para todo o Brasil", "Loja física em Maringá"],
  // ── Hero ────────────────────────────────────────────────────────────────────
  // Copy fixa: não tem data, estação nem campanha para trocar.
  //
  // `tone` é a cor da tipografia sobre a foto, não um overlay. A foto atual tem
  // parede clara de estúdio, então o texto vai em grafite — branco sumiria nela.
  // Ao subir uma foto escura, troque para "light".
  hero: {
    title: "Elegância em cada peça",
    subtitle: "Seleção premium para todos os momentos.",
    ctaLabel: "Ver catálogo",
    href: "/catalogo",
    // O nome do arquivo carrega versão de propósito. O otimizador de imagem do
    // Next 16 guarda o resultado por 4 horas (minimumCacheTTL) e o navegador
    // guarda pela URL: sobrescrever o mesmo nome continua entregando a foto
    // antiga. Ao trocar a imagem, suba com um sufixo novo (-v4, -v5...).
    image: "/images/hero-v4.png",
    imageAlt:
      "Modelo de jaqueta bomber jeans diante de uma parede clara com sombras de folhagem",
    tone: "dark" as "dark" | "light",
  },
  // ── Bloco editorial da home ─────────────────────────────────────────────────
  // Este é o slot de rotação da home: para trocar a campanha, edite só aqui.
  // O hero fica fixo. `lines` é renderizado como um parágrafo único, então a
  // coluna de texto mantém exatamente três elementos: título, apoio e botão.
  homeFeature: {
    title: "Montado na loja",
    lines: [
      "Cada look começa com uma escolha peça por peça, na nossa loja em Maringá.",
      "A seleção da casa está na vitrine.",
    ],
    ctaLabel: "Ver seleção",
    href: "/catalogo?destaque=essenciais",
    // Nome versionado pelo mesmo motivo do hero: sobrescrever o arquivo entrega
    // a foto antiga por causa do cache. Ao trocar, suba com sufixo novo.
    image: "/images/home-feature-v3.png",
    imageAlt:
      "Cliente com overshirt bege sobre camiseta preta, dentro da loja da PR Grife, com araras de jeans e jaquetas ao fundo",
  },
  // ── Recomendados na home ────────────────────────────────────────────────────
  // Curadoria manual do carrossel, por id de produto (data/products.ts).
  // A lista é saneada em tempo de render: id inexistente ou peça esgotada é
  // descartada, e o que faltar para 10 é completado com destaques e novidades
  // do catálogo. Deixar vazio também funciona.
  homeRecommended: ["p03", "p10", "p11", "p15", "p16", "p17", "p19", "p01"],
  // ── Par de cards editoriais ─────────────────────────────────────────────────
  // Exatamente dois itens. Existe para dar destaque a categorias que não entram
  // no carrossel de categorias — se colocar aqui uma que já está lá, a home
  // passa a repetir o mesmo destino duas vezes.
  homeDuo: [
    {
      title: "Acessórios",
      subtitle: "Bonés, cintos e óculos",
      image: "/images/products/bone-bege.jpg",
      imageAlt: "Boné bege sobre superfície clara",
      href: "/catalogo?categoria=acessorios",
    },
    {
      title: "Perfumes",
      subtitle: "Os importados da loja",
      image: "/images/products/perfume-le-male.jpg",
      imageAlt: "Frasco de perfume importado",
      href: "/catalogo?categoria=perfumes",
    },
  ],
  metadata: {
    title: "PR Grife | Moda Multimarcas de Alto Padrão em Maringá",
    description:
      "Moda multimarcas masculina e feminina de alto padrão, curadoria de peças, atendimento personalizado pelo WhatsApp e entrega para todo o Brasil. Conheça a seleção da PR Grife.",
    url: "https://prgrife.com.br", // TODO_CONFIRMAR — domínio definitivo
  },
}

export type SiteConfig = typeof siteConfig
