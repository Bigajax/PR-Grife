import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { siteConfig } from "@/data/site.config"
import { brandLogoAssets } from "@/data/brands"
import { products as staticProducts } from "@/data/products"
import { showcaseBrandsFor } from "@/lib/catalog"
import { getCatalog } from "@/lib/products/db"
import { Breadcrumb } from "@/components/Breadcrumb"
import { BrandLogo } from "@/components/BrandLogos"
import { CatalogView } from "@/app/catalogo/CatalogView"

// Template único de marca. O lock vai por SLUG da vitrine (não pelo nome):
// é o que faz "tommy-hilfiger" agrupar Tommy Hilfiger + Tommy Jeans via
// brandNamesForFilter. Rota estática /catalogo/marca vence a dinâmica
// /catalogo/[departamento] por precedência do App Router.
// Marca nova criada no painel ganha página sob demanda (dynamicParams).
export const dynamicParams = true

export function generateStaticParams() {
  return showcaseBrandsFor(staticProducts).map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = showcaseBrandsFor(await getCatalog()).find((i) => i.slug === slug)
  if (!item) return {}
  return {
    title: `${item.name} | ${siteConfig.name}`,
    description: `Peças ${item.name} na curadoria da PR Grife — consulte disponibilidade e condições pelo WhatsApp.`,
    alternates: { canonical: `/catalogo/marca/${slug}` },
  }
}

export default async function MarcaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = showcaseBrandsFor(await getCatalog()).find((i) => i.slug === slug)
  if (!item) notFound()

  return (
    <main className="bg-bg-base">
      <div className="shell pt-8">
        <Breadcrumb
          items={[
            { label: "Início", href: "/" },
            { label: "Catálogo", href: "/catalogo" },
            { label: item.name },
          ]}
        />
        <p className="mt-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
          Marca
          <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
        </p>
        <div className="mt-3 flex items-center gap-5">
          <h1 className="font-display text-4xl font-medium text-black-soft sm:text-5xl">
            {item.name}
          </h1>
          {/* Sem logo cadastrado o BrandLogo cai no nome em texto — que aqui
              duplicaria o h1, então só renderiza quando há arte. */}
          {brandLogoAssets[item.name] && (
            <BrandLogo name={item.name} className="hidden h-8 w-auto sm:block" />
          )}
        </div>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-text-gray">
          Peças {item.name} selecionadas pela curadoria PR Grife.
        </p>
      </div>

      <Suspense>
        <CatalogView locked={{ marca: item.slug }} />
      </Suspense>
    </main>
  )
}
