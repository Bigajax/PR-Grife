-- ============================================================================
-- PR GRIFE — Schema baseline (migration 0001)
-- Modelo do GUIA-MESTRE-VITRINES-DIGITAIS (pasta 06-BANCO-DE-DADOS).
--
-- COMO EXECUTAR
--   1. Crie um projeto no Supabase.
--   2. Rode este arquivo inteiro UMA única vez no SQL Editor.
--   3. Preencha as variáveis NEXT_PUBLIC_SUPABASE_URL e
--      NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.
--   4. Nunca rode o seed em produção mais de uma vez; snapshot antes de
--      qualquer escrita em massa.
--
-- PRINCÍPIOS (inegociáveis do Guia Mestre)
--   * Status do produto é DERIVADO das variantes, nunca coluna.
--   * Prazo de encomenda é da LOJA (config versionado), não do produto.
--   * Históricos são imutáveis: RLS sem UPDATE/DELETE.
--   * Arquivar em vez de excluir (archived_at).
--   * Operações compostas em RPC atômica (register_stock_movement).
-- ============================================================================

-- ── Núcleo do catálogo ──────────────────────────────────────────────────────

create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  sku               text not null unique,
  name              text not null,
  description       text not null default '',
  brand             text not null,
  category          text not null,
  audience          text check (audience in ('masculino', 'feminino', 'infantil', 'unissex')),
  season            text,
  price             numeric(10,2) not null check (price > 0),
  old_price         numeric(10,2),           -- preço "de"; app exige old_price > price quando on_sale
  installments      int,                     -- app valida 1-12
  images            text[] not null default '{}',  -- posição 0 = capa; máx. 8 (validação no app)
  video             text,
  colors            text[] not null default '{}',  -- máx. 8 (validação no app)
  tags              text[],
  material          text,
  fit               text,
  care_instructions text[],
  featured          boolean not null default false,
  new_arrival       boolean not null default false,
  best_seller       boolean not null default false,
  on_sale           boolean not null default false,
  available         boolean not null default true,   -- oculto temporário (lojista)
  archived_at       timestamptz,                     -- saiu de linha (preferir a excluir)
  low_stock_threshold int check (low_stock_threshold >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Query da vitrine: produtos visíveis por ordem de chegada.
create index if not exists products_storefront_idx
  on products (available, created_at desc);

-- Estoque por tamanho. Status comercial deriva daqui:
--   algum ativo com stock > 0        -> pronta entrega
--   senão, algum com allow_pre_order -> sob encomenda
--   senão                            -> esgotado
create table if not exists product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products (id) on delete cascade,
  label           text not null,           -- "P", "M", "40", "Único"...
  stock           int  not null default 0 check (stock >= 0),
  allow_pre_order boolean not null default false,
  active          boolean not null default true,
  position        int not null default 0,
  unique (product_id, label)               -- app ainda compara case-insensitive
);

create index if not exists product_variants_product_idx on product_variants (product_id);

-- ── Estrutura da vitrine ────────────────────────────────────────────────────

create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  label      text not null,
  image      text,
  featured   boolean not null default false,
  position   int not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists brands (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  logo       text,
  active     boolean not null default true,
  position   int not null default 0,
  created_at timestamptz not null default now()
);

