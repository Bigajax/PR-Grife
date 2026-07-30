"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { templates } from "@/lib/whatsapp"
import { useSelection } from "@/hooks/useSelection"

// Botão flutuante mobile, presente no site inteiro exceto onde cobriria um CTA
// fixo próprio (página de produto) ou não faz sentido (/admin). Aparece após
// pequena rolagem, respeita safe area, some com o teclado ou com a seleção aberta.
export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const { isOpen } = useSelection()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const onResize = () => setKeyboardOpen(vv.height < window.innerHeight * 0.75)
    vv.addEventListener("resize", onResize)
    return () => vv.removeEventListener("resize", onResize)
  }, [])

  // /produto e /catalogo têm barras fixas próprias no rodapé (o botão cobriria
  // os controles); /admin tem o próprio chrome. Nas demais rotas ele aparece.
  const oculto =
    pathname.startsWith("/produto") ||
    pathname.startsWith("/catalogo") ||
    pathname.startsWith("/admin")
  if (oculto || !visible || keyboardOpen || isOpen) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[calc(0.9rem+env(safe-area-inset-bottom))] md:hidden">
      <WhatsAppCta
        message={templates.informacoesProdutos()}
        event="hero_whatsapp_click"
        payload={{ placement: "floating_mobile" }}
        className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-text-primary px-7 text-sm font-semibold text-white shadow-lg shadow-text-primary/25"
      >
        <MessageCircle className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
        Falar com a PR Grife
      </WhatsAppCta>
    </div>
  )
}
