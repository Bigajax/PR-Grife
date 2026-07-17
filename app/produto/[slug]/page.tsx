import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { products } from "@/data/products"
import { categoryLabel } from "@/data/categories"
import { relatedProducts } from "@/lib/catalog"
import { siteConfig } from "@/data/site.config"
import { Breadcrumb } from "@/components/Breadcrumb"
import { ProductCard } from "@/components/ProductCard"
import { ProductGallery } from "./ProductGallery"
import { ProductBuyBox } from "./ProductBuyBox"

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)
  if (!product) return {}
  return {
    title: `${product.name} — ${product.brand} | ${siteConfig.name}`,
    description: product.shortDescription,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      title: `${product.name} — ${product.brand}`,
      description: product.shortDescription,
      url: `/produto/${product.slug}`,
      images: [{ url: product.thumbnail }],
    },
  }
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)
  if (!product) notFound()

  const related = relatedProducts(product)
  const category = categoryLabel(product.category)

  // Dados estruturados do produto — sem afirmar preço/estoque como definitivos.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    sku: product.productCode,
    category,
    image: product.images,
    description: product.shortDescription,
  }

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Início", href: "/" },
            { label: "Catálogo", href: "/catalogo" },
            { label: category, href: `/catalogo/${product.category}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-8 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-12">
        <ProductGallery product={product} />
        <ProductBuyBox product={product} />
      </div>

      {related.length > 0 && (
        <section className="border-t border-border-gray bg-off-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
            <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
              Combina com
              <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
            </p>
            <h2 className="font-display mt-3 text-3xl font-medium text-black-soft">Você também pode gostar</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
