import { SectionHeading } from "@/components/SectionHeading"
import { Reveal } from "@/components/Reveal"
import { MessagesSquare, Sparkles, Handshake } from "lucide-react"

// Substitui a antiga "prova social" com placeholders de depoimento.
// Seção institucional, sem inventar avaliações — até haver materiais reais autorizados.
const pillars = [
  {
    icon: MessagesSquare,
    title: "Conversa antes da compra",
    text: "Você fala com gente de verdade, tira dúvidas e decide sem pressa.",
  },
  {
    icon: Sparkles,
    title: "Curadoria no seu estilo",
    text: "Separamos peças pensando no seu tamanho, no seu gosto e na ocasião.",
  },
  {
    icon: Handshake,
    title: "Da escolha à entrega",
    text: "Acompanhamos tudo: reserva, pagamento, envio nacional ou retirada na loja.",
  },
]

export function Compromisso() {
  return (
    <section className="bg-off-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
        <SectionHeading
          eyebrow="Nosso jeito"
          title="Atendimento próximo, da escolha à entrega."
          text="Mais do que uma vitrine, a PR Grife é um atendimento consultivo de moda masculina em Maringá."
        />

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div className="border-l border-gold/60 pl-5">
                <p.icon className="h-5 w-5 text-gold-dark" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="mt-3 text-[15px] font-semibold text-black-soft">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-gray">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
