-- ============================================================================
-- PR Grife — controle de estoque por variação (fase 2 do painel)
-- Rodar no SQL Editor do Supabase, DEPOIS da 0001_catalogo.sql.
-- Re-runnável: pode colar de novo sem efeito colateral.
--
-- Modelo:
--   products         ganha o modo de venda e as flags de controle;
--   product_variants guarda o saldo — SEMPRE, mesmo no "estoque único"
--                    (uma linha com size/color nulos), para movimentação,
--                    histórico e modais terem um caminho só;
--   stock_movements  é o histórico imutável (sem policy de update/delete).
--
-- O saldo NUNCA é editado direto: toda alteração passa pela função
-- register_stock_movement, que trava a linha (FOR UPDATE), valida saldo,
-- grava o movimento e recalcula products.stock_status — o campo que o site
-- inteiro já consome, agora derivado quando track_stock = true.
-- ============================================================================

-- ── 1. Colunas novas em products (defaults preservam o comportamento atual) ──

alter table public.products add column if not exists track_stock boolean not null default false;
alter table public.products add column if not exists stock_type text not null default 'single';
alter table public.products add column if not exists minimum_stock integer not null default 0;
alter table public.products add column if not exists sale_mode text not null default 'in_stock';
alter table public.products add column if not exists allow_negative_stock boolean not null default false;

alter table public.products drop constraint if exists products_stock_type_check;
alter table public.products add constraint products_stock_type_check
  check (stock_type in ('single', 'per_variant'));

alter table public.products drop constraint if exists products_sale_mode_check;
alter table public.products add constraint products_sale_mode_check
  check (sale_mode in ('in_stock', 'on_request', 'both'));

alter table public.products drop constraint if exists products_minimum_stock_check;
alter table public.products add constraint products_minimum_stock_check
  check (minimum_stock >= 0);

-- Compatibilidade: quem já estava marcado como encomenda vende sob encomenda.
update public.products set sale_mode = 'on_request'
  where stock_status = 'on_request' and sale_mode = 'in_stock';

-- ── 2. Variações ─────────────────────────────────────────────────────────────

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  -- Nulos no "estoque único" (a variação é o produto inteiro).
  size text,
  color text,
  sku text not null unique,
  stock_quantity integer not null default 0,
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uma linha por combinação (nulo conta como vazio para o unique funcionar).
create unique index if not exists product_variants_combo_key
  on public.product_variants (product_id, coalesce(size, ''), coalesce(color, ''));
create index if not exists product_variants_product_idx
  on public.product_variants (product_id);

drop trigger if exists product_variants_updated_at on public.product_variants;
create trigger product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ── 3. Movimentações (histórico imutável) ────────────────────────────────────

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  -- RESTRICT de propósito: produto com histórico não pode ser apagado —
  -- o painel orienta a arquivar (o histórico é o registro contábil da loja).
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  movement_type text not null check (movement_type in ('entry', 'exit')),
  reason text not null check (reason in (
    'purchase', 'manual_entry', 'return', 'cancellation', 'inventory_adjustment',
    'sale', 'manual_exit', 'loss', 'damage', 'internal_use'
  )),
  quantity integer not null check (quantity > 0),
  previous_quantity integer not null,
  balance_after integer not null,
  notes text,
  user_id uuid,
  user_email text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_idx
  on public.stock_movements (product_id, created_at desc);
create index if not exists stock_movements_variant_idx
  on public.stock_movements (variant_id);
create index if not exists stock_movements_created_idx
  on public.stock_movements (created_at desc);

-- ── 4. RLS ───────────────────────────────────────────────────────────────────

-- Variações: leitura pública (o site desabilita tamanho/cor esgotados),
-- escrita só autenticado. Nota: isso expõe quantidades exatas na API anon —
-- aceito por ora; se incomodar, trocar a leitura pública por uma view.
alter table public.product_variants enable row level security;

drop policy if exists variants_public_read on public.product_variants;
create policy variants_public_read
  on public.product_variants for select
  using (true);

drop policy if exists variants_admin_all on public.product_variants;
create policy variants_admin_all
  on public.product_variants for all
  to authenticated
  using (true)
  with check (true);

