export type Store = {
  name: string;
  cnpj: string;
  cep: string;
  street: string;
  number: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  /** WhatsApp da loja em E.164 sem símbolos (fonte: impaktofestas.com.br/institucional/nossas-lojas). Sem ele, o contato cai na central. */
  whatsapp?: string;
  /** Telefone fixo em E.164 sem símbolos, mesma fonte do WhatsApp. */
  phone?: string;
  /** Foto da fachada (do site oficial ou enviada pela equipe da loja), quando houver. */
  photo?: string;
};

export const stores: Store[] = [
  { name: "Barueri", cnpj: "11.588.752/0003-01", cep: "06402-215", street: "Av. Henriqueta Mendes Guerra", number: "826", city: "Barueri", state: "SP", lat: -23.5101669, lng: -46.8829016, whatsapp: "5511973540454", phone: "551146155083", photo: "/fotos/lojas/barueri.webp" },
  { name: "Cotia", cnpj: "11.588.752/0004-84", cep: "06713-100", street: "Estrada Municipal do Embu", number: "320", city: "Cotia", state: "SP", lat: -23.5996886, lng: -46.8588861, whatsapp: "5511940591588", photo: "/fotos/lojas/cotia.webp" },
  { name: "Alphaville", cnpj: "11.588.752/0005-65", cep: "06455-000", street: "Alameda Araguaia", number: "200", city: "Barueri", state: "SP", lat: -23.4993140, lng: -46.8594570, whatsapp: "5511989008816", phone: "551146154994", photo: "/fotos/lojas/alphaville.webp" },
  { name: "Guarulhos", cnpj: "11.588.752/0010-22", cep: "07095-007", street: "Rua Nossa Senhora Mãe dos Homens", number: "318", city: "Guarulhos", state: "SP", lat: -23.4609538, lng: -46.5358310, whatsapp: "5511910813960", phone: "551124429358", photo: "/fotos/lojas/guarulhos.webp" },
  { name: "Morumbi", cnpj: "11.588.752/0008-08", cep: "05640-004", street: "Av. Dr. Guilherme Dumont Villares", number: "2031", city: "São Paulo", state: "SP", lat: -23.6232826, lng: -46.7375340, whatsapp: "5511913727297", phone: "551146155061" },
  { name: "Perdizes", cnpj: "11.588.752/0012-94", cep: "05013-001", street: "Rua Cardoso de Almeida", number: "859", city: "São Paulo", state: "SP", lat: -23.5383571, lng: -46.6684487, whatsapp: "5511913727315", phone: "551146155132", photo: "/fotos/lojas/perdizes.webp" },
  { name: "Paraíso", cnpj: "11.588.752/0011-03", cep: "04005-003", street: "Rua Abílio Soares", number: "775", city: "São Paulo", state: "SP", lat: -23.5760422, lng: -46.6486672, whatsapp: "5511910358189", photo: "/fotos/lojas/paraiso.webp" },
  { name: "Indianópolis", cnpj: "11.588.752/0014-56", cep: "04089-002", street: "Alameda dos Maracatins", number: "1100", city: "São Paulo", state: "SP", lat: -23.6096219, lng: -46.6634809, whatsapp: "5511993635397", phone: "551147858825", photo: "/fotos/lojas/indianopolis.webp" },
  { name: "Santo André", cnpj: "11.588.752/0018-80", cep: "09040-160", street: "Av. Ramiro Colleoni", number: "103", city: "Santo André", state: "SP", lat: -23.6610283, lng: -46.5295920, whatsapp: "5511939413109", phone: "551146155138", photo: "/fotos/lojas/santo-andre.webp" },
  { name: "Guarulhos 3", cnpj: "11.588.752/0007-27", cep: "07031-009", street: "Av. Guarulhos", number: "1388", city: "Guarulhos", state: "SP", lat: -23.5042832, lng: -46.5520945, whatsapp: "5511939038457", phone: "551146154997", photo: "/fotos/lojas/guarulhos-3.webp" },
  { name: "Osasco", cnpj: "11.588.752/0009-99", cep: "06016-004", street: "Av. Dona Primitiva Vianco", number: "578", city: "Osasco", state: "SP", lat: -23.5334036, lng: -46.7755525 },
];

/** Endereço da página da loja: "Santo André" → "santo-andre", "Guarulhos 3" → "guarulhos-3". */
export function storeSlug(store: Store): string {
  return store.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getStore(slug: string): Store | undefined {
  return stores.find((store) => storeSlug(store) === slug);
}

export function storeAddress(store: Store) {
  return `${store.street}, ${store.number} — ${store.city}/${store.state}, CEP ${store.cep}`;
}
