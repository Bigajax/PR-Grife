"use client"

import Link from "next/link"
import { DiamondMark } from "@/components/Logo"

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-white px-5">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <DiamondMark className="h-8 w-8" />
        <div>
          <h1 className="font-display text-3xl font-medium text-black-soft sm:text-4xl">
            Algo saiu do lugar.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-text-gray">
            Não foi possível carregar esta página agora. Tente novamente — se persistir, fale com a
            gente pelo WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center rounded-full bg-black-soft px-7 text-sm font-semibold text-off-white transition-colors hover:bg-graphite"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-full border border-black-soft px-7 text-sm font-semibold text-black-soft transition-colors hover:border-gold-dark hover:text-gold-dark"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  )
}
