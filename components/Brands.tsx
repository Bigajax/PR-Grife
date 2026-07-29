import Link from "next/link"
import { brandShowcase } from "@/data/brands"
import { BrandLogo } from "@/components/BrandLogos"

// São poucas marcas: um trilho mais estreito que a tela abriria um vão visível
// no meio do laço. Quatro cópias dão cerca de 4900px, o que cobre monitores
// largos. Só a primeira cópia é navegável — as demais são repetição visual, e
// sem isso o Tab passaria pela mesma marca quatro vezes.
const REPETICOES = 4

// A faixa segue a vitrine curada (data/brands.ts): as 8 marcas confirmadas,
// com a família Tommy representada uma vez só.
const loop = Array.from({ length: REPETICOES }, (_, volta) =>
  brandShowcase.map((item) => ({ item, decorativo: volta > 0 }))
).flat()

type Slide = { item: (typeof brandShowcase)[number]; decorativo: boolean }

// Fundo branco de propósito: vários logos têm fundo branco chapado e, sobre a
// superfície bege, apareciam como um retângulo em volta da marca.
// TODO_CONFIRMAR — substituir por logotipos oficiais autorizados das marcas.
export function Brands() {
  return (
    <section
      id="marcas"
      aria-label="Marcas que você encontra na PR Grife"
      className="scroll-mt-20 border-y border-border bg-bg-elevated py-10 lg:py-12"
    >
      <div className="marquee">
        <Track items={loop} />
        <Track items={loop} duplicado />
      </div>
    </section>
  )
}

function Track({ items, duplicado = false }: { items: Slide[]; duplicado?: boolean }) {
  return (
    <ul className="marquee__track" aria-hidden={duplicado || undefined}>
      {items.map(({ item, decorativo }, i) => {
        const oculto = decorativo || duplicado
        return (
          <li key={`${item.slug}-${i}`} className="shrink-0" aria-hidden={oculto || undefined}>
            <Link
              href={`/catalogo?marca=${item.slug}`}
              aria-label={oculto ? undefined : `Ver peças ${item.name}`}
              tabIndex={oculto ? -1 : undefined}
              className="group flex items-center justify-center"
            >
              <BrandLogo
                name={item.name}
                className="h-12 max-w-32 text-text-primary transition-colors group-hover:text-accent-strong"
              />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
