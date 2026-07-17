import type { FaqItem } from "@/types"

// Respostas provisórias — TODO_CONFIRMAR com o proprietário antes de publicar como definitivas.
export const faqItems: FaqItem[] = [
  {
    question: "Como sei se a peça que gostei está disponível?",
    answer:
      "Toque em “Consultar disponibilidade” na peça ou envie a sua seleção pelo WhatsApp. Respondemos com a disponibilidade real de tamanho e cor no momento.",
  },
  {
    question: "Vocês entregam para todo o Brasil?",
    answer:
      "Sim. Combinamos o envio pelo WhatsApp e informamos prazo e valor do frete para a sua região antes de fechar. [TODO_CONFIRMAR: transportadoras, prazos e política de frete]",
    todoConfirmar: true,
  },
  {
    question: "Posso retirar na loja em Maringá?",
    answer:
      "Pode. Reservamos a peça pelo WhatsApp e você retira na loja no horário de funcionamento. [TODO_CONFIRMAR: regras de reserva e prazo de retirada]",
    todoConfirmar: true,
  },
  {
    question: "Como escolho o tamanho certo?",
    answer:
      "No atendimento enviamos as medidas da peça e comparamos com uma peça que você já usa. Se ainda restar dúvida, orientamos entre dois tamanhos.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer:
      "Combinamos a forma de pagamento no WhatsApp. [TODO_CONFIRMAR: cartões aceitos, parcelamento, Pix e condições]",
    todoConfirmar: true,
  },
  {
    question: "Como funcionam as trocas?",
    answer:
      "Queremos que a peça sirva bem. Se precisar trocar, falamos pelo WhatsApp e orientamos o processo. [TODO_CONFIRMAR: prazo e condições de troca]",
    todoConfirmar: true,
  },
  {
    question: "Como funciona o condicional?",
    answer:
      "Você conta o que procura e, quando o serviço está disponível para a sua região, enviamos uma seleção para experimentar com calma. Serviço sujeito à localização, análise, disponibilidade e regras da loja. [TODO_CONFIRMAR: regras completas do condicional]",
    todoConfirmar: true,
  },
  {
    question: "O condicional atende a minha região?",
    answer:
      "A disponibilidade é confirmada caso a caso pelo WhatsApp, de acordo com a sua cidade e bairro. [TODO_CONFIRMAR: regiões atendidas]",
    todoConfirmar: true,
  },
  {
    question: "Como funciona a seleção personalizada?",
    answer:
      "Você conta a ocasião, o tipo de peça, tamanhos e cores que prefere. Montamos uma seleção sob medida e enviamos fotos pelo WhatsApp para você escolher.",
  },
  {
    question: "O estoque do site está sempre atualizado?",
    answer:
      "A vitrine é uma amostra da curadoria. O estoque muda rápido, por isso confirmamos a disponibilidade de cada peça no atendimento antes de fechar.",
  },
  {
    question: "Os produtos são originais?",
    answer:
      "[TODO_CONFIRMAR: texto sobre procedência e originalidade dos produtos — a redação final deve ser aprovada pelo proprietário]",
    todoConfirmar: true,
  },
]
