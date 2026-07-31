import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/data/site.config"

const { homeFeature } = siteConfig

// Bloco editorial da home, entre categorias e marcas.
// Metade e metade: a foto sangra até a borda esquerda do viewport — a seção não
// usa o recuo do container, então a coluna da imagem já nasce colada na borda.
// Sem card, sem borda, sem sombra. A coluna de texto tem exatamente três
// elementos: título, apoio e botão.
//
// Fundo preto (--color-noir): é a única seção escura do corpo da página, e a
// foto sobre madeira escura se funde nele — a faixa lê como um painel só, não
// como imagem + caixa de texto. Por isso a paleta inteira do bloco inverte, o
// botão incluído. O véu botânico é multiply, então não pousa nada aqui: a
// separação da seção vem do próprio corte de cor.
export function HomeFeature() {
  return (
    <section className="bg-noir" aria-labelledby="destaque-home">
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
              className="font-display text-2xl font-medium uppercase leading-tight tracking-[0.04em] text-bg-base sm:text-[28px]"
            >
              {homeFeature.title}
            </h2>

            <p className="mt-4 text-base leading-relaxed text-noir-muted">
              {homeFeature.lines.join(" ")}
            </p>

            {/* Botão espelhado: no claro é pílula grafite com texto branco;
                aqui é o inverso exato, mesmo peso e mesmo raio. */}
            <Link
              href={homeFeature.href}
              className="tap mt-7 inline-flex min-h-12 items-center rounded-full bg-bg-base px-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-noir hover:opacity-90"
            >
              {homeFeature.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
