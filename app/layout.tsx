import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { CartProvider } from "./CartContext";
import { CookieNotice } from "./CookieNotice";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { getSiteUrl } from "./lib/site-config";
import "@fontsource-variable/inter";
import "./globals.css";
import "./cookies.css";

const base = new URL(getSiteUrl());
const image = new URL("/og.png", base).toString();

export const metadata: Metadata = {
  metadataBase: base,
  title: "Impakto Festas | Tudo para sua comemoração",
  description: "Balões, temas, confeitaria, descartáveis e decoração para transformar qualquer momento em festa.",
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Impakto Festas | Tudo para sua comemoração",
    description: "Variedade, preço justo e entrega para todo o Brasil.",
    type: "website",
    locale: "pt_BR",
    siteName: "Impakto Festas",
    images: [{ url: image, width: 1792, height: 939, alt: "Impakto Festas — tudo para transformar qualquer momento em festa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Impakto Festas | Tudo para sua comemoração",
    description: "Variedade, preço justo e entrega para todo o Brasil.",
    images: [image],
  },
};

export const viewport: Viewport = {
  themeColor: "#082c83",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <Script src="/reveal-init.js" strategy="beforeInteractive" />
      </head>
      <body>
        <CartProvider>
          <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
          <SiteHeader />
          {children}
          <SiteFooter />
          <WhatsAppFloat />
          <CookieNotice />
        </CartProvider>
      </body>
    </html>
  );
}
