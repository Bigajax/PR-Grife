import Link from "next/link"
import { siteConfig } from "@/data/site.config"
import { categories } from "@/data/categories"
import { Logo } from "@/components/Logo"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black-soft text-sand">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:py-16">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand/80">
            Moda masculina multimarcas em Maringá: curadoria de peças, atendimento próximo e
            entrega para todo o Brasil.
          </p>
        </div>

        <nav aria-label="Categorias">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Categorias</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {categories.map((cat) => (
              <li key={cat.id}>
                <a href="#novidades" className="text-sand/80 transition-colors hover:text-gold">
                  {cat.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Marcas</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {siteConfig.brands.slice(0, 6).map((brand) => (
              <li key={brand} className="text-sand/80">
                {brand}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Contato</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-sand/80">
            <li>{siteConfig.address}</li>
            <li>{siteConfig.hours}</li>
            <li>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold"
              >
                {siteConfig.instagramHandle}
              </a>
            </li>
          </ul>
          <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Políticas</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/politicas/trocas" className="text-sand/80 transition-colors hover:text-gold">
                Trocas e devoluções
              </Link>
            </li>
            <li>
              <Link href="/politicas/privacidade" className="text-sand/80 transition-colors hover:text-gold">
                Privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-5 py-6 text-xs text-sand/60 sm:flex-row sm:items-center sm:px-6">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Autoestima, estilo e curadoria em cada
            escolha.
          </p>
          <p>Vitrine digital — preços e disponibilidade confirmados no atendimento.</p>
        </div>
      </div>
    </footer>
  )
}