-- Banners do mosaico da home (espelhado hoje em data/banners.ts).
create table if not exists banners (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  text          text not null default '',
  cta_label     text not null default '',
  href          text not null,
  image_desktop text not null,
  image_mobile  text,
  text_position text not null default 'left' check (text_position in ('left', 'center')),
  active        boolean not null default true,
  position      int not null default 0,
  starts_at     timestamptz,
  ends_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Configurações da loja em linhas chave/valor versionáveis.
-- ATENÇÃO: o prazo de encomenda (lead_time) vive AQUI, nunca por produto.
create table if not exists store_settings (
  key        text primary key,   -- 'whatsapp', 'instagram', 'address', 'hours',
                                 -- 'lead_time_text', 'announcements', ...
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ── Caixa de entrada pública ────────────────────────────────────────────────

-- Registro fire-and-forget do clique de WhatsApp (lead). INSERT-only p/ anon.
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid references products (id) on delete set null,
  product_name  text,   -- denormalizado: sobrevive à exclusão do produto
  product_sku   text,
  size          text,
  color         text,
  availability  text,
  page_origin   text,
  utm_source    text,
  utm_campaign  text,
  status        text not null default 'novo' check (status in ('novo', 'em_atendimento', 'fechado', 'perdido')),
  created_at    timestamptz not null default now()
);

create index if not exists leads_created_idx on leads (created_at desc);

-- ── Histórico imutável de estoque ───────────────────────────────────────────

create table if not exists stock_movements (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid references products (id) on delete set null,
  variant_id    uuid references product_variants (id) on delete set null,
  product_name  text not null,  -- FK para navegar, cópia para lembrar
  product_sku   text not null,
  variant_label text not null,
  quantity      int  not null,  -- negativo = saída, positivo = entrada
  stock_before  int  not null,
  stock_after   int  not null,
  reason        text not null,  -- motivo obrigatório
  created_by    uuid,           -- auth.uid() do administrador
  created_at    timestamptz not null default now()
);

create index if not exists stock_movements_product_idx on stock_movements (product_id, created_at desc);

-- ── Triggers ────────────────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at
  before update on products
  for each row execute function set_updated_at();

drop trigger if exists banners_updated_at on banners;
create trigger banners_updated_at
  before update on banners
  for each row execute function set_updated_at();

-- ── RPC atômica: baixa de estoque + movimento em UMA transação ─────────────

create or replace function register_stock_movement(
  p_variant_id uuid,
  p_quantity   int,
  p_reason     text
) returns void
language plpgsql security invoker as $$
declare
  v_variant product_variants%rowtype;
  v_product products%rowtype;
begin
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'Motivo é obrigatório';
  end if;

  select * into v_variant from product_variants where id = p_variant_id for update;
  if not found then
    raise exception 'Variante não encontrada';
  end if;
  select * into v_product from products where id = v_variant.product_id;

  -- O CHECK (stock >= 0) aborta a transação inteira em saldo insuficiente:
  -- nunca fica movimento sem baixa nem baixa sem movimento.
  update product_variants
     set stock = stock + p_quantity
   where id = p_variant_id;

  insert into stock_movements
    (product_id, variant_id, product_name, product_sku, variant_label,
     quantity, stock_before, stock_after, reason, created_by)
  values
    (v_product.id, v_variant.id, v_product.name, v_product.sku, v_variant.label,
     p_quantity, v_variant.stock, v_variant.stock + p_quantity, p_reason, auth.uid());
end $$;

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table products         enable row level security;
alter table product_variants enable row level security;
alter table categories       enable row level security;
alter table brands           enable row level security;
alter table banners          enable row level security;
alter table store_settings   enable row level security;
alter table leads            enable row level security;
alter table stock_movements  enable row level security;

-- Catálogo público: anon lê apenas o que está publicado (o filtro no banco,
-- não só no código — alerta real do Guia Mestre).
create policy products_public_read on products
  for select using (available = true and archived_at is null);

create policy variants_public_read on product_variants
  for select using (
    active = true
    and exists (
      select 1 from products p
      where p.id = product_variants.product_id
        and p.available = true and p.archived_at is null
    )
  );

create policy categories_public_read on categories for select using (active = true);
create policy brands_public_read     on brands     for select using (active = true);
create policy banners_public_read    on banners    for select using (active = true);
create policy settings_public_read   on store_settings for select using (true);

-- Caixa de entrada: anon só INSERE; nunca lê, altera ou apaga.
create policy leads_public_insert on leads
  for insert with check (true);

-- Administração (painel): usuários autenticados.
create policy products_admin_all  on products         for all using (auth.role() = 'authenticated');
create policy variants_admin_all  on product_variants for all using (auth.role() = 'authenticated');
create policy categories_admin_all on categories      for all using (auth.role() = 'authenticated');
create policy brands_admin_all    on brands           for all using (auth.role() = 'authenticated');
create policy banners_admin_all   on banners          for all using (auth.role() = 'authenticated');
create policy settings_admin_all  on store_settings   for all using (auth.role() = 'authenticated');
create policy leads_admin_read    on leads            for select using (auth.role() = 'authenticated');
create policy leads_admin_update  on leads            for update using (auth.role() = 'authenticated');

-- Histórico imutável: autenticado lê e insere (via RPC); NINGUÉM altera/apaga.
create policy movements_admin_read   on stock_movements for select using (auth.role() = 'authenticated');
create policy movements_admin_insert on stock_movements for insert with check (auth.role() = 'authenticated');
-- (sem policy de UPDATE/DELETE — bloqueado por padrão com RLS ativa)
