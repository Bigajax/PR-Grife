"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseUrl } from "@/lib/supabase/env";
import { PRODUCTS_TAG } from "@/lib/products/db";
import { buildVariantSku } from "@/lib/stock";
import { categories } from "@/data/categories";

/**
 * Escritas do painel de produtos. Toda action: sessão obrigatória → validação
 * zod → escrita (RLS como segunda camada) → revalidateTag para a vitrine
 * refletir na hora.
 */

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada — entre novamente no painel.");
  // Devolve também o user: as movimentações de estoque registram o e-mail.
  return { supabase, user };
}

type AdminClient = Awaited<ReturnType<typeof requireUser>>["supabase"];

// { expire: 0 } expira o cache na hora: quem salvou precisa ver a mudança na
// vitrine imediatamente (Next 16 exige o 2º argumento de revalidateTag).
function bumpCatalog() {
  revalidateTag(PRODUCTS_TAG, { expire: 0 });
}

function fail(e: unknown): ActionResult {
  return {
    ok: false,
    error: e instanceof Error ? e.message : "Não foi possível salvar agora.",
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const categoryIds = categories.map((c) => c.id) as [string, ...string[]];

const colorSchema = z.object({
  name: z.string().trim().min(1, "Nome da cor vazio").max(30),
  hex: z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor inválida"),
});

const productSchema = z
  .object({
    name: z.string().trim().min(3, "Nome muito curto").max(120),
    category: z.enum(categoryIds, { message: "Escolha uma categoria" }),
    brand: z.string().trim().min(1, "Informe a marca").max(60),
    shortDescription: z.string().trim().min(1, "Escreva a descrição curta").max(200),
    fullDescription: z.string().trim().max(2000).nullable(),
    price: z.number().positive("Preço deve ser maior que zero").nullable(),
    oldPrice: z.number().positive().nullable(),
    installmentText: z.string().trim().max(60).nullable(),
    images: z.array(z.string().trim().min(1)).max(8, "Máximo de 8 fotos"),
    availableSizes: z.array(z.string().trim().min(1).max(12)).max(20),
    colors: z.array(colorSchema).max(12),
    stockStatus: z.enum(["available", "low_stock", "out_of_stock", "on_request"]),
    material: z.string().trim().max(80).nullable(),
    fit: z.string().trim().max(40).nullable(),
    featured: z.boolean(),
    newArrival: z.boolean(),
    // ── Controle de estoque (migration 0002) ────────────────────────────────
    saleMode: z.enum(["in_stock", "on_request", "both"]),
    trackStock: z.boolean(),
    stockType: z.enum(["single", "per_variant"]),
    minimumStock: z.number().int().min(0).max(99999),
    allowNegativeStock: z.boolean(),
    // O saldo NÃO viaja aqui: combinação nova traz um estoque inicial (vira
    // movimentação); as existentes só atualizam mínimo/ativo.
    variants: z
      .array(
        z.object({
          size: z.string().trim().min(1).max(12).nullable(),
          color: z.string().trim().min(1).max(30).nullable(),
          minimumStock: z.number().int().min(0).max(99999),
          isActive: z.boolean(),
          initialQuantity: z.number().int().min(0).max(999999),
        })
      )
      .max(21 * 13),
  })
  .refine(
    (d) => d.oldPrice == null || d.price == null || d.oldPrice > d.price,
    {
      path: ["oldPrice"],
      message:
        'Oferta honesta: o preço "de" precisa ser maior que o preço atual — ou deixe o campo vazio.',
    }
  );

export type ProductInput = z.infer<typeof productSchema>;

function toRow(data: ProductInput) {
  return {
    name: data.name,
    brand: data.brand,
    category: data.category,
    short_description: data.shortDescription,
    full_description: data.fullDescription,
    price: data.price,
    old_price: data.oldPrice,
    installment_text: data.installmentText,
    images: data.images,
    thumbnail: data.images[0] ?? "",
    available_sizes: data.availableSizes,
    colors: data.colors,
    stock_status: stockStatusForRow(data),
    material: data.material,
    fit: data.fit,
    featured: data.featured,
    new_arrival: data.newArrival,
    track_stock: data.trackStock,
    stock_type: data.stockType,
    minimum_stock: data.minimumStock,
    sale_mode: data.saleMode,
    allow_negative_stock: data.allowNegativeStock,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Disponibilidade gravada junto com a linha. Com controle de estoque o valor
 * manual é só provisório — refresh_product_stock_status corrige em seguida.
 * Sem controle, encomenda pura força on_request (coerência sem UI extra).
 */
function stockStatusForRow(data: ProductInput) {
  if (!data.trackStock && data.saleMode === "on_request") return "on_request";
  return data.stockStatus;
}

/** Slug único: acrescenta -2, -3... enquanto houver conflito. */
async function uniqueSlug(
  supabase: AdminClient,
  base: string,
  ignoreId?: string
): Promise<string> {
  const root = slugify(base) || "produto";
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    let query = supabase.from("products").select("id").eq("slug", candidate).limit(1);
    if (ignoreId) query = query.neq("id", ignoreId);
    const { data } = await query;
    if (!data || data.length === 0) return candidate;
  }
  return `${root}-${Date.now()}`;
}

/** Próximo código interno PRG-XXXX. */
async function nextProductCode(supabase: AdminClient): Promise<string> {
  const { data } = await supabase
    .from("products")
    .select("product_code")
    .like("product_code", "PRG-%")
    .order("product_code", { ascending: false })
    .limit(1);
  const last = data?.[0]?.product_code ?? "PRG-0000";
  const n = Number(last.replace(/\D/g, "")) + 1;
  return `PRG-${String(n).padStart(4, "0")}`;
}

type VariantRowLite = {
  id: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
};

/**
 * Sincroniza product_variants com o cadastro. O saldo NUNCA é escrito aqui:
 * combinação nova nasce zerada e o estoque inicial entra como movimentação
 * (register_stock_movement) — o histórico registra até o primeiro saldo.
 * Combinações removidas do cadastro: delete; com histórico (FK), desativa.
 * Com trackStock desligado nada é tocado — religar reencontra tudo intacto.
 */
async function syncVariants(
  supabase: AdminClient,
  productId: string,
  productCode: string,
  data: ProductInput,
  userEmail: string
): Promise<void> {
  if (!data.trackStock) return;

  const key = (size: string | null, color: string | null) => `${size ?? ""}|${color ?? ""}`;

  // Combinações desejadas na ordem do cadastro; estoque único = linha nula.
  const wanted = new Map(
    (data.stockType === "single"
      ? [{ size: null, color: null, minimumStock: data.minimumStock, isActive: true, initialQuantity: data.variants[0]?.initialQuantity ?? 0 }]
      : data.variants
    ).map((v) => [key(v.size, v.color), v])
  );

  const { data: existingRows, error: readError } = await supabase
    .from("product_variants")
    .select("id, size, color, stock_quantity")
    .eq("product_id", productId);
  if (readError) throw new Error(migrationHint(readError.message));
  const existing = new Map(
    ((existingRows ?? []) as VariantRowLite[]).map((row) => [key(row.size, row.color), row])
  );

  // SKUs já usados no produto continuam valendo; os novos desviam deles.
  const taken = new Set<string>();

  for (const [combo, desired] of wanted) {
    const found = existing.get(combo);
    if (found) {
      const { error } = await supabase
        .from("product_variants")
        .update({ minimum_stock: desired.minimumStock, is_active: desired.isActive })
        .eq("id", found.id);
      if (error) throw new Error(error.message);
      continue;
    }
    const sku = buildVariantSku(productCode, desired.size, desired.color, taken);
    const { data: created, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        size: desired.size,
        color: desired.color,
        sku,
        stock_quantity: 0,
        minimum_stock: desired.minimumStock,
        is_active: desired.isActive,
      })
      .select("id")
      .single();
    if (error) throw new Error(migrationHint(error.message));
    if (desired.initialQuantity > 0) {
      const { error: rpcError } = await supabase.rpc("register_stock_movement", {
        p_variant_id: created.id,
        p_movement_type: "entry",
        p_quantity: desired.initialQuantity,
        p_reason: "inventory_adjustment",
        p_notes: "Estoque inicial do cadastro",
        p_user_email: userEmail,
      });
      if (rpcError) throw new Error(rpcError.message);
    }
  }

  // Removidas do cadastro: apaga; com movimentações (FK 23503), só desativa.
  for (const [combo, row] of existing) {
    if (wanted.has(combo)) continue;
    const { error } = await supabase.from("product_variants").delete().eq("id", row.id);
    if (error) {
      const { error: updateError } = await supabase
        .from("product_variants")
        .update({ is_active: false })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
    }
  }

  const { error: refreshError } = await supabase.rpc("refresh_product_stock_status", {
    p_product_id: productId,
  });
  if (refreshError) throw new Error(refreshError.message);
}

/** Erro de tabela/coluna inexistente vira instrução acionável. */
function migrationHint(message: string): string {
  return /does not exist|schema cache/i.test(message)
    ? `${message} — rode supabase/migrations/0002_estoque.sql no SQL Editor (docs/admin.md).`
    : message;
}

export async function createProduct(
  input: ProductInput
): Promise<ActionResult & { id?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const data = productSchema.parse(input);
    const slug = await uniqueSlug(supabase, data.name);
    const productCode = await nextProductCode(supabase);

    const { data: row, error } = await supabase
      .from("products")
      .insert({ ...toRow(data), slug, product_code: productCode })
      .select("id")
      .single();
    if (error) throw new Error(migrationHint(error.message));

    await syncVariants(supabase, row.id, productCode, data, user.email ?? "");

    bumpCatalog();
    return { ok: true, id: row.id };
  } catch (e) {
    return fail(e);
  }
}

export async function saveProduct(
  id: string,
  input: ProductInput
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();
    const data = productSchema.parse(input);

    const { data: row, error } = await supabase
      .from("products")
      .update(toRow(data))
      .eq("id", id)
      .select("product_code")
      .single();
    if (error) throw new Error(migrationHint(error.message));

    await syncVariants(supabase, id, row.product_code, data, user.email ?? "");

    bumpCatalog();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Arquivar tira da vitrine sem apagar; restaurar devolve. */
export async function setArchived(id: string, archived: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("products")
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) throw new Error(error.message);
    bumpCatalog();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      // FK RESTRICT de stock_movements: o histórico é registro contábil.
      if (error.code === "23503") {
        throw new Error(
          "Este produto tem histórico de estoque — use Arquivar para tirá-lo da vitrine preservando o registro."
        );
      }
      throw new Error(error.message);
    }
    bumpCatalog();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Cópia nasce arquivada (fora da vitrine) para ser editada com calma. */
export async function duplicateProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const { data: original, error: readError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (readError || !original) throw new Error(readError?.message ?? "Produto não encontrado.");

    const { id: _id, created_at: _c, updated_at: _u, ...rest } = original;
    const name = `${original.name} (cópia)`;
    const slug = await uniqueSlug(supabase, name);
    const productCode = await nextProductCode(supabase);

    // Cópia com controle de estoque nasce ZERADA (regra do proprietário):
    // o status copiado mentiria, então já grava o derivado do saldo zero.
    const stockStatus = original.track_stock
      ? original.sale_mode === "in_stock"
        ? "out_of_stock"
        : "on_request"
      : rest.stock_status;

    const { data: copy, error } = await supabase
      .from("products")
      .insert({
        ...rest,
        name,
        slug,
        product_code: productCode,
        stock_status: stockStatus,
        archived_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // Espelha as variações do original com saldo zero e SKU do novo código.
    if (original.track_stock) {
      const { data: variants, error: variantsError } = await supabase
        .from("product_variants")
        .select("size, color, minimum_stock, is_active")
        .eq("product_id", id);
      if (variantsError) throw new Error(migrationHint(variantsError.message));
      if (variants && variants.length > 0) {
        const taken = new Set<string>();
        const rows = variants.map((v) => ({
          product_id: copy.id,
          size: v.size,
          color: v.color,
          sku: buildVariantSku(productCode, v.size, v.color, taken),
          stock_quantity: 0,
          minimum_stock: v.minimum_stock,
          is_active: v.is_active,
        }));
        const { error: insertError } = await supabase.from("product_variants").insert(rows);
        if (insertError) throw new Error(insertError.message);
      }
    }

    bumpCatalog();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function uploadProductImage(
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  try {
    await requireUser();

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    const url = supabaseUrl();
    if (!serviceKey || !url) {
      return {
        ok: false,
        error:
          "Upload indisponível: configure SUPABASE_SERVICE_ROLE_KEY no servidor. Enquanto isso, cole a URL de uma imagem.",
      };
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Selecione um arquivo de imagem." };
    }
    if (file.size > 8 * 1024 * 1024) {
      return { ok: false, error: "Imagem muito grande (máx. 8 MB)." };
    }
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
      return { ok: false, error: "Formato não suportado — use JPG, PNG, WEBP ou AVIF." };
    }

    const storage = createClient(url, serviceKey, {
      auth: { persistSession: false },
    }).storage.from("produtos");

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${Date.now()}-${slugify(file.name.replace(/\.\w+$/, "")) || "produto"}.${ext}`;

    const { error } = await storage.upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
    });
    if (error) throw new Error(error.message);

    return { ok: true, url: storage.getPublicUrl(path).data.publicUrl };
  } catch (e) {
    return fail(e);
  }
}
