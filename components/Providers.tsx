"use client"

import { useEffect, type ReactNode } from "react"
import { SelectionProvider } from "@/hooks/useSelection"
import { track } from "@/lib/tracking"

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    track("page_view")
  }, [])

  return <SelectionProvider>{children}</SelectionProvider>
}
