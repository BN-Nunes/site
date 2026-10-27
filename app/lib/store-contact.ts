import { storeAddress, type Store } from "../lojas/stores.ts";
import { siteContacts } from "./site-contacts.ts";

/** "5511973540454" → "(11) 97354-0454"; "551146155083" → "(11) 4615-5083". */
export function formatPhoneNumber(e164: string): string {
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
    display: formatPhoneNumber(phone),
  };
}

function storeMapsQuery(store: Store): string {
  return `Impakto Festas ${storeAddress(store)}`;
}

/** Busca da loja no Google Maps, de onde o cliente traça a rota. */
export function storeMapsUrl(store: Store): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeMapsQuery(store))}`;
}

/** A mesma busca em formato de mapa incorporado (iframe), que só é carregado quando o visitante pede. */
export function storeMapEmbedUrl(store: Store): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(storeMapsQuery(store))}&output=embed`;
}

/** Link `tel:` do telefone fixo da filial, ou `null` quando a loja não divulga um. */
export function storePhoneLink(store: Store): { href: string; display: string } | null {
  if (!store.phone) return null;
  return { href: `tel:+${store.phone}`, display: formatPhoneNumber(store.phone) };
}
