import { MessageCircle, Layers, Truck, PackageOpen } from "lucide-react"
import { Reveal } from "@/components/Reveal"

const items = [
  {
    icon: MessageCircle,
    title: "Atendimento personalizado",
    text: "Ajudamos você a escolher peças, combinações e tamanhos.",
  },
  {
    icon: Layers,
    title: "Multimarcas",
    text: "Curadoria de marcas e produtos selecionados.",
  },
  {
    icon: Truck,
    title: "Entrega nacional",
    text: "Receba suas peças em qualquer região do Brasil.",
  },
  {
    icon: PackageOpen,
    title: "Condicional",
    text: "Consulte a disponibilidade para receber uma seleção de peças.",
  },
]

export function Diferenciais() {
  return (
    <section className="border-b border-border-gray bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden bg-border-gray lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 60} className="h-full">
            <div className="flex h-full flex-col gap-3 bg-white p-5 sm:p-6 lg:p-8">
              <item.icon className="h-6 w-6 shrink-0 text-gold-dark" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h3 className="text-[15px] font-semibold leading-tight text-black-soft">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-gray">{item.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
