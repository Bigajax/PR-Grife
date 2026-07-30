"use client"

import { usePathname } from "next/navigation"

// O painel (/admin) vive dentro do layout raiz, mas não deve herdar o chrome
// do site — faixa de anúncio, header, rodapé, véu botânico, WhatsApp. Este
// wrapper esconde esses blocos nas rotas do painel. usePathname resolve já no
// servidor, então não há flash do header antes da hidratação.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith("/admin")) return null
  return <>{children}</>
}
