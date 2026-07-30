import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase/env";
import { products as staticProducts } from "@/data/products";
import type { Product, ProductColor, StockStatus } from "@/types";

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
};

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
    return (data as ProductRow[]).map(mapRow);
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
export type AdminProduct = Product & { archivedAt: string | null };

export async function getAdminCatalog(): Promise<AdminProduct[]> {
  const { data, error } = await anonClient()
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Erro ao carregar o catálogo: ${error.message}`);
  return (data as ProductRow[]).map((row) => ({
    ...mapRow(row),
    archivedAt: row.archived_at,
  }));
}
