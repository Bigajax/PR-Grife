"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseUrl } from "@/lib/supabase/env";
import { actionErrorMessage } from "@/lib/action-error";

/**
 * Gestão de usuários do painel via API administrativa do Supabase Auth.
 * Exige a service role (só servidor). Toda action confere a sessão antes —
 * só quem já está logado no painel mexe em acessos.
 */

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada — entre novamente no painel.");
  return user;
}

function adminAuth() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const url = supabaseUrl();
  if (!serviceKey || !url) {
    throw new Error(
      "Gestão de usuários indisponível: configure SUPABASE_SERVICE_ROLE_KEY no servidor."
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } }).auth.admin;
}

function fail(e: unknown, input?: unknown): ActionResult {
  return {
    ok: false,
    error: actionErrorMessage(e, input, "Não foi possível concluir agora."),
  };
}

const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72);

export async function setUserPassword(
  userId: string,
  password: string
): Promise<ActionResult> {
  try {
    await requireUser();
    const pw = passwordSchema.parse(password);
    const { error } = await adminAuth().updateUserById(userId, { password: pw });
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (e) {
    return fail(e, password);
  }
}

export async function createUser(
  email: string,
  password: string
): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = z
      .object({ email: z.string().trim().email("E-mail inválido."), pw: passwordSchema })
      .parse({ email, pw: password });
    const { error } = await adminAuth().createUser({
      email: parsed.email,
      password: parsed.pw,
      email_confirm: true, // sem fluxo de e-mail: o acesso já nasce ativo
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (e) {
    return fail(e, { email, pw: password });
  }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    const me = await requireUser();
    if (me.id === userId) {
      return { ok: false, error: "Você não pode remover o próprio acesso." };
    }
    const { error } = await adminAuth().deleteUser(userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
