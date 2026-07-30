import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Painel da loja | PR Grife",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Sem Supabase configurado, criar o cliente lançaria erro — deixa o login
  // renderizar o aviso de setup (docs/admin.md).
  if (!supabaseConfigured()) {
    return <div className="min-h-screen bg-bg-surface">{children}</div>;
  }

  // Defesa dupla com o middleware: sem sessão, renderiza só o conteúdo
  // (a página de login), sem o chrome do painel.
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="min-h-screen bg-bg-surface">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-bg-surface lg:grid lg:grid-cols-[230px_1fr]">
      <aside className="sticky top-0 z-40 bg-text-primary lg:static lg:min-h-screen">
        <AdminNav userEmail={user.email ?? ""} />
      </aside>
      <main className="p-4 pb-16 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
