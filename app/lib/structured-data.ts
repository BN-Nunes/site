import type { Department, Product } from "../departamentos/departments";
import type { Store } from "../lojas/stores";
import { getSiteUrl } from "./site-config";
import { siteContacts } from "./site-contacts";

export function organizationJsonLd() {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteContacts.tradeName,
    url: base,
    logo: `${base}/impakto-logo.png`,
    email: siteContacts.sac.email,
    sameAs: [siteContacts.instagram.url],
  };
}

export function storeJsonLd(store: Store) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: `${siteContacts.tradeName} ${store.name}`,
    taxID: store.cnpj,
    url: `${base}/lojas`,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${store.street}, ${store.number}`,
      addressLocality: store.city,
      addressRegion: store.state,
      postalCode: store.cep,
      addressCountry: "BR",
    },
    ...(store.whatsapp ? { telephone: `+${store.whatsapp}` } : {}),
  };
}

export function breadcrumbJsonLd(department: Department) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: base },
      { "@type": "ListItem", position: 2, name: "Departamentos", item: `${base}/#categorias` },
      { "@type": "ListItem", position: 3, name: department.name, item: `${base}/departamentos/${department.slug}` },
    ],
  };
}

/**
 * Descreve o produto em si, sem preço/estoque/avaliações — o modelo comercial
 * é orçamento por WhatsApp, não venda direta pelo site, então não há preço
 * fixo real para declarar em uma `Offer`.
 */
export function productJsonLd(product: Product, department: Department) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    ...(product.sku ? { sku: product.sku } : {}),
    image: `${base}${product.image}`,
    category: department.name,
    brand: { "@type": "Brand", name: siteContacts.tradeName },
  };
}
