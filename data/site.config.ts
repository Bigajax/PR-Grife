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
    title: "Somente produtos originais",
    subtitle: "Tommy Hilfiger, Lacoste, Reserva e outras grandes marcas — em Maringá e para todo o Brasil.",
    ctaLabel: "Ver catálogo",
    href: "/catalogo",
    // O nome do arquivo carrega versão de propósito. O otimizador de imagem do
    // Next 16 guarda o resultado por 4 horas (minimumCacheTTL) e o navegador
    // guarda pela URL: sobrescrever o mesmo nome continua entregando a foto
    // antiga. Ao trocar a imagem, suba com um sufixo novo (-v4, -v5...).
    // Colagem de vídeos do hero. Um item renderiza um card; dois renderizam a
    // colagem lado a lado. Para somar o segundo, basta acrescentar aqui.
    // -v2 = reencode para web: H.264 720p (o arquivo 1 era VP9, que o iPhone
    // não toca), CRF 27 com teto de 1100 kbps, sem trilha de áudio (são mudos)
    // e faststart (índice no começo — o vídeo começa antes de baixar inteiro).
    // Receita em: ffmpeg -crf 27 -maxrate 1100k -preset slow
    //             -vf "scale=720:-2,hqdn3d=1.5:1.5:6:6" -movflags +faststart -an
    videos: [
      {
        src: "/videos/hero-1-v2.mp4",
        // Sem poster: o navegador já pinta o primeiro quadro com preload
        // metadata. Vale cadastrar um se o vídeo abrir com quadro escuro.
        poster: undefined as string | undefined,
      },
      {
        src: "/videos/hero-2-v2.mp4",
        poster: undefined as string | undefined,
      },
      {
        src: "/videos/hero-3-v2.mp4",
        poster: undefined as string | undefined,
      },
    ],
  },
  // ── Bloco editorial da home ─────────────────────────────────────────────────
  // Este é o slot de rotação da home: para trocar a campanha, edite só aqui.
  // O hero fica fixo. `lines` é renderizado como um parágrafo único, então a
  // coluna de texto mantém exatamente três elementos: título, apoio e botão.
  homeFeature: {
    title: "Alta perfumaria",
    lines: [
      "Le Male Elixir, Scandal Pour Homme e os importados da casa.",
      "Fragrâncias marcantes, escolhidas a dedo pela curadoria.",
    ],
    ctaLabel: "Ver perfumes",
    href: "/catalogo/perfumes",
    // Nome versionado pelo mesmo motivo do hero: sobrescrever o arquivo entrega
    // a foto antiga por causa do cache. Ao trocar, suba com sufixo novo.
    // v2 = recorte 4:5 do still panorâmico na resolução original (1024×1280),
    // já na região do frasco — o quadro mostra a imagem inteira, sem corte do
    // object-cover, e o otimizador não joga resolução fora.
    image: "/images/home-perfumaria-v2.jpg",
    imageAlt:
      "Frasco de Scandal Pour Homme com tampa em formato de coroa dourada, sobre fundo de madeira escura",
  },
  // ── Recomendados na home ────────────────────────────────────────────────────
  // Curadoria manual do carrossel, por SLUG de produto (o slug é estável entre
  // o catálogo estático e o banco; o id não é). A lista é saneada em tempo de
  // render: slug inexistente ou peça esgotada é descartada, e o que faltar
  // para 10 é completado com destaques e novidades. Deixar vazio também
  // funciona.
  homeRecommended: [
    "camisa-linho-terracota",
    "jaqueta-track-tommy",
    "bomber-off-white",
    "tenis-hilfiger-branco",
    "tenis-hilfiger-listras",
    "bone-aba-curva-bege",
    "perfume-le-male-elixir",
    "camiseta-essencial-branca",
  ],
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
      href: "/catalogo/acessorios",
    },
    // Perfumes saiu daqui quando o bloco editorial virou "Alta perfumaria" —
    // dois caminhos para o mesmo destino confundem a leitura da home.
    {
      title: "Tênis",
      subtitle: "Do branco clássico ao statement",
      image: "/images/products/tenis-hilfiger.jpg",
      imageAlt: "Tênis branco com detalhe marinho sobre superfície clara",
      href: "/catalogo/tenis",
    },
  ],
  metadata: {
    title: "PR Grife | Moda Multimarcas de Alto Padrão em Maringá",
    description:
      "Moda masculina multimarcas de alto padrão, curadoria de peças, atendimento personalizado pelo WhatsApp e entrega para todo o Brasil. Conheça a seleção da PR Grife.",
    url: "https://prgrife.com.br", // TODO_CONFIRMAR — domínio definitivo
  },
}

export type SiteConfig = typeof siteConfig
