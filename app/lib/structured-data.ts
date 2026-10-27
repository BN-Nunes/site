import type { Department, Product } from "../departamentos/departments";
import { storeSlug, type Store } from "../lojas/stores";
import { getSiteUrl } from "./site-config";
import { siteContacts } from "./site-contacts";
import { storeMapsUrl } from "./store-contact";

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
  const url = `${base}/lojas/${storeSlug(store)}`;
  const telephone = store.phone ?? store.whatsapp;
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${url}#loja`,
    name: `${siteContacts.tradeName} ${store.name}`,
    taxID: store.cnpj,
    url,
    ...(store.photo ? { image: `${base}${store.photo}` } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${store.street}, ${store.number}`,
      addressLocality: store.city,
      addressRegion: store.state,
      postalCode: store.cep,
      addressCountry: "BR",
    },
    geo: { "@type": "GeoCoordinates", latitude: store.lat, longitude: store.lng },
    hasMap: storeMapsUrl(store),
    ...(telephone ? { telephone: `+${telephone}` } : {}),
    parentOrganization: { "@type": "Organization", name: siteContacts.tradeName, url: base },
  };
}

/** Trilha "Início › … › página atual"; cada item recebe o caminho da página, sem o domínio. */
export function breadcrumbJsonLd(trail: Array<{ name: string; path: string }>) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Início", path: "/" }, ...trail].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${base}${crumb.path}`,
    })),
  };
}

/**
 * Descreve o produto em si, sem preço/estoque/avaliações — o modelo comercial
 * é orçamento por WhatsApp, não venda direta pelo site, então não há preço
 * fixo real para declarar em uma `Offer`.
 */
export function productJsonLd(product: Product, department: Department) {
  const base = getSiteUrl();
  const image = product.image ? (product.image.startsWith("http") ? product.image : `${base}${product.image}`) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    ...(product.sku ? { sku: product.sku } : {}),
    ...(image ? { image } : {}),
    category: department.name,
    brand: { "@type": "Brand", name: siteContacts.tradeName },
  };
}
