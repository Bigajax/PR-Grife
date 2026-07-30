import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

// "O que você procura hoje?": seis destinos visuais no lugar da vitrine de
// marcas. A hierarquia é fixa — um card largo puxa cada linha (Tênis e
// Perfumes, os carros-chefe) e dois menores completam. No mobile a mesma
// ordem vira card largo em largura total + dupla lado a lado, sem carrossel.
//
// Os links reaproveitam as rotas reais do catálogo: departamentos diretos
// (/catalogo/tenis, /perfumes, /acessorios) e subcategoria via ?categoria=,
// que a página de departamento já entende (app/catalogo/[departamento]).
type CategoryCard = {
  label: string
  href: string
  image: string
  /** Card largo: ocupa duas colunas (o dobro exato dos menores). */
  wide?: boolean
  /** Reenquadra o object-cover quando o centro da foto não é o produto. */
  imagePosition?: string
}

const cards: CategoryCard[] = [
  {
    label: "Tênis",
    href: "/catalogo/tenis",
    image: "/images/products/tenis-hilfiger.jpg",
    wide: true,
    // Foto em retrato num card paisagem: mira o tênis de baixo, com o
    // "HILFIGER" da lateral inteiro no quadro.
    imagePosition: "center 62%",
  },
  {
    label: "Camisetas",
    href: "/catalogo/roupas?categoria=camisetas",
    image: "/images/products/camiseta-branca.jpg",
  },
  {
    label: "Polos",
    href: "/catalogo/roupas?categoria=polos",
    image: "/images/products/polo-branca.jpg",
    // O look é quadrado e a peça fica no alto à direita — sem isto o recorte
    // 4:5 centraria no jeans.
    imagePosition: "66% 22%",
  },
  {
    label: "Perfumes",
    href: "/catalogo/perfumes",
    image: "/images/products/perfume-le-male.jpg",
    wide: true,
    imagePosition: "center 58%",
  },
  {
    label: "Acessórios",
    href: "/catalogo/acessorios",
    image: "/images/products/bone-bege.jpg",
  },
  {
    label: "Jaquetas",
    href: "/catalogo/roupas?categoria=jaquetas",
    image: "/images/products/jaqueta-harrington.jpg",
  },
]

export function CategoryShowcase() {
  return (
    <section id="categorias" className="scroll-mt-20 bg-bg-surface">
      <div className="shell py-12 lg:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            {/* Mesmo eyebrow das páginas de departamento, para a home e o
                catálogo falarem a mesma língua. */}
            <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
              Categorias
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
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative block overflow-hidden rounded-lg bg-bg-elevated ${
                card.wide ? "col-span-2 aspect-[16/10] lg:aspect-auto" : "aspect-[4/5]"
              }`}
            >
              <Image
                src={card.image}
                alt=""
                fill
                sizes={
                  card.wide
                    ? "(min-width: 1024px) 50vw, 100vw"
                    : "(min-width: 1024px) 25vw, 50vw"
                }
                className="img-zoom object-cover"
                style={{ objectPosition: card.imagePosition ?? "center" }}
              />

              {/* Véu em degradê só na base, onde nome e seta pousam — as fotos
                  são claras e o branco precisa deste apoio para ler bem. */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/25 to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                <span className="font-display text-lg font-semibold uppercase leading-none tracking-[0.06em] text-white sm:text-xl lg:text-2xl">
                  {card.label}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black-soft/90 text-white transition-colors group-hover:bg-accent-strong lg:h-11 lg:w-11"
                >
                  <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.8} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
