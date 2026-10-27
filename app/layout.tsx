import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { CartProvider } from "./CartContext";
import { CookieNotice } from "./CookieNotice";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { getSiteUrl } from "./lib/site-config";
import { stores } from "./lojas/stores";
import "@fontsource-variable/baloo-2";
import "@fontsource-variable/nunito";
import "./globals.css";
import "./cookies.css";

const base = new URL(getSiteUrl());
const image = new URL("/og-festas.png", base).toString();

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
    images: [{ url: image, width: 1200, height: 630, alt: `Impakto Festas — Realizando sonhos. Tudo para a sua festa em ${stores.length} lojas em São Paulo.` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Impakto Festas | Tudo para sua comemoração",
    description: "Variedade, preço justo e entrega para todo o Brasil.",
    images: [image],
  },
};

export const viewport: Viewport = {
  themeColor: "#2b1170",
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
        {/* Vercel Web Analytics: conta visitas sem cookies. O script só existe nos deploys da Vercel (fora dela daria 404). */}
        {process.env.VERCEL === "1" && <script defer src="/_vercel/insights/script.js" />}
      </body>
    </html>
  );
}
