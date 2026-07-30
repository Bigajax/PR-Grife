import type { Metadata } from "next"
import { Suspense } from "react"
import { siteConfig } from "@/data/site.config"
import { Breadcrumb } from "@/components/Breadcrumb"
import { CatalogView } from "@/app/catalogo/CatalogView"
import { DepartmentTabs } from "@/app/catalogo/DepartmentTabs"

export const metadata: Metadata = {
  title: `Catálogo | ${siteConfig.name}`,
  description:
    "Todas as peças da PR Grife: camisetas, polos, camisas, calças, jaquetas, calçados e perfumaria. Filtre por categoria, marca, tamanho, cor e preço.",
  alternates: { canonical: "/catalogo" },
}

// A vitrine. Recebe os filtros pela query string, então um link já filtrado
// (vindo da home, do header ou colado no WhatsApp) abre no recorte certo.
export default function CatalogoPage() {
  return (
    <main className="bg-bg-base">
      <div className="shell pt-8">
        <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Catálogo" }]} />
        <h1 className="font-display mt-4 text-3xl font-medium text-text-primary sm:text-4xl">
          Catálogo
        </h1>
        <DepartmentTabs />
      </div>

      <Suspense>
        <CatalogView />
      </Suspense>
    </main>
  )
}
