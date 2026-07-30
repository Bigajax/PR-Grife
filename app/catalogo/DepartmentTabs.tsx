import Link from "next/link"
import { departments } from "@/data/departments"

// Abas de departamento no topo do catálogo. São links entre rotas — a URL é a
// fonte da verdade do recorte, como em todo o resto do catálogo. `active`
// ausente = aba "Todos" (/catalogo).
export function DepartmentTabs({ active }: { active?: string }) {
  const tabs = [
    { slug: undefined as string | undefined, label: "Todos", href: "/catalogo" },
    ...departments.map((d) => ({ slug: d.slug as string | undefined, label: d.label, href: `/catalogo/${d.slug}` })),
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
                  isActive
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
