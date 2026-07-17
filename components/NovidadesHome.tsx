import Link from "next/link"
import { products } from "@/data/products"
import { SectionHeading } from "@/components/SectionHeading"
import { ProductCard } from "@/components/ProductCard"

// Home: vitrine curta com até 8 peças (novidades primeiro, destaques como reforço).
// O catálogo completo vive em /catalogo.
const highlights = [...products]
  .sort(
    (a, b) =>
      Number(b.newArrival ?? false) - Number(a.newArrival ?? false) ||
      Number(b.featured ?? false) - Number(a.featured ?? false)
  )
  .slice(0, 8)

export function NovidadesHome() {
  return (
    <section id="novidades" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Novidades" title="Novidades que acabaram de chegar." />
          <Link
            href="/catalogo"
            className="inline-flex min-h-12 items-center rounded-full border border-black-soft px-6 text-sm font-semibold text-black-soft transition-colors hover:border-gold-dark hover:text-gold-dark"
          >
            Ver catálogo completo
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
          {highlights.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 flex justify-center lg:hidden">
          <Link
            href="/catalogo"
            className="inline-flex min-h-12 items-center rounded-full bg-black-soft px-8 text-sm font-semibold text-off-white"
          >
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </section>
  )
}
