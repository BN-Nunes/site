import type { Metadata } from "next";
import { headers } from "next/headers";
import { CartProvider } from "./CartContext";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const image = new URL("/og.png", base).toString();

  return {
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
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><CartProvider>{children}</CartProvider></body></html>;
}
