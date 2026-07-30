"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock } from "lucide-react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"
import { DiamondMark } from "@/components/Logo"

/** Login do painel — usuário criado manualmente no dashboard do Supabase. */
export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const configured = supabaseConfigured()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = supabaseBrowser(remember)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (signInError) {
      setLoading(false)
      setError(
        signInError.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : signInError.message === "Email not confirmed"
            ? "E-mail ainda não confirmado — fale com o responsável técnico."
            : `Não foi possível entrar agora (${signInError.message}). Verifique a conexão e tente de novo.`
      )
      return
    }
    router.replace("/admin")
    router.refresh()
  }

  const inputCls =
    "w-full border border-border bg-white px-3.5 py-3 text-sm text-text-primary transition-colors focus:border-accent-strong focus:outline-none"

  return (
    <section className="flex min-h-screen items-center justify-center bg-text-primary px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <DiamondMark className="h-12 w-12" />
          <h1 className="font-display mt-4 text-center text-3xl font-medium text-off-white">
            Painel da loja
          </h1>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-sand">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Acesso restrito
          </p>
        </div>

        {!configured ? (
          <div className="mt-8 border border-border bg-bg-elevated p-6 text-sm leading-relaxed text-text-secondary">
            O Supabase ainda não está configurado neste ambiente. Copie
            <code className="mx-1 bg-bg-surface px-1">.env.example</code>
            para <code className="mx-1 bg-bg-surface px-1">.env.local</code> e siga o passo a
            passo de <code className="mx-1 bg-bg-surface px-1">docs/admin.md</code>.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4 border border-border bg-bg-elevated p-6 sm:p-8">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-text-primary"
              >
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label
                htmlFor="login-senha"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-text-primary"
              >
                Senha
              </label>
              <input
                id="login-senha"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 accent-accent-strong"
              />
              Manter conectado neste dispositivo
            </label>

            {error && (
              <p role="alert" className="bg-accent-soft px-3 py-2.5 text-sm font-medium text-alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-text-primary px-4 py-3.5 text-center text-[13px] font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar no painel"}
            </button>

            <p className="text-center text-xs leading-relaxed text-text-secondary">
              Esqueceu a senha? Fale com o responsável técnico para redefinir o seu acesso.
            </p>
          </form>
        )}

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-sand transition-colors hover:text-off-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar ao site
        </Link>
      </div>
    </section>
  )
}
