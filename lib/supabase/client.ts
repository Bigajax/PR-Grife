"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Cliente Supabase do navegador — usado no login e na troca de senha do admin.
 *
 * `remember`: controla a persistência da sessão.
 *  - true (padrão): a sessão dura ~1 ano — o admin segue conectado neste
 *    dispositivo mesmo fechando o navegador ("Manter conectado").
 *  - false: usa cookie de sessão — o login é encerrado ao fechar o navegador.
 */
export function supabaseBrowser(remember = true) {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey(), {
    cookieOptions: {
      // undefined = cookie de sessão (encerra ao fechar o navegador)
      maxAge: remember ? 60 * 60 * 24 * 365 : undefined,
    },
  });
}
