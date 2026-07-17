import { siteConfig } from "@/data/site.config"
import { BrandLogo } from "@/components/BrandLogos"

// Faixa rotativa de marcas logo abaixo do hero.
// Lista duplicada para o loop parecer contínuo; pausa no hover e com reduced-motion.
export function BrandMarquee() {
  const brands = siteConfig.brands
  const track = [...brands, ...brands]

  return (
    <section aria-label="Marcas disponíveis na PR Grife" className="border-y border-border-gray bg-white">
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-6">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-text-gray">
          As marcas que você encontra na PR Grife
        </p>
      </div>

      <div className="marquee-group relative overflow-hidden py-6">
        {/* Máscaras laterais para o fade */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24"
          aria-hidden="true"
        />

        <div className="animate-marquee flex w-max items-center gap-14 sm:gap-20">
          {track.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="group flex h-12 w-28 shrink-0 items-center justify-center opacity-85"
              title={brand}
            >
              <BrandLogo name={brand} className="max-h-11 w-auto max-w-24 text-graphite/70" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
