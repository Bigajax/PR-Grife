import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { products as staticProducts } from "@/data/products"
import { categoryLabel } from "@/data/categories"
import { categoryHref, relatedProducts } from "@/lib/catalog"
import { getCatalog, getProduct } from "@/lib/products/db"
import { siteConfig } from "@/data/site.config"
import { Breadcrumb } from "@/components/Breadcrumb"
import { ProductCard } from "@/components/ProductCard"
import { ProductGallery } from "./ProductGallery"
import { ProductBuyBox } from "./ProductBuyBox"

// Pré-gera as páginas do catálogo estático; produto criado no painel depois
// do deploy renderiza sob demanda (dynamicParams) e entra no cache por tag.
export const dynamicParams = true

export function generateStaticParams() {
  return staticProducts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
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
  const catalog = await getCatalog()
  const product = catalog.find((p) => p.slug === slug)
  if (!product) notFound()

  const related = relatedProducts(catalog, product)
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
    // pb no mobile reserva espaço para o CTA fixo do WhatsApp.
    <main className="bg-white pb-24 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Início", href: "/" },
            { label: "Catálogo", href: "/catalogo" },
            { label: category, href: categoryHref(product.category) },
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
            {/* Grade espaçada, igual à do catálogo. Antes era grade de fio de
                cabelo (gap-px sobre fundo na cor da borda, para os vãos de 1px
                virarem linhas divisórias): funcionava quando o card tinha fundo
                branco e a foto vinha encolhida com respiro interno. Com a foto
                preenchendo o card, as imagens encostavam a 1px e a fileira
                inteira virava uma faixa contínua, com cara de recorte colado. */}
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
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
