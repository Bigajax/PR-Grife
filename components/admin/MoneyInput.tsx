"use client"

/**
 * Input de dinheiro com máscara brasileira: os dígitos digitados são os
 * centavos ("34990" → "349,90"). Entrega `number | null` ao pai.
 */
export function MoneyInput({
  id,
  value,
  onChange,
  placeholder = "0,00",
  className = "",
  disabled,
}: {
  id?: string
  value: number | null
  onChange: (value: number | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}) {
  const display =
    value === null
      ? ""
      : value.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })

  const handle = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 9)
    if (!digits) {
      onChange(null)
      return
    }
    onChange(Number(digits) / 100)
  }

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
        R$
      </span>
      <input
        id={id}
        inputMode="numeric"
        value={display}
        onChange={(e) => handle(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-border bg-white py-2.5 pl-9 pr-3 text-sm tabular-nums text-text-primary focus:border-accent-strong focus:outline-none disabled:bg-bg-surface"
      />
    </div>
  )
}
