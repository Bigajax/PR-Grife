import Image from "next/image"
import Link from "next/link"
import { Reveal } from "@/components/Reveal"

// Destaque editorial: composição fotográfica assimétrica, não uma grade.
export function Editorial() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-0 lg:py-28">
        <Reveal className="relative z-10 lg:-mr-20">
          <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
            Essenciais
            <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
          </p>
          <h2 className="font-display mt-4 max-w-md text-3xl font-medium leading-[1.12] text-black-soft sm:text-4xl lg:text-[2.75rem]">
            Essenciais que atravessam temporadas.
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-text-gray">
            Tricôs neutros, alfaiataria leve e peças que funcionam juntas — a base que sustenta
            qualquer look, do trabalho ao jantar.
          </p>
          <Link
            href="#novidades"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-black-soft px-7 text-sm font-semibold text-black-soft transition-colors hover:border-gold-dark hover:text-gold-dark"
          >
            Explorar essenciais
          </Link>
        </Reveal>

        <Reveal delay={100} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden bg-beige-light sm:aspect-[16/11] lg:aspect-[4/5]">
            <Image
              src="/images/editorial.jpg"
              alt="Composição de essenciais: tricô bege, calça escura e tênis, ao lado do modelo vestindo o conjunto"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          </div>
          <div
            className="absolute -bottom-5 left-8 hidden h-px w-40 bg-gold lg:block"
            aria-hidden="true"
          />
        </Reveal>
      </div>
    </section>
  )
}
