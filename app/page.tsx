import { Hero } from "@/components/Hero"
import { Brands } from "@/components/Brands"
import { CategoryShowcase } from "@/components/CategoryShowcase"
import { HomeFeature } from "@/components/HomeFeature"
import { KitsCarousel } from "@/components/KitsCarousel"
import { HomeDuo } from "@/components/HomeDuo"
import { Reveal } from "@/components/Reveal"

// A home é porta de entrada, não vitrine: nenhuma grade de produto e nenhum
// filtro vivem aqui — a grade completa é só /catalogo. A faixa de marcas vem
// logo abaixo do hero, como prova de procedência antes de qualquer navegação.
// Cada seção abaixo do hero entra com o mesmo reveal calmo ao rolar; o hero
// tem entrada própria (hero-rise) e fica de fora. HomeDuo revela card a card.
export default function Home() {
  return (
    <main>
      <Hero />
      <Reveal>
        <Brands />
      </Reveal>
      <Reveal>
        <CategoryShowcase />
      </Reveal>
      <Reveal>
        <KitsCarousel />
      </Reveal>
      <Reveal>
        <HomeFeature />
      </Reveal>
      <HomeDuo />
    </main>
  )
}
