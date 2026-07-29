import type { FaqItem } from "@/types"

// Quatro perguntas, exibidas em accordion dentro do footer.
// Respostas provisórias — TODO_CONFIRMAR com o proprietário antes de publicar.
export const faqItems: FaqItem[] = [
  {
    question: "Os produtos são originais?",
    answer:
      "[TODO_CONFIRMAR: texto sobre procedência e originalidade dos produtos — a redação final deve ser aprovada pelo proprietário]",
    todoConfirmar: true,
  },
  {
    question: "Vocês entregam para todo o Brasil?",
    answer:
      "Sim. Combinamos o envio pelo WhatsApp e informamos prazo e valor do frete para a sua região antes de fechar. [TODO_CONFIRMAR: transportadoras, prazos e política de frete]",
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
]
