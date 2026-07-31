// Fonte única de verdade para todo dado editável do site.
// Nenhum texto de contato, endereço, marca ou política deve ser hardcoded em componente.
export const siteConfig = {
  name: "PR Grife",
  tagline: "Autoestima em forma de peças de roupa.",
  // Número oficial da loja, só dígitos — consumido por lib/whatsapp.ts (wa.me).
  whatsapp: "5544991036557",
  phoneDisplay: "(44) 99103-6557",
  phoneE164: "+5544991036557", // links tel: e telephone do JSON-LD
  instagram: "https://www.instagram.com/useprgrife/",
  instagramHandle: "@useprgrife",
  // Endereço oficial, sem CEP de propósito (não confirmado pelo proprietário).
  address: "Avenida Tiradentes, 202 — Maringá, PR",
  // Linha compacta (barra do rodapé). A fonte estruturada é hoursDetailed.
  hours: "Seg a sex, 9h às 18h · Sáb, 9h às 13h",
  // Horário oficial estruturado: gera a UI (loja física, cards) E o
  // openingHoursSpecification do JSON-LD. Sem domingo/feriado de propósito.
  hoursDetailed: [
    {
      label: "Segunda a sexta",
      display: "das 9h às 18h",
      schemaDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      label: "Sábado",
      display: "das 9h às 13h",
      schemaDays: ["Saturday"],
      opens: "09:00",
      closes: "13:00",
    },
  ],
  paymentText: "Pix, dinheiro ou cartão em até 10x sem juros",
  // Opções clicáveis nos pontos de pedido (PDP e sacola). O rótulo escolhido
  // entra como "Pagamento: <opção>" na mensagem de WhatsApp.
  paymentOptions: ["Pix", "Dinheiro", "Cartão em até 10x sem juros"],
  // Os três destinos de mapa derivam do MESMO endereço textual — sem
  // coordenadas inventadas: busca (abrir no Maps), rota (dir) e embed (iframe).
  mapsUrl:
    "https://www.google.com/maps?q=Avenida%20Tiradentes%2C%20202%2C%20Maring%C3%A1%2C%20Paran%C3%A1",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Avenida%20Tiradentes%2C%20202%2C%20Maring%C3%A1%2C%20Paran%C3%A1",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Avenida%20Tiradentes%2C%20202%2C%20Maring%C3%A1%2C%20Paran%C3%A1&output=embed",
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
  // ── Política de trocas ──────────────────────────────────────────────────────
  // Copy oficial aprovada pelo proprietário — fonte única para a seção da
  // página /loja-fisica E para /politicas/trocas. A observação nunca pode
  // sugerir recusa de direitos obrigatórios do consumidor.
  exchangePolicy: {
    title: "Política de trocas",
    paragraphs: [
      "Realizamos trocas de produtos com defeito de fabricação ou recebidos como presente, conforme as condições da loja.",
      "Para agilizar o atendimento, entre em contato pelo WhatsApp e tenha em mãos o produto, a etiqueta e, quando disponível, o comprovante de compra.",
    ],
    note: "Produtos com defeito serão analisados, sem prejuízo dos direitos garantidos pela legislação aplicável.",
  },
  // ── Página /loja-fisica ─────────────────────────────────────────────────────
  // Toda a copy editável da página de loja física vive aqui.
  storePage: {
    eyebrow: "Loja física",
    title: "Da vitrine digital para a PR Grife.",
    highlight: "Sem complicação.",
    description:
      "Explore nosso catálogo, confirme a disponibilidade pelo WhatsApp e visite nossa loja em Maringá.",
    badge: "PR Grife • Maringá",
    // Fotos reais da loja (720x1280 e 640x1136, retrato). Ao trocar, subir com
    // sufixo de versão — o otimizador guarda o resultado por 4h (ver hero).
    images: {
      main: {
        src: "/images/loja.jpg",
        alt: "Interior da loja PR Grife em Maringá, com araras de roupas e atendimento no balcão",
      },
      secondary: {
        src: "/images/atendimento.jpg",
        alt: "Entrada da loja PR Grife na Avenida Tiradentes, em Maringá",
      },
    },
    mapTitle: "Encontre a PR Grife",
    mapText:
      "Estamos na Avenida Tiradentes, 202, em Maringá. Use o mapa para montar sua rota até a loja.",
    metaTitle: "Loja Física PR Grife em Maringá | Como chegar",
    metaDescription:
      "Visite a PR Grife na Avenida Tiradentes, 202, em Maringá. Produtos originais, atendimento pelo WhatsApp e pagamento em até 10x sem juros.",
  },
  // ── Hero ────────────────────────────────────────────────────────────────────
  // Copy fixa: não tem data, estação nem campanha para trocar.
  //
  // `tone` é a cor da tipografia sobre a foto, não um overlay. A foto atual tem
  // parede clara de estúdio, então o texto vai em grafite — branco sumiria nela.
  // Ao subir uma foto escura, troque para "light".
  hero: {
    title: "O que você procura hoje?",
    // Renderizada em dourado da marca (ver Hero.tsx) — é selo, não parágrafo.
    subtitle: "Somente produtos originais",
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
        // -v3 = vídeo novo do proprietário. Original: .MOV de 48,9 MB em HEVC
        // 1080×1920 com trilha de áudio — reencodado pela receita abaixo para
        // 2,9 MB em H.264, que é o que toca em qualquer navegador.
        src: "/videos/hero-2-v3.mp4",
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
    // Domínio real onde o site está no ar. Antes daqui saía
    // "https://prgrife.com.br" (marcado TODO_CONFIRMAR), que nunca existiu no
    // DNS — e como og:image e canonical são URLs absolutas, a prévia de link no
    // WhatsApp apontava para um host inexistente e chegava sem imagem.
    // Ao migrar para domínio próprio, troque aqui ou defina NEXT_PUBLIC_SITE_URL.
    url: "https://usepr-grife.vercel.app",
  },
}

export type SiteConfig = typeof siteConfig
