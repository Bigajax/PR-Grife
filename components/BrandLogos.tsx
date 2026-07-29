// Renderiza o logo ORIGINAL de uma marca a partir de data/brands.ts.
// Sem logo cadastrado, mostra apenas o nome em texto — nunca um logo desenhado.
import { brandLogoAssets } from "@/data/brands"

export function BrandLogo({
  name,
  className = "h-16 w-auto",
  mono = false,
}: {
  name: string
  className?: string
  mono?: boolean
}) {
  const asset = brandLogoAssets[name]

  if (!asset) {
    return (
      <span className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-current">
        {name}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset}
      alt={name}
      className={`${className} object-contain ${
        mono ? "grayscale opacity-75 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100" : ""
      }`}
      // Sem loading="lazy": dentro do trilho animado da faixa o Safari não
      // dispara o carregamento e os logos ficam em branco. São arquivos
      // pequenos; carregar tudo de uma vez é mais barato que o bug.
      decoding="async"
    />
  )
}
