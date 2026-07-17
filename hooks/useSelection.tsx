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
import type { SelectionItem } from "@/types"
import { track } from "@/lib/tracking"

const STORAGE_KEY = "prgrife-selecao"

type SelectionContextValue = {
  items: SelectionItem[]
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  add: (productId: string, size?: string, color?: string) => void
  remove: (productId: string) => void
  update: (productId: string, patch: Partial<Omit<SelectionItem, "productId">>) => void
  has: (productId: string) => boolean
}

const SelectionContext = createContext<SelectionContextValue | null>(null)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SelectionItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let stored: SelectionItem[] | null = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) stored = JSON.parse(raw)
    } catch {
      // localStorage indisponível — seleção vive só na sessão
    }
    // Hidratação única a partir do localStorage (indisponível no SSR).
    /* eslint-disable react-hooks/set-state-in-effect */
    if (stored) setItems(stored)
    setHydrated(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // sem persistência
    }
  }, [items, hydrated])

  const add = useCallback((productId: string, size?: string, color?: string) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === productId)) {
        return prev.map((i) => (i.productId === productId ? { ...i, size: size ?? i.size, color: color ?? i.color } : i))
      }
      track("add_to_selection", { product_id: productId })
      return [...prev, { productId, size, color }]
    })
  }, [])

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const update = useCallback(
    (productId: string, patch: Partial<Omit<SelectionItem, "productId">>) => {
      setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, ...patch } : i)))
    },
    []
  )

  const has = useCallback((productId: string) => items.some((i) => i.productId === productId), [items])

  const value = useMemo(
    () => ({
      items,
      isOpen,
      openDrawer: () => setIsOpen(true),
      closeDrawer: () => setIsOpen(false),
      add,
      remove,
      update,
      has,
    }),
    [items, isOpen, add, remove, update, has]
  )

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error("useSelection deve ser usado dentro de SelectionProvider")
  return ctx
}
