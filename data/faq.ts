import type { FaqItem } from "@/types"
import { siteConfig } from "@/data/site.config"

// Perguntas frequentes oficiais (aprovadas pelo proprietário), exibidas em
// accordion dentro do footer. Endereço, telefone e handle são interpolados do
// site.config — a resposta acompanha qualquer atualização de cadastro.
export const faqItems: FaqItem[] = [
  {
    question: "Os produtos são originais?",
    answer: `Sim. A ${siteConfig.name} trabalha somente com produtos originais, selecionados entre grandes marcas nacionais e internacionais.`,
  },
  {
    question: "Onde fica a loja física?",
    answer: `A ${siteConfig.name} está localizada na Avenida Tiradentes, 202, em Maringá, Paraná. Você pode utilizar o botão "Como chegar" para abrir a rota no Google Maps.`,
  },
  {
    question: "Qual é o horário de atendimento?",
    answer: "Atendemos de segunda a sexta, das 9h às 18h, e aos sábados, das 9h às 13h.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer: "Aceitamos dinheiro, Pix e cartão em até 6 vezes sem juros.",
  },
  {
    question: "Como funcionam as trocas?",
    answer:
      "Realizamos trocas de produtos com defeito de fabricação ou recebidos como presente, conforme análise e condições da loja. Entre em contato pelo WhatsApp antes de se dirigir ao local.",
  },
  {
    question: "Vocês entregam para todo o Brasil?",
    answer:
      "Sim. O prazo, o valor do frete e a disponibilidade do produto são confirmados durante o atendimento.",
  },
  {
    question: "Como confirmo se um produto está disponível?",
    answer: `Entre em contato pelo WhatsApp no número ${siteConfig.phoneDisplay}. Nossa equipe confirma modelos, tamanhos, cores e disponibilidade.`,
  },
  {
    question: "Como acompanho as novidades da loja?",
    answer: `Acompanhe o Instagram ${siteConfig.instagramHandle} para conferir novidades, produtos e lançamentos.`,
  },
]
