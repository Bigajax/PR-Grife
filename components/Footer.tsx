import Link from "next/link"
import { MessageCircle } from "lucide-react"
import type { Product } from "@/types"
import { siteConfig } from "@/data/site.config"
import { faqItems } from "@/data/faq"
import { categoriesWithProducts, categoryHref } from "@/lib/catalog"
import { templates } from "@/lib/whatsapp"
import { Logo } from "@/components/Logo"
import { WhatsAppCta } from "@/components/WhatsAppCta"

type FooterLink = { label: string; href: string; external?: boolean }

// lucide-react não distribui ícones de marca — mesmo desenho usado no header.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

// As colunas dependem do catálogo (categorias com produto), então são montadas
// dentro do componente — o layout passa a lista buscada no servidor.
function buildColumns(products: Product[]): { title: string; links: FooterLink[] }[] {
  return [
    {
      title: "Navegação",
      links: [
        { label: "Todas as peças", href: "/catalogo" },
        { label: "Novidades", href: "/novidades" },
        { label: "Ofertas", href: "/ofertas" },
        { label: "Marcas", href: "/#marcas" },
        { label: "Loja física", href: "/loja-fisica" },
      ],
    },
    {
      title: "Categorias",
      // Só categoria com produto — link de rodapé para vitrine vazia é beco
      // sem saída. URLs pela fonte única categoryHref (departamento + query).
      links: categoriesWithProducts(products)
        .slice(0, 8)
        .map((c) => ({
          label: c.label,
          href: categoryHref(c.id),
        })),
    },
    {
      title: "Atendimento",
      links: [
        { label: "Como chegar", href: siteConfig.directionsUrl, external: true },
        { label: "Perguntas frequentes", href: "/#faq" },
        { label: "Trocas e devoluções", href: "/politicas/trocas" },
        { label: "Política de privacidade", href: "/politicas/privacidade" },
        { label: siteConfig.instagramHandle, href: siteConfig.instagram, external: true },
      ],
    },
  ]
}

function LinkItem({ link }: { link: FooterLink }) {
  const className = "text-noir-muted transition-colors hover:text-accent"
  return link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  )
}

export function Footer({ products }: { products: Product[] }) {
  const columns = buildColumns(products)
  return (
    <footer className="bg-noir text-bg-base">
      <div className="shell flex flex-col gap-8 pt-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          {/* "light" é a variante de fundo escuro. Com o rodapé em preto, a
              antiga ("dark", de tinta escura para fundo claro) sumia. */}
          <Logo variant="light" />
          <p className="mt-4 text-sm leading-relaxed text-noir-muted">
            {siteConfig.tagline} Multimarcas originais, atendimento pelo WhatsApp e entrega para
            todo o Brasil.
          </p>

          {/* Endereço, horário e telefone subiram da barra de baixo para cá.
              Lá embaixo dividiam uma linha de 12px com o aviso de copyright,
              e é justamente a informação que faz um rodapé de loja ter sentido
              — quem chega no fim da página quer saber onde a loja fica. De
              quebra, preenchem o vazio que a coluna deixava no fundo preto. */}
          <address className="mt-6 flex flex-col gap-1 text-sm not-italic leading-relaxed text-noir-muted">
            <span>{siteConfig.address}</span>
            <span>{siteConfig.hours}</span>
            <a
              href={`tel:${siteConfig.phoneE164}`}
              aria-label={`Ligar para ${siteConfig.phoneDisplay}`}
              className="w-fit text-bg-base transition-colors hover:text-accent-on-dark"
            >
              {siteConfig.phoneDisplay}
            </a>
          </address>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <WhatsAppCta
            message={templates.atendimentoGeral()}
            event="hero_whatsapp_click"
            payload={{ placement: "footer" }}
            className="tap inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-bg-base px-6 text-sm font-semibold text-bg-base hover:border-accent hover:text-accent"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </WhatsAppCta>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="tap inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-bg-base px-6 text-sm font-semibold text-bg-base hover:border-accent hover:text-accent"
          >
            <InstagramIcon className="h-4 w-4" />
            Instagram
          </a>
        </div>
      </div>

      {/* Colunas: accordions no mobile, colunas abertas no desktop */}
      <div className="shell py-8">
        <div className="flex flex-col divide-y divide-white/12 border-y border-white/12 sm:hidden">
          {columns.map((col) => (
            <details key={col.title} className="group py-1">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-on-dark [&::-webkit-details-marker]:hidden">
                {col.title}
                <span
                  aria-hidden="true"
                  className="text-lg font-normal text-noir-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <ul className="space-y-2.5 pb-4 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <LinkItem link={link} />
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <div className="hidden grid-cols-3 gap-10 sm:grid">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-on-dark">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <LinkItem link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Perguntas frequentes — accordion nativo, sem JavaScript. */}
      <div id="faq" className="shell scroll-mt-20 pb-8">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-on-dark">
          Perguntas frequentes
        </h3>
        <div className="mt-4 divide-y divide-white/12 border-y border-white/12">
          {faqItems.map((item) => (
            <details key={item.question} className="group py-1">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-bg-base [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="text-lg font-normal text-noir-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-noir-muted">{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-xs text-noir-muted">
          Provar antes de decidir? Temos condicional para a região de Maringá, sujeito a análise e
          disponibilidade. Outra dúvida, chama no WhatsApp que a gente resolve.
        </p>
      </div>

      <div className="border-t border-white/12">
        {/* Barra de baixo agora tem UM assunto só: o aviso legal. Antes ela
            empilhava endereço, horário, telefone e copyright na mesma linha
            de 12px — quatro coisas disputando a mesma tipografia. */}
        <div className="shell flex flex-col items-start justify-between gap-2 py-5 text-xs text-noir-muted sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Vitrine digital — preços e
            disponibilidade confirmados no atendimento.
          </p>
        </div>
      </div>
    </footer>
  )
}
