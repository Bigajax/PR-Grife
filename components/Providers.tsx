"use client"

import { useEffect, type ReactNode } from "react"
import { SelectionProvider } from "@/hooks/useSelection"
import { FavoritesProvider } from "@/hooks/useFavorites"
import { track } from "@/lib/tracking"

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    track("page_view")
  }, [])

  return (
    <FavoritesProvider>
      <SelectionProvider>{children}</SelectionProvider>
    </FavoritesProvider>
  )
}
