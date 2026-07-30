import { fetchAllMovements } from "@/app/admin/estoque/actions"
import { MovementsBoard } from "@/components/admin/MovementsBoard"

export const dynamic = "force-dynamic"

/** Histórico global de movimentações de estoque (últimas 200). */
export default async function AdminMovimentacoesPage() {
  const result = await fetchAllMovements()

  if (!result.ok) {
    return (
      <div className="border border-accent bg-accent-soft p-5 text-sm leading-relaxed text-text-primary">
        <p className="font-semibold">Não foi possível carregar as movimentações.</p>
        <p className="mt-1">{result.error}</p>
      </div>
    )
  }

  return <MovementsBoard movements={result.movements} />
}
