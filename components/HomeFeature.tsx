import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/data/site.config"

const { homeFeature } = siteConfig

// Bloco editorial da home, entre categorias e marcas.
// Metade e metade: a foto sangra até a borda esquerda do viewport — a seção não
// usa o recuo do container, então a coluna da imagem já nasce colada na borda.
// Sem card, sem borda, sem sombra. A coluna de texto tem exatamente três
// elementos: título, apoio e botão.
export function HomeFeature() {
  return (
    <section className="bg-bg-base" aria-labelledby="destaque-home">
      <div className="grid md:grid-cols-[0.9fr_1.1fr]">
        {/* Quadro 4:5 = a proporção exata da foto (1024×1280), então o
            object-cover não corta nada. A coluna da imagem é um pouco mais
            estreita que a do texto (0.9fr) para a seção não ficar tão alta.
            Ao trocar por uma foto de outra proporção, ajuste este aspect. */}
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={homeFeature.image}
            alt={homeFeature.imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center px-5 py-10 sm:px-6 md:px-10 md:py-12 lg:px-14">
          <div className="md:max-w-[60%]">
            <h2
              id="destaque-home"
              className="font-display text-[34px] font-medium leading-tight text-text-primary"
            >
              {homeFeature.title}
            </h2>

            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              {homeFeature.lines.join(" ")}
            </p>

            <Link
              href={homeFeature.href}
              className="mt-7 inline-flex min-h-12 items-center bg-text-primary px-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90"
            >
              {homeFeature.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
