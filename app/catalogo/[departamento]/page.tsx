import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { departments, departmentBySlug } from "@/data/departments"
import { siteConfig } from "@/data/site.config"
import { Breadcrumb } from "@/components/Breadcrumb"
import { CatalogView } from "../CatalogView"
import { DepartmentTabs } from "../DepartmentTabs"

// Página de departamento (/catalogo/roupas, /perfumes, /acessorios, /tenis).
// Subcategoria continua livre via ?categoria= — só o departamento é travado.
export function generateStaticParams() {
  return departments.map((d) => ({ departamento: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ departamento: string }>
}): Promise<Metadata> {
  const { departamento } = await params
  const dep = departmentBySlug(departamento)
  if (!dep) return {}
  return {
    title: `${dep.label} | Catálogo ${siteConfig.name}`,
    description: `${dep.description} Atendimento personalizado pelo WhatsApp e entrega para todo o Brasil.`,
    alternates: { canonical: `/catalogo/${dep.slug}` },
  }
}

export default async function DepartamentoPage({
  params,
}: {
  params: Promise<{ departamento: string }>
}) {
  const { departamento } = await params
  const dep = departmentBySlug(departamento)
  if (!dep) notFound()

  return (
    <main className="bg-bg-base">
      <div className="shell pt-8">
        <Breadcrumb
          items={[
            { label: "Início", href: "/" },
            { label: "Catálogo", href: "/catalogo" },
            { label: dep.label },
          ]}
        />
        <p className="mt-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
          Departamento
          <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium text-black-soft sm:text-5xl">
          {dep.label}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-text-gray">{dep.description}</p>
        <DepartmentTabs active={dep.slug} />
      </div>

      <Suspense>
        <CatalogView locked={{ departamento: dep.slug }} />
      </Suspense>
    </main>
  )
}
