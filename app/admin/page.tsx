import Link from "next/link"
import { getAdminCatalog, type AdminProduct } from "@/lib/products/db"
import { isOnSale } from "@/lib/catalog"

export const dynamic = "force-dynamic"

// Visão geral: contagens que levam à lista já filtrada. Tolerante a falhas —
// banco sem migration mostra aviso em vez de derrubar o painel.
export default async function AdminHomePage() {
  let products: AdminProduct[] = []
  let dbError: string | null = null
  try {
    products = await getAdminCatalog()
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erro desconhecido."
  }

  const published = products.filter((p) => !p.archivedAt)
  const cards = [
    { label: "Publicados", count: published.length, href: "/admin/produtos?filtro=publicados" },
    { label: "Arquivados", count: products.length - published.length, href: "/admin/produtos?filtro=arquivados" },
    { label: "Em oferta", count: published.filter(isOnSale).length, href: "/admin/produtos?filtro=ofertas" },
    { label: "Sem foto", count: products.filter((p) => p.images.length === 0).length, href: "/admin/produtos?filtro=sem-foto" },
    {
      label: "Últimas unidades",
      count: published.filter((p) => p.stockStatus === "low_stock").length,
      href: "/admin/estoque?situacao=low_stock",
    },
    {
      label: "Esgotados",
      count: published.filter((p) => p.stockStatus === "out_of_stock").length,
      href: "/admin/estoque?situacao=out_of_stock",
    },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl font-medium text-text-primary">Visão geral</h1>

      {dbError ? (
        <div className="mt-6 border border-accent bg-accent-soft p-5 text-sm leading-relaxed text-text-primary">
          <p className="font-semibold">O banco ainda não respondeu.</p>
          <p className="mt-1">
            {/does not exist|schema cache/i.test(dbError)
              ? "Parece que a migration ainda não foi executada. Rode supabase/migrations/0001_catalogo.sql no SQL Editor do Supabase (passo a passo em docs/admin.md)."
              : `Detalhe técnico: ${dbError}`}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-3xl">
            {cards.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="border border-border bg-bg-elevated p-4 transition-colors hover:border-accent"
              >
                <p className="text-3xl font-semibold tabular-nums text-text-primary">{c.count}</p>
                <p className="mt-1 text-[13px] text-text-secondary">{c.label}</p>
              </Link>
            ))}
          </div>
          {products.length === 0 && (
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-text-secondary">
              Nenhum produto no banco ainda. Rode <code className="bg-bg-elevated px-1">npm run seed</code> para
              importar o catálogo demonstrativo, ou cadastre o primeiro produto em{" "}
              <Link href="/admin/produtos" className="font-semibold text-accent-strong underline underline-offset-2">
                Produtos
              </Link>
              .
            </p>
          )}
        </>
      )}
    </div>
  )
}
