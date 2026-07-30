"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, Loader2, Plus, Trash2, UserRound } from "lucide-react"
import { setUserPassword, createUser, deleteUser } from "@/app/admin/usuarios/actions"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

export type PanelUser = {
  id: string
  email: string
  createdAt: string | null
  lastSignInAt: string | null
}

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—"

// Acessos do painel: definir nova senha, criar e remover usuário.
// A troca da PRÓPRIA senha (sem precisar redigitar) continua em Configurações.
export function UsersBoard({
  users,
  currentUserId,
}: {
  users: PanelUser[]
  currentUserId: string
}) {
  const router = useRouter()
  const [pwFor, setPwFor] = useState<PanelUser | null>(null)
  const [pw, setPw] = useState("")
  const [creating, setCreating] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<PanelUser | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pwFor) return
    setBusy(true)
    setMsg(null)
    const result = await setUserPassword(pwFor.id, pw)
    setBusy(false)
    if (!result.ok) {
      setMsg({ ok: false, text: result.error })
      return
    }
    setMsg({ ok: true, text: `Senha de ${pwFor.email} alterada. Vale a partir do próximo login.` })
    setPwFor(null)
    setPw("")
  }

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const result = await createUser(newEmail, newPw)
    setBusy(false)
    if (!result.ok) {
      setMsg({ ok: false, text: result.error })
      return
    }
    setMsg({ ok: true, text: `Acesso criado para ${newEmail}.` })
    setCreating(false)
    setNewEmail("")
    setNewPw("")
    router.refresh()
  }

  const inputCls =
    "w-full border border-border bg-white px-3.5 py-3 text-sm text-text-primary focus:border-accent-strong focus:outline-none"
  const labelCls =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-text-primary"

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-medium text-text-primary">Usuários</h1>
        <button
          type="button"
          onClick={() => {
            setCreating((v) => !v)
            setMsg(null)
          }}
          className="flex items-center gap-2 bg-text-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo acesso
        </button>
      </div>
      <p className="mt-2 text-sm text-text-secondary">
        Quem pode entrar no painel. Para trocar a sua própria senha, use Configurações.
      </p>

      {msg && (
        <p
          role="alert"
          className={`mt-4 px-3 py-2.5 text-sm font-medium ${
            msg.ok ? "bg-bg-surface text-success" : "bg-accent-soft text-alert"
          }`}
        >
          {msg.text}
        </p>
      )}

      {creating && (
        <form onSubmit={submitCreate} className="mt-4 space-y-3 border border-border bg-bg-elevated p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
            Novo acesso
          </p>
          <div>
            <label htmlFor="nu-email" className={labelCls}>E-mail</label>
            <input
              id="nu-email"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="pessoa@email.com"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="nu-pw" className={labelCls}>Senha inicial</label>
            <input
              id="nu-pw"
              type="text"
              required
              minLength={8}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className={inputCls}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-surface"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-2 bg-text-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Criar acesso
            </button>
          </div>
        </form>
      )}

      <ul className="mt-5 flex flex-col gap-2">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 border border-border bg-bg-elevated p-4">
            <UserRound className="h-5 w-5 shrink-0 text-text-secondary" strokeWidth={1.6} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">
                {u.email}
                {u.id === currentUserId && (
                  <span className="ml-2 text-xs font-medium text-accent-strong">(você)</span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Criado em {fmtDate(u.createdAt)} · Último acesso {fmtDate(u.lastSignInAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setPwFor(u)
                  setPw("")
                  setMsg(null)
                }}
                className="flex items-center gap-1.5 border border-border bg-white px-3 py-2 text-text-primary hover:bg-bg-surface"
              >
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                Nova senha
              </button>
              {u.id !== currentUserId && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(u)}
                  className="flex items-center gap-1.5 border border-border bg-white px-3 py-2 text-alert hover:bg-bg-surface"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remover
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {pwFor && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-text-primary/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Nova senha para ${pwFor.email}`}
        >
          <form onSubmit={submitPassword} className="w-full max-w-sm border border-border bg-bg-elevated p-5">
            <h2 className="font-display text-2xl font-medium text-text-primary">Nova senha</h2>
            <p className="mt-1 truncate text-sm text-text-secondary">{pwFor.email}</p>
            <div className="mt-4">
              <label htmlFor="pw-nova" className={labelCls}>Senha</label>
              <input
                id="pw-nova"
                type="text"
                required
                minLength={8}
                autoFocus
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className={inputCls}
              />
              <p className="mt-1.5 text-xs text-text-secondary">
                A senha fica visível para você anotar e repassar com segurança.
              </p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPwFor(null)}
                disabled={busy}
                className="border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-surface"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex items-center gap-2 bg-text-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Salvar senha
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Remover acesso"
          message={`${confirmDelete.email} não vai mais conseguir entrar no painel. Os produtos cadastrados por essa pessoa continuam intactos.`}
          confirmLabel="Remover acesso"
          danger
          busy={busy}
          onConfirm={async () => {
            setBusy(true)
            const result = await deleteUser(confirmDelete.id)
            setBusy(false)
            if (!result.ok) {
              setMsg({ ok: false, text: result.error })
              setConfirmDelete(null)
              return
            }
            setMsg({ ok: true, text: `Acesso de ${confirmDelete.email} removido.` })
            setConfirmDelete(null)
            router.refresh()
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
