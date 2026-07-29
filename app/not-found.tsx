import Link from "next/link"
import { DiamondMark } from "@/components/Logo"

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-white px-5">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <DiamondMark className="h-8 w-8" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
            Erro 404
          </p>
          <h1 className="font-display mt-3 text-3xl font-medium text-black-soft sm:text-4xl">
            Esta página não existe mais.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-text-gray">
            A peça pode ter saído da vitrine ou o endereço mudou. O catálogo completo continua
            aberto.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/catalogo"
            className="inline-flex min-h-12 items-center rounded-full bg-black-soft px-7 text-sm font-semibold text-off-white transition-colors hover:bg-graphite"
          >
            Ver o catálogo
          </Link>
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
