import { Reveal } from "@/components/Reveal"

// Cabeçalho editorial padrão: eyebrow à esquerda + linha dourada + título serifado.
// Alinhamento à esquerda por padrão — nada de título centrado com card-grid.
export function SectionHeading({
  eyebrow,
  title,
  text,
  dark = false,
}: {
  eyebrow: string
  title: string
  text?: string
  dark?: boolean
}) {
  return (
    <Reveal className="max-w-2xl">
      <p
        className={`flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] ${
          dark ? "text-gold" : "text-gold-dark"
        }`}
      >
        {eyebrow}
        <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
      </p>
      <h2
        className={`font-display mt-4 text-3xl font-medium leading-[1.12] sm:text-4xl lg:text-[2.75rem] ${
          dark ? "text-off-white" : "text-black-soft"
        }`}
      >
        {title}
      </h2>
      {text && (
        <p className={`mt-4 max-w-xl text-[15px] leading-relaxed ${dark ? "text-sand" : "text-text-gray"}`}>
          {text}
        </p>
      )}
    </Reveal>
  )
}
