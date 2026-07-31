/**
 * Importa a planilha de estoque da loja para a tabela products.
 *
 * Uso:
 *   npx tsx scripts/importar-estoque.ts <caminho.csv> [--commit]
 *
 * Sem --commit é ensaio: imprime o que faria e não escreve nada.
 *
 * A planilha é exportada do Excel como CSV com três colunas, nesta ordem:
 *   Nome | Preço de venda | Quantidade disponível
 *
 * O que a planilha NÃO traz e como o script resolve:
 *   categoria  — inferida do nome (CATEGORY_RULES); o que não casar é
 *                relatado e fica de fora da importação, nunca chutado.
 *   marca      — lida do nome quando aparece; senão "Sem marca", que é
 *                filtrável no painel e deixa explícito o que falta preencher.
 *   tamanho    — não existe na planilha, então cada produto entra com UMA
 *                variação de tamanho/cor nulos: o "estoque único" da
 *                migration 0002, que o painel mostra como "Único".
 *   foto       — não há. Por isso todo produto nasce ARQUIVADO: fica no
 *                painel e fora da vitrine até alguém subir a imagem e clicar
 *                em Restaurar.
 *
 * Nomes repetidos com o mesmo preço são a mesma peça listada uma vez por
 * tamanho — viram um produto só, com as quantidades somadas. Preço diferente
 * sob o mesmo nome continua sendo produto separado.
 *
 * Re-rodar é seguro: linha cujo (nome, preço) já existe no banco é pulada.
 *
 * O nome vai para o banco exatamente como está na planilha, em caixa alta
 * inclusive. É a nomenclatura que o dono usa para reconhecer a peça na hora
 * de casar com a foto — reescrever isso é trabalho de quem edita o produto.
 */
import fs from "node:fs";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { categories } from "../data/categories";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltam variáveis de ambiente. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local."
  );
  process.exit(1);
}

const csvPath = process.argv[2];
const commit = process.argv.includes("--commit");

