-- ============================================================================
-- PR Grife — condição de pagamento própria da peça (fase 3 do painel)
-- Rodar no SQL Editor do Supabase, DEPOIS da 0002_estoque.sql.
-- Re-runnável: pode colar de novo sem efeito colateral.
--
-- Problema que motivou a coluna:
--   duas peças de desconto agressivo (-70% e -50%) estavam com "Somente Pix"
--   gravado em installment_text. O campo é NOTA DE PARCELAMENTO — texto que
--   COMPLEMENTA a régua da loja ("em até 3x sem juros"). Uma restrição não
--   complementa: ela SUBSTITUI. O resultado era o cliente ler "Somente Pix"
--   na linha do preço e, logo abaixo, "cartão em até 6x sem juros" — e a
--   mensagem do WhatsApp saía com a mesma contradição.
--
-- Modelo, depois desta migration:
--   installment_text   complementa a régua da loja  -> "em até 6x sem juros"
--   payment_override   SUBSTITUI a régua da loja    -> "Somente Pix"
--
-- Os dois são texto livre de propósito: quem escreve é o lojista, no painel,
-- e é ele quem sabe a condição que pratica. O que o código precisa saber é
-- QUAL DOS DOIS PAPÉIS o texto cumpre — e isso agora está na coluna, não
-- numa checagem de conteúdo ("se contém 'somente'"), que quebraria calada no
-- dia em que alguém escrevesse "Pix ou dinheiro".
-- ============================================================================

-- ── 1. Coluna nova (nula = comportamento de sempre: vale a régua da loja) ────

alter table public.products
  add column if not exists payment_override text;

comment on column public.products.payment_override is
  'Condição de pagamento EXCLUSIVA da peça (ex.: "Somente Pix"). Quando '
  'preenchida, substitui a régua da loja na página do produto e na mensagem '
  'do WhatsApp. Para nota que apenas complementa a régua, use installment_text.';

-- ── 2. Migra o que já estava no campo errado ────────────────────────────────
-- Só move o que é reconhecidamente restrição, e só quando o destino está
-- vazio: nunca sobrescreve uma condição que alguém já tenha cadastrado.

update public.products
   set payment_override = installment_text,
       installment_text = null
 where installment_text = 'Somente Pix'
   and payment_override is null;
