const PRODUCTION_SITE_URL = "https://impakto-festas.vercel.app";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configured && configured.length > 0 ? configured.replace(/\/$/, "") : PRODUCTION_SITE_URL;
}

export function canonicalUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${path}`;
}
