import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/data/site.config"

const { hero } = siteConfig

// Hero fixo: copy sem data nem estação, vinda de site.config.
//
// Não há véu escuro sobre a foto. O texto ocupa a metade esquerda, que é
// parede lisa de estúdio — assim nunca cobre o rosto nem a peça, que vivem
// à direita. `tone` só escolhe a cor da tipografia (ver site.config).
export function Hero() {
  const light = hero.tone === "light"
  const ink = light ? "text-white" : "text-text-primary"
  const outline = light
    ? "border-white text-white hover:bg-white hover:text-text-primary"
    : "border-text-primary text-text-primary hover:bg-text-primary hover:text-white"

  return (
    <section className="hero-band">
      <div className="hero-band__photo">
        <Image
          src={hero.image}
          alt={hero.imageAlt}
          fill
          preload
          sizes="100vw"
          // Mobile: recorte retrato centrado no modelo, deixando o rodapé da
          // foto (piso liso) para o texto pousar.
          className="object-cover object-[63%_center] lg:object-[center_top]"
        />
      </div>

      {/* Mobile: texto dentro da própria foto, centralizado na parte de baixo.
          Desktop: coluna de texto à esquerda, longe do modelo. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-10 text-center sm:px-8 lg:inset-y-0 lg:left-0 lg:right-auto lg:w-[46%] lg:items-start lg:justify-center lg:px-12 lg:pb-0 lg:text-left">
        <h1
          className={`hero-rise font-display text-[36px] font-medium uppercase leading-none tracking-[0.08em] lg:text-[72px] ${ink}`}
        >
          {hero.title}
        </h1>

        <p
          className={`hero-rise mt-6 text-base lg:mt-8 lg:max-w-md ${ink}`}
          style={{ animationDelay: "120ms" }}
        >
          {hero.subtitle}
        </p>

        <Link
          href={hero.href}
          className={`hero-rise mt-5 inline-flex min-h-12 items-center border px-8 text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors lg:mt-7 ${outline}`}
          style={{ animationDelay: "200ms" }}
        >
          {hero.ctaLabel}
        </Link>
      </div>
    </section>
  )
}
