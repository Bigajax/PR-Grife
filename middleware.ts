import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Protege o painel /admin: sem sessão, redireciona para /admin/login.
 * Também renova o token da sessão a cada request (padrão @supabase/ssr).
 *
 * À prova de falhas: variáveis ausentes ou erro de rede NUNCA derrubam a
 * página com 500 — o pior caso é ser tratado como "sem sessão".
 */
export async function middleware(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === "/admin/login";
  const toLogin = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  };

  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    // Ambiente sem configuração (ex.: envs faltando na Vercel): deixa o
    // login abrir — ele mostra o erro real — e bloqueia o resto do painel.
    return isLogin ? NextResponse.next({ request }) : toLogin();
  }

  try {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isLogin) return toLogin();

    if (user && isLogin) {
      const home = request.nextUrl.clone();
      home.pathname = "/admin";
      home.search = "";
      return NextResponse.redirect(home);
    }

    return response;
  } catch {
    // Falha inesperada (rede, token corrompido): trata como sem sessão.
    return isLogin ? NextResponse.next({ request }) : toLogin();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
