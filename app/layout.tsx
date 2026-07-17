import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Manrope } from "next/font/google"
import "./globals.css"
import { siteConfig } from "@/data/site.config"
import { Providers } from "@/components/Providers"
import { TrackingScripts } from "@/components/TrackingScripts"
import { AnnouncementBar } from "@/components/AnnouncementBar"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp"
import { SelectionDrawer } from "@/components/SelectionDrawer"
import { ConsentBanner } from "@/components/ConsentBanner"

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
  themeColor: "#f8f6f1",
}

// Dados estruturados básicos — somente informações presentes no perfil público da loja.
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: siteConfig.name,
  description: siteConfig.metadata.description,
  url: siteConfig.metadata.url,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Avenida Tiradentes, 202", // TODO_CONFIRMAR
    addressLocality: "Maringá",
    addressRegion: "PR",
    addressCountry: "BR",
  },
  sameAs: [siteConfig.instagram],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <Providers>
          <AnnouncementBar />
          <Header />
          {children}
          <Footer />
          <FloatingWhatsApp />
          <SelectionDrawer />
          <ConsentBanner />
        </Providers>
        <TrackingScripts />
      </body>
    </html>
  )
}
