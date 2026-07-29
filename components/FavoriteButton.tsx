"use client"

import { Heart } from "lucide-react"
import { useFavorites } from "@/hooks/useFavorites"

type Props = {
  productId: string
  productName: string
  className?: string
}

// Botão de favorito com feedback instantâneo (localStorage, sem login).
export function FavoriteButton({ productId, productName, className }: Props) {
  const { has, toggle } = useFavorites()
  const active = has(productId)

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={active}
      aria-label={
        active
          ? `Remover ${productName} dos favoritos`
          : `Salvar ${productName} nos favoritos`
      }
      className={`inline-flex h-11 w-11 items-center justify-center transition-colors ${
        active ? "text-gold" : "text-black-soft hover:text-gold-dark"
      } ${className ?? ""}`}
    >
      <Heart
        aria-hidden
        className="h-[18px] w-[18px]"
        fill={active ? "currentColor" : "none"}
        strokeWidth={1.6}
      />
    </button>
  )
}
