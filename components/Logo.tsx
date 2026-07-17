import { siteConfig } from "@/data/site.config"

// Placeholder substituível da marca — não redesenhar: símbolo do diamante + wordmark.
// variant: "dark" (sobre fundo claro), "light" (sobre foto/fundo escuro), "mono" (monocromático).
type LogoProps = {
  variant?: "dark" | "light" | "mono"
  withText?: boolean
  className?: string
}

export function DiamondMark({ className = "h-6 w-6", stroke = "#C2A15D" }: { className?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 32 28" fill="none" aria-hidden="true" className={className}>
      <path
        d="M8 2h16l6 8-14 16L2 10l6-8Z M2 10h28 M8 2l8 8 8-8 M16 10v16"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({ variant = "dark", withText = true, className = "" }: LogoProps) {
  const textColor =
    variant === "light" ? "text-off-white" : variant === "mono" ? "text-text-gray" : "text-black-soft"
  const stroke = variant === "mono" ? "#706D67" : "#C2A15D"

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <DiamondMark stroke={stroke} className="h-6 w-6 shrink-0" />
      {withText && (
        <span
          className={`font-sans text-sm font-semibold uppercase tracking-[0.32em] ${textColor}`}
        >
          {siteConfig.name}
        </span>
      )}
    </span>
  )
}
