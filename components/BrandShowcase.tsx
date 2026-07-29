import Image from "next/image"
import Link from "next/link"
import { showcaseBrands } from "@/lib/catalog"
import { BrandLogo } from "@/components/BrandLogos"
import { Carousel } from "@/components/Carousel"

// "Compre por marca": um card por marca, nome embaixo, clique abre o catálogo
// já filtrado. Card com `cover` cadastrada (data/brands.ts) mostra a arte da
// marca; sem cover, mostra o LOGO oficial centrado sobre fundo claro. Marca
// sem logo cadastrado (Jean Paul Gaultier) cai no nome em texto.
export function BrandShowcase() {
  return (
    <section id="compre-por-marca" className="scroll-mt-20 bg-bg-surface">
      <div className="shell py-12 lg:py-20">
        <Carousel title="Compre por marca">
          {/* Largura descontando os gaps de 24px: 1,35 cards no mobile e 4 + o
              recorte do 5º no desktop, para indicar continuidade. */}
          {showcaseBrands
            .filter((item) => item.vitrineHome !== false)
            .map((item) => (
            <Link
              key={item.slug}
              href={`/catalogo?marca=${item.slug}`}
              className="group w-[calc((100%_-_1.5rem)/1.35)] sm:w-[calc((100%_-_3rem)/2.6)] lg:w-[calc((100%_-_4.5rem)/4.35)]"
            >
              <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border border-border bg-bg-elevated p-8 transition-colors group-hover:border-text-primary">
                {item.cover ? (
                  <Image
                    src={item.cover}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 40vw, 74vw"
                    className="img-zoom object-cover"
                    style={{ objectPosition: item.coverPosition ?? "center" }}
                  />
                ) : (
                  <BrandLogo name={item.name} className="h-12 w-auto max-w-full lg:h-14" />
                )}
              </div>
              <span className="mt-3 block text-sm text-text-primary underline underline-offset-4 group-hover:text-accent">
                {item.name}
              </span>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  )
}
