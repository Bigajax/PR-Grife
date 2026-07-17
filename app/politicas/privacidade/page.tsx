import type { Metadata } from "next"
import Link from "next/link"
import { siteConfig } from "@/data/site.config"

export const metadata: Metadata = {
  title: `Privacidade | ${siteConfig.name}`,
  robots: { index: false }, // página placeholder — não indexar até o texto oficial
}

// PLACEHOLDER — não publicar como definitivo. TODO_CONFIRMAR: política oficial de privacidade.
export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">Políticas</p>
      <h1 className="font-display mt-4 text-4xl font-medium text-black-soft">Privacidade</h1>
      <div className="mt-8 border border-dashed border-sand bg-white p-6 text-sm leading-relaxed text-text-gray">
        <p className="font-semibold text-black-soft">Página em preparação.</p>
        <p className="mt-2">
          A política de privacidade da {siteConfig.name} será publicada aqui após aprovação do
          proprietário. Em resumo: usamos cookies apenas para medir o desempenho da vitrine, e você
          pode recusar no banner de consentimento.
        </p>
      </div>
      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-gold-dark underline-offset-4 hover:underline">
        ← Voltar para a vitrine
      </Link>
    </main>
  )
}
