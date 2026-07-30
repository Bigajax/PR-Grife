import { getAdminCatalog, type AdminProduct } from "@/lib/products/db"
import { ProductsTable } from "@/components/admin/ProductsTable"

export const dynamic = "force-dynamic"

export default async function AdminProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>
}) {
  const { filtro } = await searchParams
  let products: AdminProduct[] = []
  let dbError: string | null = null
  try {
    products = await getAdminCatalog()
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erro desconhecido."
  }

  if (dbError) {
    return (
      <div className="border border-accent bg-accent-soft p-5 text-sm leading-relaxed text-text-primary">
        <p className="font-semibold">Não foi possível carregar os produtos.</p>
        <p className="mt-1">
          {/does not exist|schema cache/i.test(dbError)
            ? "Rode a migration supabase/migrations/0001_catalogo.sql no SQL Editor do Supabase (docs/admin.md)."
            : `Detalhe técnico: ${dbError}`}
        </p>
      </div>
    )
  }

  return <ProductsTable products={products} initialFilter={filtro} />
}
