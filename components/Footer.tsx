import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { siteConfig } from "@/data/site.config"
import { categories } from "@/data/categories"
import { faqItems } from "@/data/faq"
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

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Navegação",
    links: [
      { label: "Todas as peças", href: "/catalogo" },
      { label: "Novidades", href: "/catalogo?destaque=novidades" },
      { label: "Ofertas", href: "/catalogo?destaque=ofertas" },
      { label: "Marcas", href: "/#marcas" },
    ],
  },
  {
    title: "Categorias",
    links: categories.slice(0, 8).map((c) => ({
      label: c.label,
      href: `/catalogo?categoria=${c.id}`,
    })),
  },
  {
    title: "Atendimento",
    links: [
      { label: "Trocas e devoluções", href: "/politicas/trocas" },
      { label: "Política de privacidade", href: "/politicas/privacidade" },
      { label: siteConfig.instagramHandle, href: siteConfig.instagram, external: true },
    ],
  },
]

function LinkItem({ link }: { link: FooterLink }) {
  const className = "text-text-secondary transition-colors hover:text-accent-strong"
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

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-surface text-text-primary">
      <div className="shell flex flex-col gap-8 pt-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <Logo variant="dark" />
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            {siteConfig.tagline} Multimarcas originais, atendimento pelo WhatsApp e entrega para
            todo o Brasil.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <WhatsAppCta
            message={templates.atendimentoGeral()}
            event="hero_whatsapp_click"
            payload={{ placement: "footer" }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-text-primary px-6 text-sm font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent-strong"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </WhatsAppCta>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-text-primary px-6 text-sm font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent-strong"
          >
            <InstagramIcon className="h-4 w-4" />
            Instagram
          </a>
        </div>
      </div>

      {/* Colunas: accordions no mobile, colunas abertas no desktop */}
      <div className="shell py-8">
        <div className="flex flex-col divide-y divide-border border-y border-border sm:hidden">
          {columns.map((col) => (
            <details key={col.title} className="group py-1">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-strong [&::-webkit-details-marker]:hidden">
                {col.title}
                <span
                  aria-hidden="true"
                  className="text-lg font-normal text-text-secondary transition-transform group-open:rotate-45"
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
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-strong">
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
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-strong">
          Perguntas frequentes
        </h3>
        <div className="mt-4 divide-y divide-border border-y border-border">
          {faqItems.map((item) => (
            <details key={item.question} className="group py-1">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-text-primary [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="text-lg font-normal text-text-secondary transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-text-secondary">{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-xs text-text-secondary">
          Provar antes de decidir? Temos condicional para a região de Maringá, sujeito a análise e
          disponibilidade. Outra dúvida, chama no WhatsApp que a gente resolve.
        </p>
      </div>

      <div className="border-t border-border">
        <div className="shell flex flex-col items-start justify-between gap-2 py-5 text-xs text-text-secondary sm:flex-row sm:items-center">
          <p>
            {siteConfig.address} · {siteConfig.hours}
          </p>
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Vitrine digital — preços e
            disponibilidade confirmados no atendimento.
          </p>
        </div>
      </div>
    </footer>
  )
}
