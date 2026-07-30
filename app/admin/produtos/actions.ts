"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseUrl } from "@/lib/supabase/env";
import { PRODUCTS_TAG } from "@/lib/products/db";
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
  return supabase;
}

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
    stock_status: data.stockStatus,
    material: data.material,
    fit: data.fit,
    featured: data.featured,
    new_arrival: data.newArrival,
    updated_at: new Date().toISOString(),
  };
}

/** Slug único: acrescenta -2, -3... enquanto houver conflito. */
async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof requireUser>>,
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
async function nextProductCode(
  supabase: Awaited<ReturnType<typeof requireUser>>
): Promise<string> {
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

export async function createProduct(
  input: ProductInput
): Promise<ActionResult & { id?: string }> {
  try {
    const supabase = await requireUser();
    const data = productSchema.parse(input);
    const slug = await uniqueSlug(supabase, data.name);
    const productCode = await nextProductCode(supabase);

    const { data: row, error } = await supabase
      .from("products")
      .insert({ ...toRow(data), slug, product_code: productCode })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

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
    const supabase = await requireUser();
    const data = productSchema.parse(input);

    const { error } = await supabase.from("products").update(toRow(data)).eq("id", id);
    if (error) throw new Error(error.message);

    bumpCatalog();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Arquivar tira da vitrine sem apagar; restaurar devolve. */
export async function setArchived(id: string, archived: boolean): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
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
    const supabase = await requireUser();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    bumpCatalog();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Cópia nasce arquivada (fora da vitrine) para ser editada com calma. */
export async function duplicateProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
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

    const { error } = await supabase.from("products").insert({
      ...rest,
      name,
      slug,
      product_code: productCode,
      archived_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);

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
