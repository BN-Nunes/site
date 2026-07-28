import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";
import { ManageCookiesLink } from "../ManageCookiesLink";
import { canonicalUrl } from "../lib/site-config";
import { siteContacts } from "../lib/site-contacts";

export const metadata: Metadata = {
  title: "Quem somos | Impakto Festas",
  description: "Conheça a história, a missão, a visão e os valores da Impakto e da Impakto Festas.",
  alternates: { canonical: canonicalUrl("/quem-somos") },
};

const values = ["Comprometimento", "Excelência", "Inovação", "Foco no Cliente", "Respeito às Pessoas", "Sustentabilidade"];
const whatsapp = siteContacts.whatsapp.baseUrl;

export default function AboutPage() {
  return (
    <>
      <a className="skip-link" href="#quem-somos">Pular para quem somos</a>
      <div className="utility-bar"><span>Mais de 30 anos de história</span><i aria-hidden="true" /><span>Qualidade e inovação</span><i aria-hidden="true" /><span>Atendimento em todo o Brasil</span></div>

      <header className="about-header">
        <div className="container about-header-inner">
          <Link className="brand" href="/" aria-label="Voltar para a página inicial"><img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" width={1056} height={321} /></Link>
          <nav aria-label="Navegação da página institucional"><Link href="/">← Página inicial</Link><Link href="/lojas">Nossas lojas</Link><ThemeToggle /></nav>
        </div>
      </header>

      <main className="about-main" id="quem-somos">
        <section className="about-hero">
          <div className="container about-hero-grid">
            <div><span className="eyebrow">Nossa história</span><h1>Quem <strong>Somos</strong></h1><p>Tradição, inovação e compromisso para oferecer soluções completas a clientes de todo o Brasil.</p></div>
          </div>
        </section>

        <section className="about-content section">
          <div className="container">
            <article className="about-story">
              <span className="kicker">Impakto e Impakto Festas</span>
              <h2>Uma trajetória construída com confiança.</h2>
              <div className="about-story-copy">
                <p>Há mais de 30 anos, a Impakto é referência nacional na distribuição de produtos de limpeza, descartáveis, embalagens e produtos químicos, oferecendo qualidade, inovação e soluções completas para diversos segmentos.</p>
                <p>Com o objetivo de atender também o mercado de festas, confeitaria, decoração e embalagens, expandimos nossa atuação por meio da Impakto Festas. Atualmente, contamos com um amplo portfólio de produtos, lojas físicas estrategicamente localizadas e canais digitais que atendem clientes em todo o Brasil.</p>
                <p>Seguimos investindo em inovação, expansão e excelência para proporcionar a melhor experiência de compra e construir relações de confiança com nossos clientes.</p>
              </div>
            </article>

            <div className="about-pillars">
              <article><span aria-hidden="true">◎</span><small>Nosso propósito</small><h2>Nossa Missão</h2><p>Oferecer soluções de qualidade que atendam às necessidades dos nossos clientes, com excelência, inovação e compromisso em cada atendimento.</p></article>
              <article><span aria-hidden="true">◇</span><small>Onde queremos chegar</small><h2>Nossa Visão</h2><p>Ser a principal referência nacional nos segmentos em que atuamos, reconhecida pela qualidade, inovação e excelência no atendimento.</p></article>
            </div>

            <section className="about-values" aria-labelledby="about-values-title">
              <div><span className="kicker">O que nos orienta</span><h2 id="about-values-title">Nossos Valores</h2><p>Princípios presentes em nossas decisões, relacionamentos e em cada atendimento.</p></div>
              <ul>{values.map((value, index) => <li key={value}><span>{String(index + 1).padStart(2, "0")}</span><strong>{value}</strong></li>)}</ul>
            </section>
          </div>
        </section>
      </main>

      <footer className="stores-footer"><div className="container"><img src="/impakto-logo.png" alt="" width={1056} height={321} loading="lazy" decoding="async" /><p>Conheça nossas lojas e encontre tudo para sua festa.</p><ManageCookiesLink /><Link href="/lojas">Encontrar uma loja →</Link></div></footer>
      <a className="whatsapp-float" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Falar com a Impakto Festas pelo WhatsApp"><img src="/whatsapp-logo.png" alt="" width={200} height={200} decoding="async" /></a>
    </>
  );
}
