"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { PRODUCTS_TAG } from "@/lib/products/db";
import { entryReasons, exitReasons } from "@/lib/stock";
import type { StockMovement } from "@/types";

/**
 * Movimentações de estoque. A escrita é 100% delegada à função SQL
 * register_stock_movement (migration 0002): trava a variação, valida saldo,
 * grava o movimento com o responsável e recalcula a disponibilidade — tudo
 * numa transação. Aqui só validamos o input e revalidamos a vitrine.
 */

async function requireUser() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada — entre novamente no painel.");
  return { supabase, user };
}

function bumpCatalog() {
  revalidateTag(PRODUCTS_TAG, { expire: 0 });
}

function friendly(message: string): string {
  return /does not exist|schema cache|Could not find the function/i.test(message)
    ? `${message} — rode supabase/migrations/0002_estoque.sql no SQL Editor (docs/admin.md).`
    : message;
}

const reasonIds = (list: { id: string }[]) => list.map((r) => r.id) as [string, ...string[]];

const movementSchema = z
  .object({
    variantId: z.string().uuid("Escolha a variação."),
    type: z.enum(["entry", "exit"]),
    quantity: z.number().int().min(1, "Quantidade deve ser maior que zero.").max(999999),
    reason: z.string(),
    notes: z.string().trim().max(300).nullable(),
  })
  .refine(
    (d) =>
      (d.type === "entry" ? reasonIds(entryReasons) : reasonIds(exitReasons)).includes(d.reason),
    { path: ["reason"], message: "Escolha um motivo válido." }
  );

export type MovementInput = z.infer<typeof movementSchema>;

export type MovementResult =
  | { ok: true; balance: number }
  | { ok: false; error: string };

export async function registerMovement(input: MovementInput): Promise<MovementResult> {
  try {
    const { supabase, user } = await requireUser();
    const data = movementSchema.parse(input);

    const { data: balance, error } = await supabase.rpc("register_stock_movement", {
      p_variant_id: data.variantId,
      p_movement_type: data.type,
      p_quantity: data.quantity,
      p_reason: data.reason,
      p_notes: data.notes,
      p_user_email: user.email ?? "",
    });
    if (error) throw new Error(friendly(error.message));

    bumpCatalog();
    return { ok: true, balance: balance as number };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Não foi possível registrar a movimentação.",
    };
  }
}

type MovementRow = {
  id: string;
  product_id: string;
  variant_id: string;
  movement_type: "entry" | "exit";
  reason: string;
  quantity: number;
  previous_quantity: number;
  balance_after: number;
  notes: string | null;
  user_email: string;
  created_at: string;
  product_variants: { size: string | null; color: string | null; sku: string } | null;
  products?: { name: string; product_code: string } | null;
};

function mapMovementRow(row: MovementRow): StockMovement & { productName?: string; productCode?: string } {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    movementType: row.movement_type,
    reason: row.reason,
    quantity: row.quantity,
    previousQuantity: row.previous_quantity,
    balanceAfter: row.balance_after,
    notes: row.notes ?? undefined,
    userEmail: row.user_email,
    createdAt: row.created_at,
    variant: row.product_variants
      ? {
          size: row.product_variants.size ?? undefined,
          color: row.product_variants.color ?? undefined,
          sku: row.product_variants.sku,
        }
      : undefined,
    productName: row.products?.name,
    productCode: row.products?.product_code,
  };
}

export type GlobalMovement = ReturnType<typeof mapMovementRow>;

export type GlobalMovementsResult =
  | { ok: true; movements: GlobalMovement[] }
  | { ok: false; error: string };

/** Histórico global do painel (página Movimentações), mais recente primeiro. */
export async function fetchAllMovements(): Promise<GlobalMovementsResult> {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("stock_movements")
      .select("*, product_variants(size, color, sku), products(name, product_code)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(friendly(error.message));
    return { ok: true, movements: ((data ?? []) as MovementRow[]).map(mapMovementRow) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Não foi possível carregar as movimentações.",
    };
  }
}

export type MovementsResult =
  | { ok: true; movements: StockMovement[] }
  | { ok: false; error: string };

/** Histórico do produto, mais recente primeiro (últimos 100). */
export async function fetchMovements(productId: string): Promise<MovementsResult> {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("stock_movements")
      .select("*, product_variants(size, color, sku)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(friendly(error.message));

    const movements = ((data ?? []) as MovementRow[]).map((row) => ({
      id: row.id,
      productId: row.product_id,
      variantId: row.variant_id,
      movementType: row.movement_type,
      reason: row.reason,
      quantity: row.quantity,
      previousQuantity: row.previous_quantity,
      balanceAfter: row.balance_after,
      notes: row.notes ?? undefined,
      userEmail: row.user_email,
      createdAt: row.created_at,
      variant: row.product_variants
        ? {
            size: row.product_variants.size ?? undefined,
            color: row.product_variants.color ?? undefined,
            sku: row.product_variants.sku,
          }
        : undefined,
    }));
    return { ok: true, movements };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Não foi possível carregar o histórico.",
    };
  }
}
