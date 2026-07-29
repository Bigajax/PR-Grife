import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { siteConfig } from "@/data/site.config"
import { brandSlug, brandBySlug } from "@/lib/catalog"
import { Breadcrumb } from "@/components/Breadcrumb"
import { BrandLogo } from "@/components/BrandLogos"
import { CatalogView } from "@/app/catalogo/CatalogView"

export function generateStaticParams() {
  return siteConfig.brands.map((b) => ({ slug: brandSlug(b) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const brand = brandBySlug(slug)
  if (!brand) return {}
  return {
    title: `${brand} | ${siteConfig.name}`,
    description: `Peças ${brand} na curadoria da PR Grife — consulte disponibilidade e condições pelo WhatsApp.`,
    alternates: { canonical: `/marca/${slug}` },
  }
}

export default async function MarcaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const brand = brandBySlug(slug)
  if (!brand) notFound()

  return (
    <main className="bg-white">
      <div className="shell pt-8">
        <Breadcrumb
          items={[
            { label: "Início", href: "/" },
            { label: "Marcas", href: "/#marcas" },
            { label: brand },
          ]}
        />
        <p className="mt-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
          Marca
          <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
        </p>
        <div className="mt-3 flex items-center gap-5">
          <h1 className="font-display text-4xl font-medium text-black-soft sm:text-5xl">{brand}</h1>
          <BrandLogo name={brand} className="hidden h-8 w-auto sm:block" />
        </div>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-text-gray">
          Peças {brand} selecionadas pela curadoria PR Grife.
        </p>
      </div>

      <Suspense>
        <CatalogView locked={{ marca: brand }} />
      </Suspense>
    </main>
  )
}
