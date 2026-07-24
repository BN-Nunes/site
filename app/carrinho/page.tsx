import type { Metadata } from "next";
import { CartClient } from "./CartClient";
import { ThemeToggle } from "../ThemeToggle";

export const metadata: Metadata = {
  title: "Carrinho de orçamento | Impakto Festas",
  description: "Selecione produtos e solicite um orçamento pelo WhatsApp da Impakto Festas.",
};

export default function CartPage() {
  return (
    <>
      <a className="skip-link" href="#orcamento">Pular para o orçamento</a>
      <div className="utility-bar"><span>Escolha seus produtos</span><i aria-hidden="true" /><span>Selecione uma filial</span><i aria-hidden="true" /><span>Receba o orçamento pelo WhatsApp</span></div>
      <header className="cart-page-header"><div className="container cart-page-header-inner"><a className="brand" href="/" aria-label="Voltar para o início"><img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" /></a><nav aria-label="Navegação do carrinho"><a href="/">← Voltar para o início</a><a href="/lojas">Nossas lojas</a><a href="/conta">Minha conta</a><ThemeToggle /></nav></div></header>
      <main className="cart-main" id="orcamento"><section className="cart-hero"><div className="container"><span className="eyebrow">Carrinho de orçamento</span><h1>Escolha agora.<br /><strong>Confirme pelo WhatsApp.</strong></h1><p>Monte sua lista sem compromisso e envie tudo diretamente para a filial desejada.</p></div></section><section className="cart-content section"><div className="container"><CartClient /></div></section></main>
      <footer className="stores-footer"><div className="container"><img src="/impakto-logo.png" alt="" /><p>Este site não realiza vendas ou pagamentos online.</p><a href="/lojas">Conheça nossas lojas →</a></div></footer>
    </>
  );
}
