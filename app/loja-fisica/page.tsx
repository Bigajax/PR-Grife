import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  Banknote,
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
} from "lucide-react"
import { siteConfig } from "@/data/site.config"
import { templates } from "@/lib/whatsapp"
import { Breadcrumb } from "@/components/Breadcrumb"
import { Reveal } from "@/components/Reveal"
import { SectionHeading } from "@/components/SectionHeading"
import { WhatsAppCta } from "@/components/WhatsAppCta"
import { TrackedMapLink } from "./TrackedMapLink"

const { storePage, exchangePolicy } = siteConfig

// lucide-react não distribui ícones de marca — mesmo desenho usado no footer.
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

export const metadata: Metadata = {
  title: storePage.metaTitle,
  description: storePage.metaDescription,
  alternates: { canonical: "/loja-fisica" },
}

// Botões padrão da casa (mesmo desenho do hero da home): primário sólido e
// secundário outline, sempre com área de toque >= 48px.
const btnPrimario =
  "inline-flex min-h-12 items-center justify-center bg-text-primary px-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90"
const btnSecundario =
  "inline-flex min-h-12 items-center justify-center border border-text-primary px-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-text-primary transition-colors hover:bg-text-primary hover:text-white"

// Item da lista de informações do hero: ícone dourado + rótulo + linhas.
function InfoItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin
  label: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-strong" strokeWidth={1.6} aria-hidden="true" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-strong">
          {label}
        </p>
        <div className="mt-1 text-sm leading-relaxed text-text-secondary">{children}</div>
      </div>
    </li>
  )
}

