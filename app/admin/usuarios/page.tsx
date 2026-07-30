import { createClient } from "@supabase/supabase-js"
import { supabaseServer } from "@/lib/supabase/server"
import { supabaseUrl } from "@/lib/supabase/env"
import { UsersBoard, type PanelUser } from "@/components/admin/UsersBoard"

export const dynamic = "force-dynamic"

// Lista os acessos do painel via API administrativa (service role, só servidor).
export default async function AdminUsuariosPage() {
  const supabase = await supabaseServer()
  const {
    data: { user: me },
  } = await supabase.auth.getUser()

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!serviceKey) {
    return (
      <div className="border border-accent bg-accent-soft p-5 text-sm leading-relaxed text-text-primary">
        <p className="font-semibold">Gestão de usuários indisponível.</p>
        <p className="mt-1">
          Configure <code className="bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code> no servidor
          (ver docs/admin.md). Enquanto isso, gerencie acessos pelo dashboard do Supabase.
        </p>
      </div>
    )
  }

  let users: PanelUser[] = []
  let dbError: string | null = null
  try {
    const admin = createClient(supabaseUrl(), serviceKey, {
      auth: { persistSession: false },
    }).auth.admin
    const { data, error } = await admin.listUsers({ perPage: 100 })
    if (error) throw new Error(error.message)
    users = data.users.map((u) => ({
      id: u.id,
      email: u.email ?? "(sem e-mail)",
      createdAt: u.created_at ?? null,
      lastSignInAt: u.last_sign_in_at ?? null,
    }))
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erro desconhecido."
  }

  if (dbError) {
    return (
      <div className="border border-accent bg-accent-soft p-5 text-sm leading-relaxed text-text-primary">
        <p className="font-semibold">Não foi possível listar os usuários.</p>
        <p className="mt-1">Detalhe técnico: {dbError}</p>
      </div>
    )
  }

  return <UsersBoard users={users} currentUserId={me?.id ?? ""} />
}
