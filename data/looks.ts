import type { Look } from "@/types"

// Looks demonstrativos montados com fotos reais do Instagram da PR Grife.
// TODO_CONFIRMAR — peças e composições sujeitas à curadoria do proprietário.
export const looks: Look[] = [
  {
    id: "casual-sofisticado",
    name: "Casual sofisticado",
    context: "Fim de semana, encontros e passeios com presença.",
    image: "/images/looks/look-casual.jpg",
    pieces: [
      { role: "Sobreposição", name: "Overshirt de suede caramelo" },
      { role: "Top", name: "Camiseta preta essencial" },
      { role: "Calça", name: "Calça preta de sarja" },
      { role: "Calçado", name: "Tênis preto de couro" },
      { role: "Acessório", name: "Relógio de pulseira escura" },
      { role: "Perfume", name: "Amadeirado suave de dia" },
    ],
  },
  {
    id: "trabalho-compromissos",
    name: "Trabalho e compromissos",
    context: "Reuniões, escritório e almoços de negócio.",
    image: "/images/looks/look-trabalho.jpg",
    pieces: [
      { role: "Top", name: "Camisa xadrez azul-claro" },
      { role: "Sobreposição", name: "Colete acolchoado preto" },
      { role: "Calça", name: "Jeans de lavagem clara" },
      { role: "Calçado", name: "Tênis branco minimalista" },
      { role: "Acessório", name: "Cinto de couro escuro" },
      { role: "Perfume", name: "Cítrico discreto de trabalho" },
    ],
  },
  {
    id: "noite-eventos",
    name: "Noite e eventos",
    context: "Jantares, festas e ocasiões que pedem impacto.",
    image: "/images/looks/look-noite.jpg",
    pieces: [
      { role: "Top", name: "Polo preta de toque premium" },
      { role: "Sobreposição", name: "Colete off-white" },
      { role: "Calça", name: "Calça grafite de alfaiataria" },
      { role: "Calçado", name: "Tênis branco de couro" },
      { role: "Acessório", name: "Corrente fina prateada" },
      { role: "Perfume", name: "Intenso de noite" },
    ],
  },
]
