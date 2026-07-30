import type { MetadataRoute } from "next"
import { siteConfig } from "@/data/site.config"
import { departments } from "@/data/departments"
import { showcaseBrandsFor } from "@/lib/catalog"
import { getCatalog } from "@/lib/products/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.metadata.url
  const products = await getCatalog().catch(() => [])
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    // /catalogo é a vitrine; todo o catálogo é masculino (sem rota de gênero).
    { url: `${base}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    ...["novidades", "ofertas"].map((path) => ({
      url: `${base}/${path}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    // Departamentos (subcategorias vivem em query string — não entram no sitemap).
    ...departments.map((d) => ({
      url: `${base}/catalogo/${d.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    // Marcas da vitrine — mesmo conjunto que gera as páginas de marca.
    ...showcaseBrandsFor(products).map((item) => ({
      url: `${base}/catalogo/marca/${item.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${base}/produto/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]
}
