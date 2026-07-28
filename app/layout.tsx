import type { Metadata } from "next";
import Script from "next/script";
import { CartProvider } from "./CartContext";
import { CookieNotice } from "./CookieNotice";
import { getSiteUrl } from "./lib/site-config";
import "./globals.css";
import "./cookies.css";

const base = new URL(getSiteUrl());
const image = new URL("/og.png", base).toString();

export const metadata: Metadata = {
  metadataBase: base,
  title: "Impakto Festas | Tudo para sua comemoração",
  description: "Balões, temas, confeitaria, descartáveis e decoração para transformar qualquer momento em festa.",
  openGraph: {
    title: "Impakto Festas | Tudo para sua comemoração",
    description: "Variedade, preço justo e entrega para todo o Brasil.",
    type: "website",
    images: [{ url: image, width: 1792, height: 939, alt: "Impakto Festas — tudo para transformar qualquer momento em festa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Impakto Festas | Tudo para sua comemoração",
    description: "Variedade, preço justo e entrega para todo o Brasil.",
    images: [image],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" suppressHydrationWarning><head><Script src="/theme-init.js" strategy="beforeInteractive" /></head><body><CartProvider>{children}<CookieNotice /></CartProvider></body></html>;
}
