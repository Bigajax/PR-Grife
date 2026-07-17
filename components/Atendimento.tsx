import Image from "next/image"
import { SectionHeading } from "@/components/SectionHeading"
import { Reveal } from "@/components/Reveal"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { templates } from "@/lib/whatsapp"

const steps = [
  {
    title: "Conte o que procura",
    text: "Ocasião, tipo de peça, tamanhos e cores que você prefere.",
  },
  {
    title: "Receba sugestões",
    text: "Enviamos fotos de peças separadas para você, direto no WhatsApp.",
  },
  {
    title: "Escolha e combine",
    text: "Fechou? Combinamos entrega em todo o Brasil ou retirada na loja.",
  },
]

// Seção-chave de conversão: atendimento consultivo com foto real do atendimento.
export function Atendimento() {
  return (
    <section id="atendimento" className="bg-beige-light">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20 lg:py-28">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] max-w-md overflow-hidden bg-sand">
            {/* TODO_CONFIRMAR — substituir pela foto oficial do Estevão atendendo */}
            <Image
              src="/images/atendimento.jpg"
              alt="Estevão recebendo um cliente na porta da PR Grife"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div
            className="absolute -bottom-4 -right-4 -z-10 hidden h-full w-full border border-gold/50 lg:block"
            aria-hidden="true"
          />
        </Reveal>

        <div>
          <SectionHeading
            eyebrow="Atendimento personalizado"
            title="Uma curadoria pensada para você."
            text="Você não precisa garimpar a vitrine sozinho. Conte o que procura — uma ocasião, um presente, uma troca de estilo — e a gente separa as peças certas para o seu tamanho, seu gosto e o seu momento."
          />

          <ol className="mt-10 space-y-6">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 80}>
                <li className="flex gap-5">
                  <span
                    className="font-display mt-0.5 text-2xl font-medium leading-none text-gold-dark"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div className="border-l border-border-gray pl-5">
                    <h3 className="text-sm font-semibold text-black-soft">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-gray">{step.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>

          <WhatsAppCta
            message={templates.selecaoPersonalizada()}
            event="personalized_service_interest"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full bg-black-soft px-7 text-sm font-semibold text-off-white transition-colors hover:bg-graphite"
          >
            Quero uma seleção personalizada
          </WhatsAppCta>
        </div>
      </div>
    </section>
  )
}
