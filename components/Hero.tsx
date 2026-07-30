import Link from "next/link"
import { siteConfig } from "@/data/site.config"
import { HeroVideo } from "@/components/HeroVideo"

const { hero } = siteConfig

// Hero: texto de um lado, vídeos do feed do outro, retos e esguios como os
// reels de onde vêm. Um vídeo cadastrado vira um card; dois ou três viram a
// fileira com o do meio rebaixado (ver site.config.hero.videos).
export function Hero() {
  const videos = hero.videos
  // Largura da fileira cresce com o número de cards: 1 vira um card só,
  // 2 ficam lado a lado, 3 formam o trio.
  const larguraColagem =
    videos.length >= 3
      ? "max-w-lg grid-cols-3 lg:max-w-none"
      : videos.length === 2
        ? "max-w-sm grid-cols-2 lg:max-w-md"
        : "max-w-[240px] lg:max-w-xs"

  return (
    <section className="bg-bg-surface">
      <div className="shell grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-20">
        <div>
          {/* text-balance: a pergunta quebra em duas linhas equilibradas no
              mobile ("O que você / procura hoje?"), nunca com palavra órfã. */}
          <h1 className="hero-rise font-display text-balance text-[28px] font-medium uppercase leading-[1.1] tracking-[0.06em] text-text-primary lg:text-[36px]">
            {hero.title}
          </h1>

          {/* Selo da casa em dourado — o mesmo ouro do diamante da logo.
              Nunca quebra linha: o corpo escala com a tela (clamp) para caber
              inteiro até em 320px. */}
          <p
            className="hero-rise mt-4 whitespace-nowrap text-[clamp(11px,3.4vw,14px)] font-semibold uppercase tracking-[0.22em] text-[#C2A15D] lg:mt-5"
            style={{ animationDelay: "120ms" }}
          >
            {hero.subtitle}
          </p>

          <Link
            href={hero.href}
            className="hero-rise mt-7 inline-flex min-h-12 items-center border border-text-primary px-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-text-primary transition-colors hover:bg-text-primary hover:text-white"
            style={{ animationDelay: "200ms" }}
          >
            {hero.ctaLabel}
          </Link>
        </div>

        {/* Fileira de reels: cards retos em 9:16, moldura de fio fino e sombra
            suave — o do meio desce um pouco para dar ritmo sem inclinar nada.
            Com um vídeo só, o card fica na largura que a proporção pede. */}
        <div className={`mx-auto grid w-full gap-4 ${larguraColagem}`}>
          {videos.map((video, i) => {
            const ultimo = i === videos.length - 1
            return (
              <div
                key={video.src}
                className={`hero-rise relative ${i === 1 ? "mt-8" : ""}`}
                style={{ animationDelay: `${160 + i * 100}ms` }}
              >
                <span className="relative block aspect-[9/16] overflow-hidden rounded-xl bg-bg-elevated shadow-[0_24px_48px_-24px_rgba(28,28,26,0.35)] ring-1 ring-black/10">
                  <HeroVideo src={video.src} poster={video.poster} />
                </span>
                {/* Selo de origem dos vídeos: o feed da loja. O leve giro do
                    selo é o único elemento inclinado do hero. */}
                {ultimo && (
                  <a
                    href={siteConfig.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute -bottom-4 -right-2 rotate-[-2deg] rounded bg-text-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg transition-colors hover:bg-accent-strong"
                  >
                    {siteConfig.instagramHandle}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
