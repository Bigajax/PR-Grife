import Link from "next/link"
import { brandShowcase } from "@/data/brands"
import { BrandLogo } from "@/components/BrandLogos"

// Um trilho mais estreito que a tela abriria um vão visível no meio do laço.
// Com mais de uma dúzia de marcas cada cópia já passa de 3000px, então duas
// bastam para cobrir monitores largos — eram quatro quando a faixa tinha 8. Só
// a primeira cópia é navegável: sem isso o Tab passaria pela mesma marca várias
// vezes.
const REPETICOES = 2

// A faixa segue a vitrine curada (data/brands.ts), com a família Tommy
// representada uma vez só. `faixaLogos: false` sai daqui e continua no card da
// home e na navegação do catálogo — as vitrines são independentes.
const naFaixa = brandShowcase.filter((item) => item.faixaLogos !== false)

const loop = Array.from({ length: REPETICOES }, (_, volta) =>
  naFaixa.map((item) => ({ item, decorativo: volta > 0 }))
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
              href={`/catalogo/marca/${item.slug}`}
              aria-label={oculto ? undefined : `Ver peças ${item.name}`}
              tabIndex={oculto ? -1 : undefined}
              className="group flex items-center justify-center"
            >
              {/* Altura FIXA + teto de largura, e os dois são necessários.
                  Altura fixa porque vários SVGs (Tommy Hilfiger, Dior) só
                  trazem viewBox, sem dimensão própria: com `max-h` eles
                  colapsam para 0×0 e somem da faixa. Teto de largura porque a
                  faixa mistura emblema quase quadrado (crocodilo, estrela) com
                  wordmark de proporção 12:1 (Carolina Herrera, Dolce &
                  Gabbana) — sem teto, um deles sozinho ocuparia meia tela.
                  O object-contain do BrandLogo centraliza o que sobra. */}
              <BrandLogo
                name={item.name}
                className="h-11 w-auto max-w-[240px] text-text-primary transition-colors group-hover:text-accent-strong"
              />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
