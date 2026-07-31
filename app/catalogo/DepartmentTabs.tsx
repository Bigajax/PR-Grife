import Link from "next/link"
import { departments } from "@/data/departments"
import { getCatalog } from "@/lib/products/db"
import { isOnSale } from "@/lib/catalog"

// Abas de departamento no topo do catálogo. São links entre rotas — a URL é a
// fonte da verdade do recorte, como em todo o resto do catálogo. `active`
// ausente = aba "Todos" (/catalogo).
//
// A aba Ofertas só existe enquanto houver peça em oferta de verdade (preço
// "de" preenchido no painel) e vai em ouro — o mesmo da etiqueta dos cards.
export async function DepartmentTabs({ active }: { active?: string }) {
  const products = await getCatalog()
  const hasOffers = products.some((p) => isOnSale(p))

  const tabs = [
    { slug: undefined as string | undefined, label: "Todos", href: "/catalogo", oferta: false },
    ...departments.map((d) => ({
      slug: d.slug as string | undefined,
      label: d.label,
      href: `/catalogo/${d.slug}`,
      oferta: false,
    })),
    ...(hasOffers
      ? [{ slug: "ofertas" as string | undefined, label: "Ofertas", href: "/ofertas", oferta: true }]
      : []),
  ]

  return (
    <nav aria-label="Departamentos" className="mt-6 border-b border-border">
      <ul className="flex gap-7 overflow-x-auto no-scrollbar">
        {tabs.map((t) => {
          const isActive = t.slug === active
          return (
            <li key={t.label} className="shrink-0">
              <Link
                href={t.href}
                aria-current={isActive ? "page" : undefined}
                className={`block border-b-2 pb-3 text-[12.5px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  t.oferta
                    ? isActive
                      ? "border-[#C2A15D] text-[#A8853F]"
                      : "border-transparent text-[#A8853F] hover:text-[#8a6c30]"
                    : isActive
                      ? "border-accent text-text-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {t.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
