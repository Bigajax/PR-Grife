"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { templates } from "@/lib/whatsapp"
import { useSelection } from "@/hooks/useSelection"

// Botão flutuante mobile (só na home — no catálogo há a barra fixa e o produto tem CTA próprio).
// Aparece após pequena rolagem, respeita safe area, some com o teclado ou com a seleção aberta.
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

  if (pathname !== "/" || !visible || keyboardOpen || isOpen) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[calc(0.9rem+env(safe-area-inset-bottom))] md:hidden">
      <WhatsAppCta
        message={templates.atendimentoGeral()}
        event="hero_whatsapp_click"
        payload={{ placement: "floating_mobile" }}
        className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-black-soft px-7 text-sm font-semibold text-off-white shadow-lg shadow-black-soft/25"
      >
        <MessageCircle className="h-4.5 w-4.5 text-gold" aria-hidden="true" />
        Falar com a PR Grife
      </WhatsAppCta>
    </div>
  )
}
