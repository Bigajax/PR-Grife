import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Cliente Supabase de servidor com a sessão do admin (via cookies).
 * Usar SOMENTE no painel (layout, Server Actions) — a vitrine usa o cliente
 * anon puro de lib/products/db.ts para não quebrar o cache.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Chamado de um Server Component: o middleware renova a sessão.
        }
      },
    },
  });
}
