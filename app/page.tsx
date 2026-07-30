import { Hero } from "@/components/Hero"
import { Brands } from "@/components/Brands"
import { BrandShowcase } from "@/components/BrandShowcase"
import { HomeFeature } from "@/components/HomeFeature"
import { RecommendedCarousel } from "@/components/RecommendedCarousel"
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
        <BrandShowcase />
      </Reveal>
      <Reveal>
        <HomeFeature />
      </Reveal>
      <Reveal>
        <RecommendedCarousel />
      </Reveal>
      <HomeDuo />
    </main>
  )
}
