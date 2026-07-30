# Painel administrativo — setup

O painel vive em `/admin` e usa o Supabase (banco + login + fotos). Sem essa
configuração o site continua funcionando normalmente com o catálogo estático
de `data/products.ts` — só o painel fica indisponível.

## Passo a passo (uma vez só)

1. **Criar o projeto** em [supabase.com](https://supabase.com) (plano gratuito
   atende). Guarde a *Project URL* e a *anon key* (Settings → API).

2. **Rodar as migrations**: abra o *SQL Editor* do projeto e execute, na
   ordem, o conteúdo de cada arquivo de `supabase/migrations/`:
   - `0001_catalogo.sql` — tabela `products`, regras de acesso e o bucket
     público `produtos` para as fotos.
   - `0002_estoque.sql` — controle de estoque: variações por tamanho/cor,
     histórico de movimentações e o cálculo automático de disponibilidade.
     É retrocompatível: pode rodar num banco já em uso sem afetar os
     produtos existentes (o controle nasce desligado em todos).

3. **Criar o usuário do painel**: em *Authentication → Users → Add user*,
   cadastre o e-mail e uma senha provisória (marque *Auto confirm*). A senha
   pode ser trocada depois dentro do próprio painel (Configurações).

4. **Preencher as variáveis**: copie `.env.example` para `.env.local` e
   preencha:

   ```
   NEXT_PUBLIC_SUPABASE_URL=       ← Project URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=  ← anon key
   SUPABASE_SERVICE_ROLE_KEY=      ← service_role key (Settings → API)
   ```

   A `service_role` fica **somente no servidor** (upload de fotos e seed).
   Nunca colocar no navegador nem commitar. Na Vercel, cadastrar as três em
   *Environment Variables*.

5. **Importar o catálogo atual** (opcional): `npm run seed` envia os produtos
   de `data/products.ts` para o banco (upsert por slug — pode rodar de novo,
   mas sobrescreve edições feitas no painel para esses produtos).

## Uso diário

- `/admin` — visão geral com contagens (publicados, ofertas, sem foto...).
- `/admin/estoque` — saldo por variação (tamanho/cor), indicadores e
  movimentações. Todo ajuste de quantidade passa por **Entrada** ou **Saída**
  com motivo — o histórico fica registrado e não pode ser editado.
- `/admin/produtos` — cadastrar, editar, duplicar, arquivar e excluir.
  - O produto é cadastrado **uma única vez** (departamento → categoria →
    marca) e aparece automaticamente em `/catalogo`, `/catalogo/<depto>`,
    `?categoria=` e `/catalogo/marca/<marca>`.
  - **Oferta** não é um botão: preencha o preço "de" com um valor maior que o
    preço atual e o produto entra em `/ofertas` com o preço riscado.
  - **Arquivar** tira da vitrine sem apagar; **Excluir** é definitivo.
- `/admin/configuracoes` — trocar a senha de acesso.

As alterações aparecem na vitrine imediatamente (revalidação por tag).
