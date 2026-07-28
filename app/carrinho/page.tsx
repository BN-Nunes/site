import type { Metadata } from "next";
import Link from "next/link";
import { CartClient } from "./CartClient";
import { ThemeToggle } from "../ThemeToggle";
import { ManageCookiesLink } from "../ManageCookiesLink";
import { canonicalUrl } from "../lib/site-config";

export const metadata: Metadata = {
  title: "Carrinho de orçamento | Impakto Festas",
  description: "Selecione produtos e solicite um orçamento pelo WhatsApp da Impakto Festas.",
  alternates: { canonical: canonicalUrl("/carrinho") },
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <>
      <a className="skip-link" href="#orcamento">Pular para o orçamento</a>
      <div className="utility-bar"><span>Escolha seus produtos</span><i aria-hidden="true" /><span>Selecione uma filial</span><i aria-hidden="true" /><span>Receba o orçamento pelo WhatsApp</span></div>
      <header className="cart-page-header"><div className="container cart-page-header-inner"><Link className="brand" href="/" aria-label="Voltar para o início"><img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" width={1056} height={321} /></Link><nav aria-label="Navegação do carrinho"><Link href="/">← Voltar para o início</Link><Link href="/lojas">Nossas lojas</Link><Link href="/conta">Minha conta</Link><ThemeToggle /></nav></div></header>
      <main className="cart-main" id="orcamento"><section className="cart-hero"><div className="container"><span className="eyebrow">Carrinho de orçamento</span><h1>Escolha agora.<br /><strong>Confirme pelo WhatsApp.</strong></h1><p>Monte sua lista sem compromisso e envie tudo diretamente para a filial desejada.</p></div></section><section className="cart-content section"><div className="container"><CartClient /></div></section></main>
      <footer className="stores-footer"><div className="container"><img src="/impakto-logo.png" alt="" width={1056} height={321} loading="lazy" decoding="async" /><p>Este site não realiza vendas ou pagamentos online.</p><ManageCookiesLink /><Link href="/lojas">Conheça nossas lojas →</Link></div></footer>
    </>
  );
}
