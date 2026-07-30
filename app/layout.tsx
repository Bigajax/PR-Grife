import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Manrope } from "next/font/google"
import "./globals.css"
import { siteConfig } from "@/data/site.config"
import { getCatalog } from "@/lib/products/db"
import { CatalogProvider } from "@/components/CatalogProvider"
import { Providers } from "@/components/Providers"
import { TrackingScripts } from "@/components/TrackingScripts"
import { AnnouncementBar } from "@/components/AnnouncementBar"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp"
import { SelectionDrawer } from "@/components/SelectionDrawer"
import { SiteLoader } from "@/components/SiteLoader"
import { SiteChrome } from "@/components/SiteChrome"

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
})

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.metadata.url),
  title: siteConfig.metadata.title,
  description: siteConfig.metadata.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.metadata.title,
    description: siteConfig.metadata.description,
    url: "/",
    siteName: siteConfig.name,
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 941, height: 1672 }],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#f8f4e9",
}

// Dados estruturados oficiais da loja. Sem postalCode nem geo de propósito —
// CEP e coordenadas não foram confirmados pelo proprietário.
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: siteConfig.name,
  description: siteConfig.metadata.description,
  url: siteConfig.metadata.url,
  telephone: siteConfig.phoneE164,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Avenida Tiradentes, 202",
    addressLocality: "Maringá",
    addressRegion: "PR",
    addressCountry: "BR",
  },
  hasMap: siteConfig.mapsUrl,
  openingHoursSpecification: siteConfig.hoursDetailed.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.schemaDays,
    opens: h.opens,
    closes: h.closes,
  })),
  sameAs: [siteConfig.instagram],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Busca única do catálogo por request (cacheada com a tag "products").
  // O CatalogProvider distribui para os client components; server components
  // chamam getCatalog() direto.
  const products = await getCatalog().catch(() => [])
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* SiteChrome esconde o chrome do site nas rotas /admin — o painel
            tem o próprio layout e não usa loader, header, faixas nem véu. */}
        <SiteChrome>
          <SiteLoader />
          {/* Marfim texturizado com sombra botânica — ver .veu-botanico no globals.css */}
          <div className="veu-botanico" aria-hidden="true" />
        </SiteChrome>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <CatalogProvider products={products}>
          <Providers>
            <SiteChrome>
              <AnnouncementBar />
              <Header />
            </SiteChrome>
            {children}
            <SiteChrome>
              <Footer products={products} />
              <FloatingWhatsApp />
              <SelectionDrawer />
            </SiteChrome>
          </Providers>
        </CatalogProvider>
        <TrackingScripts />
      </body>
    </html>
  )
}
