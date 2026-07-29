import Image from "next/image"
import Link from "next/link"
import { categories } from "@/data/categories"
import { Carousel } from "@/components/Carousel"

// Ordem de vitrine definida no brief — não é a ordem canônica de data/categories.
const homeOrder = [
  "camisetas",
  "polos",
  "camisas",
  "tenis",
  "calcas",
  "jaquetas",
  "shorts",
  "moletons-tricos",
]

const homeCategories = homeOrder
  .map((id) => categories.find((c) => c.id === id))
  .filter((c): c is NonNullable<typeof c> => Boolean(c))

export function Categories() {
  return (
    <section id="categorias" className="scroll-mt-20 bg-bg-surface">
      <div className="shell py-12 lg:py-20">
        <Carousel title="Categorias">
          {/* Largura descontando os gaps de 24px: 1,6 cards no mobile e 4 + o
              recorte do 5º no desktop. */}
          {homeCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.id}`}
              className="group w-[calc((100%_-_1.5rem)/1.6)] sm:w-[calc((100%_-_3rem)/2.6)] lg:w-[calc((100%_-_4.5rem)/4.35)]"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-surface">
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 28vw, (min-width: 640px) 40vw, 62vw"
                  className="img-zoom object-cover"
                />
              </div>
              <span className="mt-3 block text-sm text-text-primary underline underline-offset-4 group-hover:text-accent">
                {cat.label}
              </span>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  )
}
