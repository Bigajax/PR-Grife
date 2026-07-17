import Link from "next/link"
import { siteConfig } from "@/data/site.config"
import { SectionHeading } from "@/components/SectionHeading"
import { BrandLogo } from "@/components/BrandLogos"

// Cards de marca com lockup de logo monocromático (placeholder autoral).
// TODO_CONFIRMAR — substituir por logotipos oficiais autorizados das marcas ativas.
export function Brands() {
  return (
    <section id="marcas" className="scroll-mt-20 border-y border-border-gray bg-beige-light">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
        <SectionHeading
          eyebrow="Marcas"
          title="Marcas selecionadas."
          text="Uma curadoria multimarcas de alto padrão. Toque em uma marca para ver as peças na vitrine."
        />

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {siteConfig.brands.map((brand) => (
            <li key={brand}>
              <Link
                href={`/catalogo?marca=${encodeURIComponent(brand)}`}
                aria-label={`Ver produtos ${brand}`}
                className="group flex min-h-44 flex-col items-center justify-center gap-4 border border-border-gray bg-white px-4 py-7 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_12px_32px_-16px_rgba(23,23,22,0.18)]"
              >
                <span className="flex h-16 items-center justify-center">
                  <BrandLogo
                    name={brand}
                    className="h-14 max-w-36 text-graphite transition-colors group-hover:text-gold-dark"
                  />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-gray transition-colors group-hover:text-black-soft">
                  {brand}
                </span>
                <span className="-mt-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-dark opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Ver produtos <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
