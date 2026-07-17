import { Home, Shirt, Clock } from "lucide-react"
import { SectionHeading } from "@/components/SectionHeading"
import { Reveal } from "@/components/Reveal"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { templates } from "@/lib/whatsapp"

const benefits = [
  {
    icon: Home,
    title: "Experimente em casa",
    text: "Receba uma seleção de peças para provar com calma, no seu espaço.",
  },
  {
    icon: Shirt,
    title: "Seleção no seu tamanho",
    text: "Separamos as peças de acordo com o que você contou que procura.",
  },
  {
    icon: Clock,
    title: "Consulte para a sua região",
    text: "A disponibilidade do condicional é confirmada conforme a sua localização.",
  },
]

export function Condicional() {
  return (
    <section id="condicional" className="scroll-mt-16 border-y border-border-gray bg-off-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
        <SectionHeading
          eyebrow="Condicional"
          title="Experimente com mais comodidade."
          text="Para quem prefere decidir provando: montamos uma seleção e você experimenta antes de escolher."
        />

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 70}>
              <div className="border-l border-gold/60 pl-5">
                <b.icon className="h-5 w-5 text-gold-dark" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold text-black-soft">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-gray">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <WhatsAppCta
            message={templates.condicional()}
            event="conditional_interest"
            className="inline-flex min-h-12 items-center justify-center self-start rounded-full bg-black-soft px-7 text-sm font-semibold text-off-white transition-colors hover:bg-graphite"
          >
            Consultar condicional
          </WhatsAppCta>
          <p className="max-w-md text-[13px] leading-relaxed text-text-gray">
            Serviço sujeito à localização, análise, disponibilidade e regras da loja.
          </p>
        </div>
      </div>
    </section>
  )
}
