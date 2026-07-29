import { Hero } from "@/components/Hero"
import { Brands } from "@/components/Brands"
import { BrandShowcase } from "@/components/BrandShowcase"
import { HomeFeature } from "@/components/HomeFeature"
import { RecommendedCarousel } from "@/components/RecommendedCarousel"
import { HomeDuo } from "@/components/HomeDuo"

// A home é porta de entrada, não vitrine: nenhuma grade de produto e nenhum
// filtro vivem aqui — a grade completa é só /catalogo. A faixa de marcas vem
// logo abaixo do hero, como prova de procedência antes de qualquer navegação.
export default function Home() {
  return (
    <main>
      <Hero />
      <Brands />
      <BrandShowcase />
      <HomeFeature />
      <RecommendedCarousel />
      <HomeDuo />
    </main>
  )
}
