import Image from "next/image"
import Link from "next/link"
import { categories } from "@/data/categories"
import { SectionHeading } from "@/components/SectionHeading"

// Home: 6 categorias principais em cards uniformes. O restante vive no catálogo.
const mainCategories = categories.slice(0, 6)

export function Categories() {
  return (
    <section id="categorias" className="scroll-mt-20 bg-beige-light">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Categorias" title="Encontre o que combina com você." />
          <Link
            href="/catalogo"
            className="inline-flex min-h-12 items-center rounded-full border border-black-soft px-6 text-sm font-semibold text-black-soft transition-colors hover:border-gold-dark hover:text-gold-dark"
          >
            Ver todas as categorias
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5">
          {mainCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo/${cat.id}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-sand"
            >
              <Image
                src={cat.image}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="img-zoom object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black-soft/70 via-black-soft/10 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-display text-xl font-medium text-off-white sm:text-2xl">{cat.label}</h3>
                <span className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-gold transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                  Explorar categoria
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
