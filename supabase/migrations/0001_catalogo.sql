-- ============================================================================
-- PR Grife — catálogo (fase 1 do painel)
-- Rodar no SQL Editor do Supabase. Espelha 1:1 o tipo Product de types/index.ts
-- (snake_case no banco, camelCase no app — lib/products/db.ts:mapRow converte).
-- Taxonomia (categorias, departamentos, marcas) continua no código
-- (data/*.ts) — o banco guarda strings, sem tabelas de apoio.
-- Sem coluna de gênero: a PR Grife só trabalha com produtos masculinos.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null,
  category text not null,
  short_description text not null default '',
  full_description text,
  price numeric(10, 2),
  old_price numeric(10, 2),
  installment_text text,
  images text[] not null default '{}',
  thumbnail text not null default '',
  available_sizes text[] not null default '{}',
  -- [{ "name": "Branco", "hex": "#FFFFFF" }]
  colors jsonb not null default '[]',
  stock_status text not null default 'available'
    check (stock_status in ('available', 'low_stock', 'out_of_stock', 'on_request')),
  badges text[] not null default '{}',
  product_code text not null unique,
  material text,
  fit text,
  featured boolean not null default false,
  new_arrival boolean not null default false,
  -- Soft delete: arquivado sai da vitrine mas continua no painel.
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_brand_idx on public.products (brand);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- RLS: leitura pública (vitrine), escrita só autenticado (painel).
alter table public.products enable row level security;

drop policy if exists products_public_read on public.products;
create policy products_public_read
  on public.products for select
  using (true);

drop policy if exists products_admin_all on public.products;
create policy products_admin_all
  on public.products for all
  to authenticated
  using (true)
  with check (true);

-- Bucket público de fotos de produto (upload via service role no servidor).
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;