-- Movimentações: só o painel lê e insere. Sem policy de update/delete —
-- histórico não se edita nem se apaga.
alter table public.stock_movements enable row level security;

drop policy if exists movements_admin_read on public.stock_movements;
create policy movements_admin_read
  on public.stock_movements for select
  to authenticated
  using (true);

drop policy if exists movements_admin_insert on public.stock_movements;
create policy movements_admin_insert
  on public.stock_movements for insert
  to authenticated
  with check (true);

-- ── 5. Status derivado ───────────────────────────────────────────────────────
-- Regra (só quando track_stock):
--   sale_mode 'on_request'        -> on_request (não depende de estoque)
--   total 0 e sale_mode 'both'    -> on_request (encomenda continua possível)
--   total 0 e sale_mode 'in_stock'-> out_of_stock
--   alguma variação ativa com 0 < qty <= mínimo -> low_stock
--   senão                          -> available

create or replace function public.refresh_product_stock_status(p_product_id uuid)
returns void language plpgsql as $$
declare
  v_p record;
  v_total integer;
  v_has_low boolean;
begin
  select * into v_p from public.products where id = p_product_id;
  if v_p is null or not v_p.track_stock then return; end if;

  if v_p.sale_mode = 'on_request' then
    update public.products set stock_status = 'on_request' where id = p_product_id;
    return;
  end if;

  select coalesce(sum(stock_quantity), 0),
         coalesce(bool_or(stock_quantity > 0 and stock_quantity <= minimum_stock), false)
    into v_total, v_has_low
    from public.product_variants
   where product_id = p_product_id and is_active;

  update public.products set stock_status =
    case
      when v_total <= 0 then
        case when v_p.sale_mode = 'both' then 'on_request' else 'out_of_stock' end
      when v_has_low then 'low_stock'
      else 'available'
    end
  where id = p_product_id;
end;
$$;

-- ── 6. Movimentação atômica ──────────────────────────────────────────────────
-- security invoker: roda como o usuário autenticado (RLS continua valendo) e
-- auth.uid() identifica o responsável. FOR UPDATE na variação E no produto
-- serializa movimentações concorrentes e o recálculo do status.

create or replace function public.register_stock_movement(
  p_variant_id uuid,
  p_movement_type text,
  p_quantity integer,
  p_reason text,
  p_notes text default null,
  p_user_email text default ''
) returns integer
language plpgsql
security invoker
as $$
declare
  v_variant record;
  v_product record;
  v_new integer;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantidade deve ser maior que zero.';
  end if;
  if p_movement_type not in ('entry', 'exit') then
    raise exception 'Tipo de movimentação inválido.';
  end if;

  select * into v_variant from public.product_variants
   where id = p_variant_id for update;
  if not found then
    raise exception 'Variação não encontrada.';
  end if;

  select * into v_product from public.products
   where id = v_variant.product_id for update;

  v_new := v_variant.stock_quantity
           + case when p_movement_type = 'entry' then p_quantity else -p_quantity end;

  if v_new < 0 and not v_product.allow_negative_stock then
    raise exception 'Saldo insuficiente: apenas % em estoque.', v_variant.stock_quantity;
  end if;

  update public.product_variants set stock_quantity = v_new where id = p_variant_id;

  insert into public.stock_movements
    (product_id, variant_id, movement_type, reason, quantity,
     previous_quantity, balance_after, notes, user_id, user_email)
  values
    (v_product.id, p_variant_id, p_movement_type, p_reason, p_quantity,
     v_variant.stock_quantity, v_new,
     nullif(trim(coalesce(p_notes, '')), ''), auth.uid(), p_user_email);

  perform public.refresh_product_stock_status(v_product.id);

  return v_new;
end;
$$;

revoke execute on function public.register_stock_movement(uuid, text, integer, text, text, text)
  from anon, public;
grant execute on function public.register_stock_movement(uuid, text, integer, text, text, text)
  to authenticated;

revoke execute on function public.refresh_product_stock_status(uuid) from anon, public;
grant execute on function public.refresh_product_stock_status(uuid) to authenticated;
