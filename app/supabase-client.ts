import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function readSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  return { url, publishableKey };
}

export function isSupabaseConfigured() {
  const { url, publishableKey } = readSupabaseConfig();
  return Boolean(url && publishableKey && !url.includes("SEU-PROJETO") && !publishableKey.includes("SUA_CHAVE"));
}

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { url, publishableKey } = readSupabaseConfig();
  if (!url || !publishableKey || url.includes("SEU-PROJETO") || publishableKey.includes("SUA_CHAVE")) return null;

  browserClient = createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
