"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

export type CustomerProfile = {
  full_name: string | null;
  phone: string | null;
};

export type CustomerAddress = {
  postal_code: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

export type QuoteRequestItem = {
  id: string;
  name: string;
  quantity: number;
  sku?: string;
};

export type QuoteRequest = {
  id: string;
  store_cnpj: string;
  store_name: string;
  items: QuoteRequestItem[];
  status: string;
  created_at: string;
};

/** Código do Postgres para "a tabela não existe" (undefined_table). */
const UNDEFINED_TABLE = "42P01";

export type TableResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "not-configured" | "error"; message: string };

function isUndefinedTableError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: string }).code === UNDEFINED_TABLE);
}

export async function fetchProfile(supabase: SupabaseClient, userId: string): Promise<TableResult<CustomerProfile | null>> {
  const { data, error } = await supabase.from("profiles").select("full_name, phone").eq("id", userId).maybeSingle();
  if (error) {
    if (isUndefinedTableError(error)) return { ok: false, reason: "not-configured", message: "A tabela profiles ainda não foi criada." };
    return { ok: false, reason: "error", message: error.message };
  }
  return { ok: true, data };
}

export async function saveProfile(supabase: SupabaseClient, userId: string, profile: CustomerProfile): Promise<TableResult<null>> {
  const { error } = await supabase.from("profiles").upsert({ id: userId, ...profile });
  if (error) {
    if (isUndefinedTableError(error)) return { ok: false, reason: "not-configured", message: "A tabela profiles ainda não foi criada." };
    return { ok: false, reason: "error", message: error.message };
  }
  return { ok: true, data: null };
}

export async function fetchDefaultAddress(supabase: SupabaseClient, userId: string): Promise<TableResult<CustomerAddress | null>> {
  const { data, error } = await supabase
    .from("addresses")
    .select("postal_code, street, number, complement, district, city, state")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();
  if (error) {
    if (isUndefinedTableError(error)) return { ok: false, reason: "not-configured", message: "A tabela addresses ainda não foi criada." };
    return { ok: false, reason: "error", message: error.message };
  }
  return { ok: true, data: data ? { ...data, complement: data.complement ?? "" } : null };
}

export async function saveDefaultAddress(supabase: SupabaseClient, userId: string, address: CustomerAddress): Promise<TableResult<null>> {
  const { data: existing, error: fetchError } = await supabase
    .from("addresses")
    .select("id")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();
  if (fetchError) {
    if (isUndefinedTableError(fetchError)) return { ok: false, reason: "not-configured", message: "A tabela addresses ainda não foi criada." };
    return { ok: false, reason: "error", message: fetchError.message };
  }

  const payload = { ...address, user_id: userId, is_default: true };
  const { error } = existing
    ? await supabase.from("addresses").update(payload).eq("id", existing.id)
    : await supabase.from("addresses").insert(payload);

  if (error) return { ok: false, reason: "error", message: error.message };
  return { ok: true, data: null };
}

export async function fetchQuoteRequests(supabase: SupabaseClient, userId: string): Promise<TableResult<QuoteRequest[]>> {
  const { data, error } = await supabase
    .from("quote_requests")
    .select("id, store_cnpj, store_name, items, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    if (isUndefinedTableError(error)) return { ok: false, reason: "not-configured", message: "A tabela quote_requests ainda não foi criada." };
    return { ok: false, reason: "error", message: error.message };
  }
  return { ok: true, data: data ?? [] };
}

export async function createQuoteRequest(
  supabase: SupabaseClient,
  userId: string,
  quote: { store_cnpj: string; store_name: string; items: QuoteRequestItem[] },
): Promise<TableResult<null>> {
  const { error } = await supabase.from("quote_requests").insert({ user_id: userId, ...quote });
  if (error) {
    if (isUndefinedTableError(error)) return { ok: false, reason: "not-configured", message: "A tabela quote_requests ainda não foi criada." };
    return { ok: false, reason: "error", message: error.message };
  }
  return { ok: true, data: null };
}
