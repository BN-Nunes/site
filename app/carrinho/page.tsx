import type { Metadata } from "next";
import { CartClient } from "./CartClient";
import { canonicalUrl } from "../lib/site-config";

export const metadata: Metadata = {
  title: "Carrinho de orçamento | Impakto Festas",
  description: "Selecione produtos e solicite um orçamento pelo WhatsApp da Impakto Festas.",
  alternates: { canonical: canonicalUrl("/carrinho") },
  robots: { index: false, follow: false },
};

const steps = ["Escolha seus produtos", "Selecione uma filial", "Receba o orçamento pelo WhatsApp"];

export default function CartPage() {
  return (
    <main className="cart-main" id="conteudo">
      <section className="cart-hero">
        <div className="container">
          <span className="eyebrow">Carrinho de orçamento</span>
          <h1>Escolha agora.<br /><strong>Confirme pelo WhatsApp.</strong></h1>
          <p>Monte sua lista sem compromisso e envie tudo diretamente para a filial desejada.</p>
          <ol className="cart-steps">{steps.map((step, index) => <li key={step}><span aria-hidden="true">{index + 1}</span>{step}</li>)}</ol>
        </div>
      </section>
      <section className="cart-content section"><div className="container"><CartClient /></div></section>
    </main>
  );
}
