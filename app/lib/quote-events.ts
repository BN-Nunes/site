import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "../CartContext";
import type { Store } from "../lojas/stores";

/**
 * Linha da tabela `quote_events`: para qual loja foi o orçamento e o que foi pedido.
 * Não leva nada que identifique o cliente — nem nome, nem observações, nem conta.
 */
export type QuoteEvent = {
  store_cnpj: string;
  store_name: string;
  signed_in: boolean;
  items: Array<{ id: string; sku?: string; name: string; department: string; quantity: number }>;
};

export function buildQuoteEvent(store: Store, items: CartItem[], signedIn: boolean): QuoteEvent {
  return {
    store_cnpj: store.cnpj,
    store_name: store.name,
    signed_in: signedIn,
    items: items.map((item) => ({ id: item.id, sku: item.sku, name: item.name, department: item.department, quantity: item.quantity })),
  };
}

/**
 * Registra o envio na estatística de orçamentos por loja e por produto (`supabase/migrations/20261027_quote_events.sql`).
 * O resultado é ignorado de propósito: a estatística nunca pode atrapalhar o envio pelo WhatsApp,
 * e a tabela pode ainda não ter sido criada.
 */
export async function recordQuoteEvent(supabase: SupabaseClient, event: QuoteEvent): Promise<void> {
  await supabase.from("quote_events").insert(event);
}
