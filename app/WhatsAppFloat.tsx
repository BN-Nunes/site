"use client";

import { usePathname } from "next/navigation";
import { siteContacts } from "./lib/site-contacts";

/** Atalho flutuante para o WhatsApp — escondido no carrinho, onde o envio do orçamento já é a ação principal. */
export function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname === "/carrinho") return null;

  return (
    <a className="whatsapp-float" href={siteContacts.whatsapp.baseUrl} target="_blank" rel="noreferrer" aria-label="Falar com a Impakto Festas pelo WhatsApp">
      <img src="/whatsapp-logo.png" alt="" width={200} height={200} decoding="async" />
    </a>
  );
}
