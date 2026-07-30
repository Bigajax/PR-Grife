"use client"

import { useState } from "react"
import { KeyRound, Loader2 } from "lucide-react"
import { supabaseBrowser } from "@/lib/supabase/client"

/**
 * Troca de senha do próprio administrador (Supabase Auth `updateUser`).
 * Usa a sessão já ativa — não pede a senha atual. A sessão continua válida
 * após a troca; a nova senha vale a partir do próximo login.
 */
export function ChangePassword() {
  const [pw, setPw] = useState("")
  const [pw2, setPw2] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    if (pw.length < 8) {
      setMsg({ ok: false, text: "A nova senha precisa ter pelo menos 8 caracteres." })
      return
    }
    if (pw !== pw2) {
      setMsg({ ok: false, text: "As senhas não coincidem." })
      return
    }
    setLoading(true)
    const { error } = await supabaseBrowser().auth.updateUser({ password: pw })
    setLoading(false)
    if (error) {
      setMsg({ ok: false, text: `Não foi possível alterar agora (${error.message}).` })
      return
    }
    setPw("")
    setPw2("")
    setMsg({ ok: true, text: "Senha alterada com sucesso! Use a nova senha no próximo login." })
  }

  const inputCls =
    "w-full border border-border bg-white px-3.5 py-3 text-sm text-text-primary transition-colors focus:border-accent-strong focus:outline-none"

  return (
    <form onSubmit={submit} className="mt-4 max-w-md space-y-3">
      <div>
        <label
          htmlFor="nova-senha"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-text-primary"
        >
          Nova senha
        </label>
        <input
          id="nova-senha"
          type={show ? "text" : "password"}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          className={inputCls}
        />
      </div>
      <div>
        <label
          htmlFor="conf-senha"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-text-primary"
        >
          Confirmar nova senha
        </label>
        <input
          id="conf-senha"
          type={show ? "text" : "password"}
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          autoComplete="new-password"
          placeholder="Repita a nova senha"
          className={inputCls}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
          className="h-4 w-4 accent-accent-strong"
        />
        Mostrar senha
      </label>

      {msg && (
        <p
          role="alert"
          className={`px-3 py-2.5 text-sm font-medium ${
            msg.ok ? "bg-bg-surface text-success" : "bg-accent-soft text-alert"
          }`}
        >
          {msg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-text-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <KeyRound className="h-4 w-4" aria-hidden="true" />
        )}
        {loading ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  )
}
