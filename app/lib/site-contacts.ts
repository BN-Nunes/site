/**
 * Ponto único de verdade para números, e-mails e URLs institucionais usados
 * em várias páginas. Evita que o mesmo WhatsApp ou e-mail fique digitado em
 * lugares diferentes e possa divergir com o tempo.
 */
export const siteContacts = {
  tradeName: "Impakto Festas",
  whatsapp: {
    /** Número no formato E.164 (sem símbolos), usado para montar links de wa.me/api.whatsapp.com. */
    numberE164: "5511940591588",
    display: "(11) 94059-1588",
    baseUrl: "https://api.whatsapp.com/send?phone=5511940591588",
  },
  sac: {
    email: "sac@impakto.com.br",
    phoneE164: "5511939410125",
    phoneDisplay: "(11) 93941-0125",
  },
  instagram: {
    url: "https://www.instagram.com/impaktofestas/?hl=pt",
    handle: "@impaktofestas",
  },
  professionalSiteUrl: "https://www.impakto.com.br/",
  headquarters: {
    street: "Estr. do Embu, 320",
    district: "Jardim Torino",
    city: "Cotia",
    state: "SP",
    postalCode: "06713-100",
  },
} as const;

/** Monta um link do WhatsApp com uma mensagem pré-preenchida (URL-encoded). */
export function whatsappLinkWithMessage(message: string): string {
  return `${siteContacts.whatsapp.baseUrl}&text=${encodeURIComponent(message)}`;
}

/** Endereço da matriz em uma única linha, para exibição textual simples. */
export function formatHeadquartersAddress(): string {
  const { street, district, city, state, postalCode } = siteContacts.headquarters;
  return `${street}, ${district}, ${city} — ${state}, CEP ${postalCode}`;
}
