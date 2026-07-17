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
  // TODO_CONFIRMAR — exibir somente marcas confirmadas pelo proprietário.
  // Destaques do Instagram confirmam: Reserva, Colcci, U.S Polo, Ankor, Tommy Jeans, Biotwo, Lacoste (post de 05/07/2026).
  brands: [
    "Lacoste",
    "Tommy Hilfiger",
    "Tommy Jeans",
    "Reserva",
    "Colcci",
    "US Polo",
    "Ankor",
    "Biotwo",
  ],
  announcements: [
    "Atendimento personalizado",
    "Entregamos para todo o Brasil",
    "Loja física em Maringá",
    "Condicional sob consulta",
  ],
  metadata: {
    title: "PR Grife | Moda Masculina Multimarcas em Maringá",
    description:
      "Moda masculina multimarcas, atendimento personalizado, entrega para todo o Brasil e loja física em Maringá. Conheça a seleção da PR Grife.",
    url: "https://prgrife.com.br", // TODO_CONFIRMAR — domínio definitivo
  },
}

export type SiteConfig = typeof siteConfig
