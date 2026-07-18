import type { Metadata } from "next";
import { AccountClient } from "./AccountClient";

export const metadata: Metadata = {
  title: "Minha conta | Impakto Festas",
  description: "Crie sua conta ou acesse sua área de cliente na Impakto Festas.",
};

const whatsapp = "https://api.whatsapp.com/send?phone=551146155051";

export default function AccountPage() {
  return (
    <>
      <a className="skip-link" href="#minha-conta">Pular para minha conta</a>
      <div className="utility-bar"><span>Cadastro rápido e seguro</span><i aria-hidden="true" /><span>Sua conta Impakto em um só lugar</span><i aria-hidden="true" /><span>Atendimento especializado</span></div>
      <header className="account-header"><div className="container account-header-inner"><a className="brand" href="/" aria-label="Voltar para o início"><img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" /></a><nav aria-label="Navegação da conta"><a href="/">← Voltar para o início</a><a href="/lojas">Nossas lojas</a><a href={whatsapp} target="_blank" rel="noreferrer">Precisa de ajuda?</a></nav></div></header>
      <main className="account-main" id="minha-conta">
        <section className="account-hero"><div className="container account-hero-grid"><div><span className="eyebrow">Área do cliente</span><h1>Sua festa e sua conta <strong>em um só lugar.</strong></h1><p>Crie seu acesso para manter suas informações organizadas e acompanhar as novidades da Impakto.</p></div><div className="account-brand-art" aria-hidden="true"><img src="/impakto-identity.png" alt="" /></div></div></section>
        <section className="account-content section"><div className="container"><AccountClient /></div></section>
      </main>
      <footer className="stores-footer"><div className="container"><img src="/impakto-logo.png" alt="" /><p>Dúvidas sobre o seu acesso?</p><a href={whatsapp} target="_blank" rel="noreferrer">Fale com a nossa equipe →</a></div></footer>
    </>
  );
}