if (!csvPath) {
  console.error("Uso: npx tsx scripts/importar-estoque.ts <caminho.csv> [--commit]");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

// ── Leitura do CSV ───────────────────────────────────────────────────────────

/** Parser de CSV com aspas — o Excel escapa aspas dobrando-as. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ── Classificação ────────────────────────────────────────────────────────────

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

/** Ordem importa: a primeira regra que casar vence. Mais específico primeiro —
 *  BERMUDA antes de JEANS, senão "bermuda jeans" cairia em calças. */
const CATEGORY_RULES: [string, RegExp][] = [
  ["perfumes", /PERFUM|EAU DE|\bEDP\b|\bEDT\b|COLONIA|FRAGRANC|ERBA PURA|MERCEDES BENZ|VERSAGE|VERSACE|COBRA CRIADA/],
  ["tenis", /\bTENIS\b|SNEAKER/],
  ["bones", /\bBONE(S)?\b|\bCAP\b/],
  ["cintos", /\bCINTO/],
  ["carteiras", /\bCARTEIRA/],
  ["oculos", /\bOCULOS/],
  ["acessorios", /CHINELO|SLIDE|RUBBER|MEIA|MOCHILA|BOLSA|NECESSAIRE|POCHETE/],
  ["polos", /\bPOLO/],
  ["shorts", /SHORT|BERMUDA/],
  ["jaquetas", /JAQUETA|\bJQ\b|BOMBER|CASACO|COLETE|CORTA ?VENTO|PARKA|JACKET|BOBOJACO/],
  ["calcas", /\bCALCA|\bJEANS\b|\bJEAN\b|ALFAIATARIA|\bSCANTON\b|\bAUSTIN\b/],
  ["camisetas", /CAMISETA|T-?SHIRT|\bREGATA\b|\bTEE\b/],
  ["camisas", /\bCAMISA|\bBATA\b/],
  ["moletons-tricos", /MOLETOM|TRICOT|\bTRICO\b|SUETER|\bBLUSA\b|CARDIGA|GOLA ALTA/],
];

/** Marcas da casa (data/site.config.ts) + as que aparecem escritas na planilha. */
const BRAND_RULES: [string, RegExp][] = [
  ["Lacoste", /\bLACOSTE\b/],
  ["Tommy Jeans", /\bTOMMY JEANS\b|\bTJM\b|\bSCANTON\b|\bAUSTIN\b/],
  ["Tommy Hilfiger", /\bTOMMY HILFIGER\b|\bTOMMY\b/],
  ["Reserva", /\bRESERVA\b/],
  ["Colcci", /\bCOLCCI\b/],
  ["US Polo", /\bU\.?S\.? POLO\b/],
  ["Ankor", /\bANKOR\b/],
  ["Biotwo", /\bBIOTWO\b/],
  ["Jean Paul Gaultier", /\bJEAN PAUL\b|GAULTIER/],
  ["Convicto", /\bCONVICTO\b/],
  ["Davi K", /\bDAVI ?K\b/],
  ["Florenc", /\bFLORENC\b/],
  ["DGN", /\bDGN\b/],
  ["Mercedes-Benz", /\bMERCEDES\b/],
  ["Versace", /\bVERSAGE\b|\bVERSACE\b/],
  ["KDU", /\bKDU\b/],
];

const SEM_MARCA = "Sem marca";

/** Descrição curta: o rótulo da categoria no singular. Não invento copy de
 *  venda para peça que ninguém descreveu — quem editar o produto escreve. */
const SHORT_DESCRIPTION: Record<string, string> = {
  camisetas: "Camiseta",
  polos: "Polo",
  camisas: "Camisa",
  calcas: "Calça",
  shorts: "Short",
  jaquetas: "Jaqueta",
  "moletons-tricos": "Moletom ou tricô",
  tenis: "Tênis",
  bones: "Boné",
  cintos: "Cinto",
  carteiras: "Carteira",
  oculos: "Óculos",
  acessorios: "Acessório",
  perfumes: "Perfume",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type Item = {
  name: string;
  price: number | null;
  qty: number;
  category: string;
  brand: string;
  linhas: number;
};

async function main() {
  const validCategories = new Set(categories.map((c) => c.id));
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8")).filter((r) => r[0]?.trim());

  // Primeira linha é cabeçalho quando não tiver preço numérico.
  const start = Number(rows[0]?.[1]) ? 0 : 1;

  const semCategoria: string[] = [];
  const bruto: Item[] = [];

  for (const r of rows.slice(start)) {
    const name = r[0].trim();
    const n = norm(name);
    const category = CATEGORY_RULES.find(([, re]) => re.test(n))?.[0];
    if (!category || !validCategories.has(category)) {
      semCategoria.push(name);
      continue;
    }
    const priceRaw = Number(String(r[1] ?? "").replace(",", "."));
    bruto.push({
      name,
      price: Number.isFinite(priceRaw) && priceRaw > 0 ? priceRaw : null,
      qty: Math.max(0, Math.round(Number(r[2]) || 0)),
      category,
      brand: BRAND_RULES.find(([, re]) => re.test(n))?.[0] ?? SEM_MARCA,
      linhas: 1,
    });
  }

  // Mesmo nome + mesmo preço = mesma peça em tamanhos diferentes: soma as
  // quantidades. Preço diferente sob o mesmo nome segue produto separado.
  const merged = new Map<string, Item>();
  for (const it of bruto) {
    const key = `${norm(it.name)}|${it.price ?? ""}`;
    const found = merged.get(key);
    if (found) {
      found.qty += it.qty;
      found.linhas += 1;
    } else merged.set(key, { ...it });
  }
  const items = [...merged.values()];

  console.log(
    `${rows.length - start} linhas na planilha → ${items.length} produtos` +
      `${semCategoria.length ? ` (${semCategoria.length} fora: sem categoria)` : ""}`
  );
  if (semCategoria.length) {
    console.log("\nSem categoria — não importados, classifique à mão:");
    semCategoria.forEach((n) => console.log(`  · ${n}`));
  }

  // ── Estado atual do banco: slugs, códigos e o que já foi importado ─────────
  const { data: existing, error: readError } = await supabase
    .from("products")
    .select("name, price, slug, product_code");
  if (readError) {
    console.error(`Não consegui ler products: ${readError.message}`);
    process.exit(1);
  }

  const slugs = new Set((existing ?? []).map((p) => p.slug));
  const jaImportado = new Set(
    (existing ?? []).map((p) => `${norm(p.name)}|${p.price == null ? "" : Number(p.price)}`)
  );
  let codeSeq = (existing ?? []).reduce((max, p) => {
    const n = Number(String(p.product_code).replace(/\D/g, ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);

  const uniqueSlug = (name: string) => {
    const root = slugify(name) || "produto";
    let candidate = root;
    for (let n = 2; slugs.has(candidate); n++) candidate = `${root}-${n}`;
    slugs.add(candidate);
    return candidate;
  };

  const porCategoria: Record<string, number> = {};
  const porMarca: Record<string, number> = {};
  let novos = 0;
  let pulados = 0;
  let falhas = 0;

  for (const it of items) {
    const key = `${norm(it.name)}|${it.price ?? ""}`;
    if (jaImportado.has(key)) {
      pulados++;
      continue;
    }
    novos++;
    porCategoria[it.category] = (porCategoria[it.category] ?? 0) + 1;
    porMarca[it.brand] = (porMarca[it.brand] ?? 0) + 1;

    const slug = uniqueSlug(it.name);
    const productCode = `PRG-${String(++codeSeq).padStart(4, "0")}`;

    if (!commit) continue;

    const { data: row, error } = await supabase
      .from("products")
      .insert({
        slug,
        name: it.name,
        brand: it.brand,
        category: it.category,
        short_description: SHORT_DESCRIPTION[it.category] ?? "",
        price: it.price,
        images: [],
        thumbnail: "",
        available_sizes: [],
        colors: [],
        // Provisório: refresh_product_stock_status recalcula pelo saldo logo
        // abaixo, que é a autoridade quando track_stock está ligado.
        stock_status: it.qty > 0 ? "available" : "out_of_stock",
        product_code: productCode,
        track_stock: true,
        stock_type: "single",
        sale_mode: "in_stock",
        minimum_stock: 0,
        // Sem foto não entra na vitrine. Sai daqui pelo botão Restaurar.
        archived_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error(`✗ ${it.name}: ${error.message}`);
      falhas++;
      continue;
    }

    // Estoque único: uma variação de tamanho e cor nulos ("Peça única").
    const { error: variantError } = await supabase.from("product_variants").insert({
      product_id: row.id,
      size: null,
      color: null,
      sku: productCode,
      stock_quantity: it.qty,
      minimum_stock: 0,
      is_active: true,
    });
    if (variantError) {
      console.error(`✗ ${it.name} (variação): ${variantError.message}`);
      falhas++;
      continue;
    }

    const { error: refreshError } = await supabase.rpc("refresh_product_stock_status", {
      p_product_id: row.id,
    });
    if (refreshError) console.error(`! ${it.name}: status não recalculado — ${refreshError.message}`);

    console.log(`✓ ${productCode} ${it.name} — ${it.category} · ${it.brand} · ${it.qty} un`);
  }

  const linha = (o: Record<string, number>) =>
    Object.entries(o)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ${v}`)
      .join(", ");

  console.log(`\n${commit ? "IMPORTADO" : "ENSAIO (nada foi escrito)"}`);
  console.log(`  novos: ${novos}   já existiam: ${pulados}   falhas: ${falhas}`);
  console.log(`  categorias: ${linha(porCategoria)}`);
  console.log(`  marcas: ${linha(porMarca)}`);
  console.log(`  unidades em estoque: ${items.reduce((s, i) => s + i.qty, 0)}`);
  if (!commit) console.log("\nPara gravar de verdade, repita o comando com --commit");
}

main();
