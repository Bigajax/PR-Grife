import { getAdminCatalog, type AdminProduct } from "@/lib/products/db"
import { supabaseServer } from "@/lib/supabase/server"
import { StockBoard } from "@/components/admin/StockBoard"

export const dynamic = "force-dynamic"

/** Movimentações desde a meia-noite (horário do servidor). */
async function countTodayMovements(): Promise<number | null> {
  try {
    const supabase = await supabaseServer()
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const { count, error } = await supabase
      .from("stock_movements")
      .select("id", { count: "exact", head: true })
      .gte("created_at", start.toISOString())
    if (error) throw new Error(error.message)
    // head:true não devolve erro de tabela ausente — chega como count nulo.
    // Nulo dispara o aviso da migration no board; tabela vazia conta 0.
    return count
  } catch {
    // Sem a migration 0002 a tabela não existe — o board mostra o aviso.
    return null
  }
}

export default async function AdminEstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ situacao?: string; q?: string }>
}) {
  const { situacao, q } = await searchParams
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
        <p className="font-semibold">Não foi possível carregar o estoque.</p>
        <p className="mt-1">
          {/does not exist|schema cache/i.test(dbError)
            ? "Rode as migrations supabase/migrations/0001_catalogo.sql e 0002_estoque.sql no SQL Editor do Supabase (docs/admin.md)."
            : `Detalhe técnico: ${dbError}`}
        </p>
      </div>
    )
  }

  const todayMovements = await countTodayMovements()

  return (
    <StockBoard
      products={products}
      todayMovements={todayMovements}
      initialSituation={situacao}
      initialQuery={q}
    />
  )
}
