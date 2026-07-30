import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { siteConfig } from "@/data/site.config"
import { Reveal } from "@/components/Reveal"

const { homeDuo } = siteConfig

// Par de cards editoriais: dois destinos que não cabem no carrossel de
// categorias. O card inteiro é o alvo de clique — a seta é indicativa, não um
// segundo link.
export function HomeDuo() {
  return (
    <section className="bg-bg-base" aria-label="Destaques de categoria">
      <div className="shell grid gap-6 py-8 md:grid-cols-2 lg:py-10">
        {/* Segundo card entra um passo depois do primeiro — só o suficiente
            para o olho ler a ordem, sem virar coreografia. */}
        {homeDuo.map((card, i) => (
          <Reveal key={card.href} delay={i * 120}>
          <Link href={card.href} className="group relative block overflow-hidden">
            <div className="relative aspect-[4/5] w-full bg-bg-surface">
              <Image
                src={card.image}
                alt={card.imageAlt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="img-zoom object-cover"
              />
              {/* Véu só no terço inferior, onde o texto pousa. A foto inteira
                  continua limpa. */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent"
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <h2 className="font-display text-[30px] font-medium leading-tight text-white">
                {card.title}
              </h2>
              <p className="mt-1 text-[15px] text-white">{card.subtitle}</p>
              <span
                aria-hidden="true"
                className="mt-5 flex h-12 w-12 items-center justify-center bg-white text-text-primary"
              >
                <ArrowRight className="h-5 w-5" strokeWidth={1.6} />
              </span>
            </div>
          </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
