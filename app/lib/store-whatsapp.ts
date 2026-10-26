import type { Store } from "../lojas/stores.ts";
import { siteContacts } from "./site-contacts.ts";

/** "5511973540454" → "(11) 97354-0454". */
export function formatWhatsappNumber(e164: string): string {
  const local = e164.startsWith("55") ? e164.slice(2) : e164;
  const ddd = local.slice(0, 2);
  const number = local.slice(2);
  return `(${ddd}) ${number.slice(0, -4)}-${number.slice(-4)}`;
}

/**
 * Link para falar com a filial pelo WhatsApp, com a mensagem já dizendo de qual
 * loja o cliente quer atendimento. Filiais sem número próprio caem na central,
 * que encaminha o contato (`direct: false`).
 */
export function storeWhatsappLink(store: Store): { url: string; direct: boolean; display: string } {
  const phone = store.whatsapp ?? siteContacts.whatsapp.numberE164;
  const message = `Olá! Vim pelo site da Impakto Festas e gostaria de falar com a loja Impakto ${store.name}.`;
  return {
    url: `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`,
    direct: Boolean(store.whatsapp),
    display: formatWhatsappNumber(phone),
  };
}
