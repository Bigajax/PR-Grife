import { Hero } from "@/components/Hero"
import { BrandMarquee } from "@/components/BrandMarquee"
import { Diferenciais } from "@/components/Diferenciais"
import { Categories } from "@/components/Categories"
import { NovidadesHome } from "@/components/NovidadesHome"
import { Atendimento } from "@/components/Atendimento"
import { Looks } from "@/components/Looks"
import { Condicional } from "@/components/Condicional"
import { Editorial } from "@/components/Editorial"
import { Brands } from "@/components/Brands"
import { Loja } from "@/components/Loja"
import { Compromisso } from "@/components/Compromisso"
import { InstagramSection } from "@/components/InstagramSection"
import { Faq } from "@/components/Faq"
import { FinalCta } from "@/components/FinalCta"

export default function Home() {
  return (
    <main>
      <Hero />
      <BrandMarquee />
      <Diferenciais />
      <Categories />
      <NovidadesHome />
      <Atendimento />
      <Looks />
      <Condicional />
      <Editorial />
      <Brands />
      <Loja />
      <Compromisso />
      <InstagramSection />
      <Faq />
      <FinalCta />
    </main>
  )
}
