import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { categories, categoryLabel } from "@/data/categories"
import { siteConfig } from "@/data/site.config"
import { Breadcrumb } from "@/components/Breadcrumb"
import { CatalogView } from "../CatalogView"

export function generateStaticParams() {
  return categories.map((c) => ({ categoria: c.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>
}): Promise<Metadata> {
  const { categoria } = await params
  const cat = categories.find((c) => c.id === categoria)
  if (!cat) return {}
  return {
    title: `${cat.label} | Catálogo ${siteConfig.name}`,
    description: `${cat.label} na PR Grife — moda masculina multimarcas com atendimento personalizado e entrega para todo o Brasil.`,
    alternates: { canonical: `/catalogo/${cat.id}` },
  }
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>
}) {
  const { categoria } = await params
  const cat = categories.find((c) => c.id === categoria)
  if (!cat) notFound()

  return (
    <main className="bg-white">
      <div className="shell pt-8">
        <Breadcrumb
          items={[
            { label: "Início", href: "/" },
            { label: "Catálogo", href: "/catalogo" },
            { label: cat.label },
          ]}
        />
        <p className="mt-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
          Categoria
          <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium text-black-soft sm:text-5xl">{cat.label}</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-text-gray">
          {categoryLabel(cat.id)} selecionados pela PR Grife. Filtre por marca, tamanho e cor.
        </p>
      </div>

      <Suspense>
        <CatalogView locked={{ categoria: cat.id }} />
      </Suspense>
    </main>
  )
}
