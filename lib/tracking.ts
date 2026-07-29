// Camada única de mensuração. Nenhum componente dispara pixel/gtag diretamente —
// tudo passa por track(), que respeita o consentimento LGPD do visitante.
//
// IDs em variáveis de ambiente (ver .env.example):
//   NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_GA4_ID, NEXT_PUBLIC_GTM_ID

export type TrackingEvent =
  | "page_view"
  | "view_catalog"
  | "search_product"
  | "apply_filter"
  | "select_category"
  | "view_product"
  | "select_size"
  | "select_color"
  | "add_to_selection"
  | "remove_from_selection"
  | "catalog_whatsapp_click"
  | "selection_whatsapp_click"
  | "product_whatsapp_click"
  | "hero_whatsapp_click"
  | "personalized_service_interest"
  | "look_interest"
  | "conditional_interest"
  | "instagram_click"
  | "location_click"
  | "faq_open"
  | "view_banner"
  | "click_banner"
  | "add_favorite"
  | "remove_favorite"
  | "share_product"
  | "notify_me_whatsapp_click"

export const CONSENT_KEY = "prgrife-consent"

type FbqFn = (...args: unknown[]) => void
type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    fbq?: FbqFn
    gtag?: GtagFn
    dataLayer?: unknown[]
  }
}

function hasConsent(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(CONSENT_KEY) === "accepted"
}

// Mapeamento para eventos padrão do Meta Pixel.
// Contact: todo clique que abre o WhatsApp. Lead: apenas intenção comercial real.
const metaEventMap: Partial<Record<TrackingEvent, string>> = {
  page_view: "PageView",
  view_product: "ViewContent",
  hero_whatsapp_click: "Contact",
  product_whatsapp_click: "Contact",
  catalog_whatsapp_click: "Contact",
  selection_whatsapp_click: "Lead",
  personalized_service_interest: "Contact",
  look_interest: "Contact",
  conditional_interest: "Contact",
  add_favorite: "AddToWishlist",
  notify_me_whatsapp_click: "Contact",
}

export function track(event: TrackingEvent, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return
  if (!hasConsent()) return

  // GTM / dataLayer
  window.dataLayer?.push({ event, ...payload })

  // GA4
  window.gtag?.("event", event, payload)

  // Meta Pixel
  const metaEvent = metaEventMap[event]
  if (metaEvent && window.fbq) {
    if (metaEvent === "PageView") window.fbq("track", "PageView")
    else window.fbq("track", metaEvent, payload)
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[tracking]", event, payload)
  }
}
