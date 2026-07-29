"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { track } from "@/lib/tracking"

const STORAGE_KEY = "prgrife-favoritos"

type FavoritesContextValue = {
  ids: string[]
  count: number
  has: (productId: string) => boolean
  toggle: (productId: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let stored: string[] | null = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) stored = JSON.parse(raw)
    } catch {
      // localStorage indisponível — favoritos vivem só na sessão
    }
    // Hidratação única a partir do localStorage (indisponível no SSR).
    /* eslint-disable react-hooks/set-state-in-effect */
    if (stored) setIds(stored)
    setHydrated(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // sem persistência
    }
  }, [ids, hydrated])

  const toggle = useCallback((productId: string) => {
    setIds((prev) => {
      if (prev.includes(productId)) {
        track("remove_favorite", { product_id: productId })
        return prev.filter((id) => id !== productId)
      }
      track("add_favorite", { product_id: productId })
      return [...prev, productId]
    })
  }, [])

  const has = useCallback((productId: string) => ids.includes(productId), [ids])

  const value = useMemo(
    () => ({ ids, count: ids.length, has, toggle }),
    [ids, has, toggle]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error("useFavorites deve ser usado dentro de FavoritesProvider")
  return ctx
}