export default function LojaFisicaPage() {
  return (
    <main className="bg-bg-base">
      {/* ── Hero: texto e contatos à esquerda, fotos reais da loja à direita ── */}
      <div className="shell pb-16 pt-8 lg:pb-24">
        <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Loja física" }]} />

        <div className="mt-6 grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-strong">
              {storePage.eyebrow}
              <span className="hairline-gold w-16 shrink-0" aria-hidden="true" />
            </p>
            <h1 className="font-display mt-3 text-4xl font-medium uppercase leading-[1.08] tracking-[0.04em] text-text-primary sm:text-5xl">
              {storePage.title}{" "}
              <span className="text-accent-strong">{storePage.highlight}</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-secondary">
              {storePage.description}
            </p>

            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              <InfoItem icon={MapPin} label="Endereço">
                <a
                  href={siteConfig.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent-strong"
                >
                  {siteConfig.address}
                </a>
              </InfoItem>
              <InfoItem icon={Clock} label="Horário">
                {siteConfig.hoursDetailed.map((h) => (
                  <p key={h.label}>
                    {h.label}, {h.display}
                  </p>
                ))}
              </InfoItem>
              <InfoItem icon={MessageCircle} label="WhatsApp">
                <a href={`tel:${siteConfig.phoneE164}`} className="transition-colors hover:text-accent-strong">
                  {siteConfig.phoneDisplay}
                </a>
              </InfoItem>
              <InfoItem icon={CreditCard} label="Pagamento">
                {siteConfig.paymentText}
              </InfoItem>
            </ul>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <TrackedMapLink
                href={siteConfig.directionsUrl}
                placement="loja_fisica_hero"
                ariaLabel="Abrir a rota até a loja no Google Maps"
                className={btnPrimario}
              >
                Como chegar
              </TrackedMapLink>
              <WhatsAppCta
                message={templates.lojaFisica()}
                event="hero_whatsapp_click"
                payload={{ placement: "loja_fisica_hero" }}
                ariaLabel="Conversar com a loja pelo WhatsApp"
                className={btnSecundario}
              >
                Falar com a loja
              </WhatsAppCta>
            </div>
          </Reveal>

          {/* Composição: foto principal do interior + entrada sobreposta menor.
              A borda da foto menor é da cor do fundo — recorte limpo, sem card. */}
          <Reveal className="relative mx-auto w-full max-w-md pb-10 lg:max-w-none">
            <div className="relative ml-0 aspect-[3/4] w-[74%] overflow-hidden rounded-2xl bg-bg-elevated shadow-[0_24px_48px_-24px_rgba(28,28,26,0.35)]">
              <Image
                src={storePage.images.main.src}
                alt={storePage.images.main.alt}
                fill
                sizes="(min-width: 1024px) 34vw, 70vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-0 right-0 aspect-[3/4] w-[44%] overflow-hidden rounded-2xl border-4 border-bg-base bg-bg-elevated shadow-[0_24px_48px_-24px_rgba(28,28,26,0.45)]">
              <Image
                src={storePage.images.secondary.src}
                alt={storePage.images.secondary.alt}
                fill
                sizes="(min-width: 1024px) 20vw, 42vw"
                className="object-cover"
              />
            </div>
            <span className="absolute left-3 top-3 rounded-full bg-bg-elevated/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-strong">
              {storePage.badge}
            </span>
          </Reveal>
        </div>
      </div>

      {/* ── Mapa interativo ── */}
      <section className="bg-bg-surface py-14 lg:py-20" aria-label="Localização e mapa">
        <div className="shell">
          <SectionHeading
            eyebrow="Como chegar"
            title={storePage.mapTitle}
            text={storePage.mapText}
          />
          <Reveal className="mt-8">
            <div className="overflow-hidden rounded-2xl border border-border bg-bg-elevated">
              <iframe
                src={siteConfig.mapsEmbedUrl}
                title="Mapa com a localização da PR Grife na Avenida Tiradentes, 202, em Maringá"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[300px] w-full border-0 sm:h-[420px]"
              />
            </div>
            <TrackedMapLink
              href={siteConfig.mapsUrl}
              placement="loja_fisica_mapa"
              ariaLabel="Abrir a localização da loja no Google Maps"
              className={`mt-6 ${btnSecundario}`}
            >
              Abrir no Google Maps
            </TrackedMapLink>
          </Reveal>
        </div>
      </section>

      {/* ── Cards informativos ── */}
      <section className="bg-bg-base py-14 lg:py-20" aria-label="Informações da loja">
        <div className="shell grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Endereço */}
          <Reveal className="flex flex-col rounded-2xl border border-border bg-bg-elevated p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-strong">
              Endereço
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Avenida Tiradentes, 202
              <br />
              Maringá — Paraná
            </p>
            <TrackedMapLink
              href={siteConfig.directionsUrl}
              placement="loja_fisica_card"
              ariaLabel="Traçar rota até a loja no Google Maps"
              className="mt-auto inline-flex min-h-11 items-center pt-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-text-primary underline underline-offset-4 transition-colors hover:text-accent-strong"
            >
              Traçar rota
            </TrackedMapLink>
          </Reveal>

          {/* Atendimento */}
          <Reveal delay={80} className="rounded-2xl border border-border bg-bg-elevated p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-strong">
              Atendimento
            </h3>
            <ul className="mt-3 space-y-1 text-sm leading-relaxed text-text-secondary">
              {siteConfig.hoursDetailed.map((h) => (
                <li key={h.label}>
                  {h.label}: {h.display.replace("das ", "")}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Pagamento */}
          <Reveal delay={160} className="rounded-2xl border border-border bg-bg-elevated p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-strong">
              Pagamento
            </h3>
            <ul className="mt-3 space-y-1 text-sm leading-relaxed text-text-secondary">
              <li>Dinheiro</li>
              <li>Pix</li>
              <li>Cartão em até 6x sem juros</li>
            </ul>
          </Reveal>

          {/* Fale com a loja */}
          <Reveal delay={240} className="rounded-2xl border border-border bg-bg-elevated p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-strong">
              Fale com a loja
            </h3>
            <ul className="mt-3 space-y-1 text-sm text-text-secondary">
              <li>
                <a
                  href={`tel:${siteConfig.phoneE164}`}
                  aria-label={`Ligar para ${siteConfig.phoneDisplay}`}
                  className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-accent-strong"
                >
                  <Phone className="h-4 w-4 text-accent-strong" strokeWidth={1.6} aria-hidden="true" />
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <WhatsAppCta
                  message={templates.lojaFisica()}
                  event="hero_whatsapp_click"
                  payload={{ placement: "loja_fisica_card" }}
                  ariaLabel="Conversar com a loja pelo WhatsApp"
                  className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-accent-strong"
                >
                  <MessageCircle className="h-4 w-4 text-accent-strong" strokeWidth={1.6} aria-hidden="true" />
                  WhatsApp
                </WhatsAppCta>
              </li>
              <li>
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir o Instagram ${siteConfig.instagramHandle}`}
                  className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-accent-strong"
                >
                  <InstagramIcon className="h-4 w-4 text-accent-strong" />
                  {siteConfig.instagramHandle}
                </a>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── Pagamento ── */}
      <section className="bg-bg-surface py-14 lg:py-20" aria-label="Formas de pagamento">
        <div className="shell">
          <SectionHeading
            eyebrow="Pagamento"
            title="Facilidade para escolher"
            text="Escolha seus produtos e pague com dinheiro, Pix ou cartão em até 6 vezes sem juros."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {[
              { icon: Banknote, label: "Dinheiro" },
              { icon: QrCode, label: "Pix" },
              { icon: CreditCard, label: "Até 6x sem juros" },
            ].map(({ icon: Icon, label }, i) => (
              <Reveal
                key={label}
                delay={i * 80}
                className="flex items-center gap-4 rounded-2xl border border-border bg-bg-elevated p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg-surface">
                  <Icon className="h-5 w-5 text-accent-strong" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-text-primary">
                  {label}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Política de trocas ── */}
      <section className="bg-bg-base py-14 lg:py-20" aria-label="Política de trocas">
        <div className="shell">
          <SectionHeading eyebrow="Políticas" title={exchangePolicy.title} />
          <Reveal className="mt-6 max-w-3xl">
            {exchangePolicy.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-[15px] leading-relaxed text-text-secondary first:mt-0">
                {p}
              </p>
            ))}
            <p className="mt-5 text-xs leading-relaxed text-text-secondary/80">
              {exchangePolicy.note}
            </p>
            <Link
              href="/politicas/trocas"
              className="mt-6 inline-flex min-h-11 items-center text-[13px] font-semibold uppercase tracking-[0.14em] text-text-primary underline underline-offset-4 transition-colors hover:text-accent-strong"
            >
              Ver a política completa
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
