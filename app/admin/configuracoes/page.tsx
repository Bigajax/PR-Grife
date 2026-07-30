import { siteConfig } from "@/data/site.config"
import { ChangePassword } from "@/components/admin/ChangePassword"

// Configurações: troca de senha (funcional) + leitura dos dados da loja.
// Os dados editáveis do site continuam em data/site.config.ts — editar lá
// e publicar; trazer para o banco é uma fase futura.
export default function AdminConfigPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-medium text-text-primary">Configurações</h1>

      <section className="mt-6 border border-border bg-bg-elevated p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
          Alterar senha de acesso
        </h2>
        <ChangePassword />
      </section>

      <section className="mt-4 border border-border bg-bg-elevated p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
          Dados da loja
        </h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="font-semibold text-text-primary">WhatsApp</dt>
          <dd className="text-text-secondary">{siteConfig.whatsapp}</dd>
          <dt className="font-semibold text-text-primary">Instagram</dt>
          <dd className="text-text-secondary">{siteConfig.instagramHandle}</dd>
          <dt className="font-semibold text-text-primary">Endereço</dt>
          <dd className="text-text-secondary">{siteConfig.address}</dd>
          <dt className="font-semibold text-text-primary">Horário</dt>
          <dd className="text-text-secondary">{siteConfig.hours}</dd>
          <dt className="font-semibold text-text-primary">Prazo de encomenda</dt>
          <dd className="text-text-secondary">{siteConfig.leadTimeText}</dd>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-text-secondary">
          Estes dados são editados em <code className="bg-bg-surface px-1">data/site.config.ts</code> e
          publicados com o site — fale com o responsável técnico para alterar.
        </p>
      </section>
    </div>
  )
}
