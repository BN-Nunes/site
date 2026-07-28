import type { Metadata } from "next";
import Link from "next/link";
import { AccountClient } from "./AccountClient";
import { ThemeToggle } from "../ThemeToggle";
import { ManageCookiesLink } from "../ManageCookiesLink";
import { canonicalUrl } from "../lib/site-config";
import { siteContacts } from "../lib/site-contacts";

export const metadata: Metadata = {
  title: "Minha conta | Impakto Festas",
  description: "Crie sua conta ou acesse sua área de cliente na Impakto Festas.",
  alternates: { canonical: canonicalUrl("/conta") },
  robots: { index: false, follow: false },
};

const whatsapp = siteContacts.whatsapp.baseUrl;

export default function AccountPage() {
  return (
    <>
      <a className="skip-link" href="#minha-conta">Pular para minha conta</a>
      <div className="utility-bar"><span>Cadastro rápido e seguro</span><i aria-hidden="true" /><span>Sua conta Impakto em um só lugar</span><i aria-hidden="true" /><span>Atendimento especializado</span></div>
      <header className="account-header"><div className="container account-header-inner"><Link className="brand" href="/" aria-label="Voltar para o início"><img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" width={1056} height={321} /></Link><nav aria-label="Navegação da conta"><Link href="/">← Voltar para o início</Link><Link href="/lojas">Nossas lojas</Link><a href={whatsapp} target="_blank" rel="noreferrer">Precisa de ajuda?</a><ThemeToggle /></nav></div></header>
      <main className="account-main" id="minha-conta">
        <section className="account-hero"><div className="container account-hero-grid"><div><span className="eyebrow">Área do cliente</span><h1>Sua festa e sua conta <strong>em um só lugar.</strong></h1><p>Crie seu acesso para manter suas informações organizadas e acompanhar as novidades da Impakto.</p></div><div className="account-brand-art" aria-hidden="true"><img src="/impakto-identity.webp" alt="" width={700} height={700} decoding="async" /></div></div></section>
        <section className="account-content section"><div className="container"><AccountClient /></div></section>
      </main>
      <footer className="stores-footer"><div className="container"><img src="/impakto-logo.png" alt="" width={1056} height={321} loading="lazy" decoding="async" /><p>Dúvidas sobre o seu acesso?</p><Link href="/politica-de-privacidade">Política de privacidade</Link><ManageCookiesLink /><a href={whatsapp} target="_blank" rel="noreferrer">Fale com a nossa equipe →</a></div></footer>
    </>
  );
}
