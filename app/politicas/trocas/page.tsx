import type { Metadata } from "next"
import Link from "next/link"
import { siteConfig } from "@/data/site.config"

const { exchangePolicy } = siteConfig

export const metadata: Metadata = {
  title: `Trocas e devoluções | ${siteConfig.name}`,
  description: `${exchangePolicy.paragraphs[0]} Fale com a ${siteConfig.name} pelo WhatsApp para orientações sobre a sua compra.`,
  alternates: { canonical: "/politicas/trocas" },
}

// Política oficial de trocas — a copy vive em site.config.exchangePolicy e é a
// mesma exibida na seção de trocas da página /loja-fisica.
export default function TrocasPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-strong">
        Políticas
      </p>
      <h1 className="font-display mt-4 text-4xl font-medium text-text-primary">
        Trocas e devoluções
      </h1>
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-text-secondary">
        {exchangePolicy.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="text-xs text-text-secondary/80">{exchangePolicy.note}</p>
      </div>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/loja-fisica"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-text-primary underline underline-offset-4 transition-colors hover:text-accent-strong"
        >
          Conhecer a loja física
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-text-primary underline underline-offset-4 transition-colors hover:text-accent-strong"
        >
          Voltar para a vitrine
        </Link>
      </div>
    </main>
  )
}
