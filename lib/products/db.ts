import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase/env";
import { products as staticProducts } from "@/data/products";
import type {
  Product,
  ProductColor,
  ProductVariant,
  SaleMode,
  StockStatus,
  StockType,
} from "@/types";

/**
 * Leitura do catálogo, cacheada com a tag "products". As Server Actions do
 * admin chamam revalidateTag("products") ao salvar, então a vitrine reflete
 * alterações imediatamente; o revalidate de 5 min é rede de segurança.
 *
 * Sem Supabase configurado (ou com o banco fora do ar), devolve o catálogo
 * estático de data/products.ts — o site nunca quebra por causa do banco.
 *
 * Importante: usa o cliente anon puro (sem cookies) — um cliente com cookies
 * tornaria as rotas dinâmicas e quebraria o unstable_cache.
 */

export const PRODUCTS_TAG = "products";

function anonClient() {
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false },
  });
}

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  short_description: string;
  full_description: string | null;
  price: number | string | null;
  old_price: number | string | null;
  installment_text: string | null;
  images: string[];
  thumbnail: string;
  available_sizes: string[];
  colors: ProductColor[];
  stock_status: StockStatus;
  badges: string[];
  product_code: string;
  material: string | null;
  fit: string | null;
  featured: boolean;
  new_arrival: boolean;
  archived_at: string | null;
  // Colunas da migration 0002 — opcionais: um banco sem ela não as devolve.
  track_stock?: boolean;
  stock_type?: StockType;
  minimum_stock?: number;
  sale_mode?: SaleMode;
  allow_negative_stock?: boolean;
};

export type VariantRow = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  sku: string;
  stock_quantity: number;
  minimum_stock: number;
  is_active: boolean;
};

export function mapVariantRow(row: VariantRow): ProductVariant {
  return {
    id: row.id,
    size: row.size ?? undefined,
    color: row.color ?? undefined,
    sku: row.sku,
    stockQuantity: row.stock_quantity,
    minimumStock: row.minimum_stock,
    isActive: row.is_active,
  };
}

/**
 * Busca as variações dos produtos indicados, agrupadas por product_id.
 * Try/catch PRÓPRIO: sem a migration 0002 a tabela não existe e a vitrine
 * precisa seguir de pé — devolve mapa vazio e loga uma vez.
 */
async function fetchVariantsByProduct(
  productIds: string[],
  onlyActive: boolean
): Promise<Map<string, ProductVariant[]>> {
  const map = new Map<string, ProductVariant[]>();
  if (productIds.length === 0) return map;
  try {
    let query = anonClient()
      .from("product_variants")
      .select("*")
      .in("product_id", productIds)
      .order("created_at", { ascending: true });
    if (onlyActive) query = query.eq("is_active", true);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    for (const row of (data ?? []) as VariantRow[]) {
      const list = map.get(row.product_id) ?? [];
      list.push(mapVariantRow(row));
      map.set(row.product_id, list);
    }
  } catch (err) {
    console.error("[catalogo] Falha ao ler product_variants (migration 0002 aplicada?):", err);
  }
  return map;
}

/** Converte a linha do banco para o tipo do app. `numeric` chega como string. */
export function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    shortDescription: row.short_description,
    fullDescription: row.full_description ?? undefined,
    price: row.price != null ? Number(row.price) : undefined,
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    installmentText: row.installment_text ?? undefined,
    images: row.images ?? [],
    thumbnail: row.thumbnail,
    availableSizes: row.available_sizes ?? [],
    availableColors: row.colors ?? [],
    stockStatus: row.stock_status,
    badges: (row.badges ?? []) as Product["badges"],
    productCode: row.product_code,
    material: row.material ?? undefined,
    fit: row.fit ?? undefined,
    featured: row.featured,
    newArrival: row.new_arrival,
    trackStock: row.track_stock ?? false,
    stockType: row.stock_type ?? "single",
    saleMode: row.sale_mode ?? "in_stock",
    allowNegativeStock: row.allow_negative_stock ?? false,
    minimumStock: row.minimum_stock ?? 0,
  };
}

async function fetchCatalog(): Promise<Product[]> {
  if (!supabaseConfigured()) return staticProducts;
  try {
    const { data, error } = await anonClient()
      .from("products")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    const rows = data as ProductRow[];
    // Variações só dos produtos com controle ligado; a falha da tabela
    // (migration 0002 ausente) não derruba nada — segue sem variants.
    const tracked = rows.filter((r) => r.track_stock).map((r) => r.id);
    const variants = await fetchVariantsByProduct(tracked, true);
    return rows.map((row) => {
      const product = mapRow(row);
      const list = variants.get(row.id);
      return list ? { ...product, variants: list } : product;
    });
  } catch (err) {
    // Banco fora do ar não pode derrubar a vitrine: cai no estático e loga.
    console.error("[catalogo] Falha ao ler o Supabase, usando data/products.ts:", err);
    return staticProducts;
  }
}

/** Catálogo visível na vitrine (sem arquivados). */
export const getCatalog = unstable_cache(fetchCatalog, ["catalog"], {
  tags: [PRODUCTS_TAG],
  revalidate: 300,
});

export async function getProduct(slug: string): Promise<Product | undefined> {
  const all = await getCatalog();
  return all.find((p) => p.slug === slug);
}

/**
 * Catálogo completo para o painel — sem cache e incluindo arquivados.
 * Usar em páginas com `export const dynamic = "force-dynamic"`.
 * Devolve também archived_at, que o tipo público não carrega.
 */
export type AdminProduct = Product & {
  archivedAt: string | null;
  /** No painel as variações vêm sempre (inclusive inativas); [] sem controle. */
  variants: ProductVariant[];
};

export async function getAdminCatalog(): Promise<AdminProduct[]> {
  const { data, error } = await anonClient()
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Erro ao carregar o catálogo: ${error.message}`);
  const rows = data as ProductRow[];
  const variants = await fetchVariantsByProduct(
    rows.map((r) => r.id),
    false
  );
  return rows.map((row) => ({
    ...mapRow(row),
    archivedAt: row.archived_at,
    variants: variants.get(row.id) ?? [],
  }));
}
