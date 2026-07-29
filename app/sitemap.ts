import type { MetadataRoute } from "next"
import { siteConfig } from "@/data/site.config"
import { categories } from "@/data/categories"
import { products } from "@/data/products"
import { brandSlug } from "@/lib/catalog"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.metadata.url
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    // /catalogo é a vitrine; /feminino saiu (nenhum SKU feminino cadastrado).
    { url: `${base}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    ...["masculino", "novidades", "ofertas"].map((path) => ({
      url: `${base}/${path}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...siteConfig.brands.map((b) => ({
      url: `${base}/marca/${brandSlug(b)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...categories.map((c) => ({
      url: `${base}/catalogo/${c.id}`,
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
