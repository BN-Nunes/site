import type { Metadata } from "next";
import { AccountClient } from "./AccountClient";
import { canonicalUrl } from "../lib/site-config";

export const metadata: Metadata = {
  title: "Minha conta | Impakto Festas",
  description: "Crie sua conta ou acesse sua área de cliente na Impakto Festas.",
  alternates: { canonical: canonicalUrl("/conta") },
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="account-main" id="conteudo">
      <section className="account-hero"><div className="container account-hero-grid"><div><span className="eyebrow">Área do cliente</span><h1>Sua festa e sua conta <strong>em um só lugar.</strong></h1><p>Crie seu acesso para preencher orçamentos mais rápido e acompanhar o histórico dos pedidos enviados pelo WhatsApp.</p></div><div className="account-brand-art" aria-hidden="true"><img src="/impakto-identity.webp" alt="" width={700} height={700} decoding="async" /></div></div></section>
      <section className="account-content section"><div className="container"><AccountClient /></div></section>
    </main>
  );
}
