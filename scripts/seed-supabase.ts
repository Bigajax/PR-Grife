/**
 * Seed do catálogo: envia data/products.ts para a tabela products do Supabase.
 *
 * Uso: npm run seed  (exige .env.local com NEXT_PUBLIC_SUPABASE_URL e
 * SUPABASE_SERVICE_ROLE_KEY — a service role ignora RLS e NUNCA deve ir
 * para o navegador).
 *
 * Idempotente: upsert por slug. Re-rodar sobrescreve edições feitas no
 * painel para os produtos que existem no arquivo estático.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { products } from "../data/products";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltam variáveis de ambiente. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local (ver .env.example)."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log(`Enviando ${products.length} produtos para ${url}...`);

  for (const p of products) {
    const { error } = await supabase.from("products").upsert(
      {
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        category: p.category,
        short_description: p.shortDescription,
        full_description: p.fullDescription ?? null,
        price: p.price ?? null,
        old_price: p.oldPrice ?? null,
        installment_text: p.installmentText ?? null,
        payment_override: p.paymentOverride ?? null,
        images: p.images,
        thumbnail: p.thumbnail,
        available_sizes: p.availableSizes,
        colors: p.availableColors,
        stock_status: p.stockStatus,
        badges: p.badges ?? [],
        product_code: p.productCode,
        material: p.material ?? null,
        fit: p.fit ?? null,
        featured: p.featured ?? false,
        new_arrival: p.newArrival ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`✗ ${p.slug}: ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    console.log(`✓ ${p.slug}`);
  }

  console.log("Seed concluído.");
}

main();
