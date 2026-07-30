import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { brandShowcase } from "@/data/brands"

// "O que você procura hoje?": as MARCAS da casa como vitrine visual da home.
// A hierarquia é fixa — um card largo puxa cada linha e dois menores
// completam; no mobile a mesma ordem vira card largo em largura total +
// dupla lado a lado, sem carrossel.
//
// Os cards vêm da vitrine curada (data/brands.ts), na ordem de lá: os seis
// primeiros com card na home (vitrineHome !== false) entram, largos nas
// posições 1 e 4 (Lacoste e US Polo). Clique abre o catálogo já filtrado em
// /catalogo/marca/<slug> — marca sem SKU cai no estado vazio da página, que
// tem saída para o catálogo completo.
const VAGAS = 6
const cards = brandShowcase.filter((item) => item.vitrineHome !== false).slice(0, VAGAS)

// As artes -vitrine-v1 são banners 16:9 com o modelo à esquerda e o logo à
// direita. No card largo cabe quase o banner inteiro (o coverPosition de
// data/brands.ts, calibrado para card deitado, segue valendo). No card menor
// (4:5) só aparece ~45% da largura — este recorte centra a janela no LOGO da
// marca (pedido do proprietário), com o modelo entrando pela borda esquerda
// quando sobra espaço. Valores achados no olho, arte por arte.
const recorteNoLogo: Record<string, string> = {
  "tommy-hilfiger": "86% center",
  colcci: "88% center",
  "us-polo": "54% center",
  reserva: "82% center",
  ankor: "84% center",
}

export function CategoryShowcase() {
  return (
    <section id="compre-por-marca" className="scroll-mt-20 bg-bg-surface">
      <div className="shell py-12 lg:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            {/* Mesmo eyebrow das páginas de departamento, para a home e o
                catálogo falarem a mesma língua. */}
            <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
              Marcas
              <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
            </p>
            <h2 className="font-display mt-3 text-2xl font-medium uppercase tracking-[0.04em] text-text-primary sm:text-[28px]">
              O que você procura hoje?
            </h2>
          </div>

          <Link
            href="/catalogo"
            className="group flex shrink-0 items-center gap-2 pb-1 text-sm text-text-primary underline underline-offset-4 transition-colors hover:text-accent-strong"
          >
            Ver tudo
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Duas colunas no mobile, quatro no desktop: o card largo (col-span-2)
            vale sempre o dobro exato dos menores e, no mobile, vira a linha
            inteira. Os menores fixam a altura da linha via aspecto 4:5; no
            desktop o largo estica junto (stretch padrão da grade) e no mobile,
            sozinho na linha, usa o próprio aspecto paisagem. */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:mt-10 lg:grid-cols-4">
          {cards.map((item, i) => {
            const largo = i % 3 === 0
            return (
              <Link
                key={item.slug}
                href={`/catalogo/marca/${item.slug}`}
                className={`group relative block overflow-hidden rounded-lg bg-bg-elevated ${
                  largo ? "col-span-2 aspect-[16/10] lg:aspect-auto" : "aspect-[4/5]"
                }`}
              >
                {item.cover && (
                  <Image
                    src={item.cover}
                    alt=""
                    fill
                    sizes={
                      largo
                        ? "(min-width: 1024px) 50vw, 100vw"
                        : "(min-width: 1024px) 25vw, 50vw"
                    }
                    className="img-zoom object-cover"
                    style={{
                      objectPosition: largo
                        ? item.coverPosition ?? "center"
                        : recorteNoLogo[item.slug] ?? "center",
                    }}
                  />
                )}

                {/* Véu em degradê só na base, onde nome e seta pousam — as
                    artes são claras e o branco precisa deste apoio para ler. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/25 to-transparent"
                />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                  <span className="font-display text-lg font-semibold uppercase leading-none tracking-[0.06em] text-white sm:text-xl lg:text-2xl">
                    {item.name}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black-soft/90 text-white transition-colors group-hover:bg-accent-strong lg:h-11 lg:w-11"
                  >
                    <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.8} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
