import type { Metadata } from "next";
import Link from "next/link";
import { CategoryExplorer } from "./CategoryExplorer";
import { Icon, type IconName } from "./Icon";
import { JsonLd } from "./JsonLd";
import { canonicalUrl } from "./lib/site-config";
import { siteContacts } from "./lib/site-contacts";
import { organizationJsonLd } from "./lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/") },
};

const benefits: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "truck", title: "Entrega nacional", text: "Para todo o Brasil" },
  { icon: "tag", title: "5% de desconto", text: "Na primeira compra" },
  { icon: "card", title: "4x sem juros", text: "Parcela mínima de R$ 80" },
  { icon: "lock", title: "Compra segura", text: "Seus dados protegidos" },
];

const steps = [
  { title: "Escolha os produtos", text: "Navegue pelos departamentos e adicione ao carrinho de orçamento o que precisar." },
  { title: "Selecione uma filial", text: "Diga qual das nossas 13 lojas deve atender você." },
  { title: "Receba pelo WhatsApp", text: "A filial confirma preços, estoque e condições direto com você." },
];

const whatsapp = siteContacts.whatsapp.baseUrl;

export default function Home() {
  return (
    <main id="conteudo">
      <JsonLd data={organizationJsonLd()} />

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Sua festa começa aqui</span>
            <h1>Tudo para transformar qualquer momento em <strong>festa.</strong></h1>
            <p>Encontre balões, temas, confeitaria, descartáveis e decoração em um só lugar — com variedade, preço justo e entrega para todo o Brasil.</p>
            <div className="hero-actions">
              <a className="button button-red" href="#categorias">Explorar categorias <Icon name="arrowRight" size={18} /></a>
              <a className="text-link" href={whatsapp} target="_blank" rel="noreferrer">Falar pelo WhatsApp</a>
            </div>
          </div>

          <div className="hero-visual" aria-label="Seleção de artigos para festa com balões, decoração, descartáveis e bolo" role="img">
            <img src="/hero-party-professional.jpg" alt="" width={1536} height={1024} fetchPriority="high" decoding="async" />
            <div className="hero-campaign"><span>IMPAKTO FESTAS</span><strong>Sua festa completa<br />em um só clique!</strong></div>
            <div className="hero-offer"><strong>5% OFF</strong><span>na primeira compra</span></div>
          </div>
        </div>
      </section>

      <CategoryExplorer />

      <section className="benefit-band" aria-label="Vantagens de comprar na Impakto Festas">
        <div className="container benefit-grid">
          {benefits.map((benefit) => (
            <div className="benefit" key={benefit.title}>
              <span><Icon name={benefit.icon} size={24} /></span>
              <div><strong>{benefit.title}</strong><small>{benefit.text}</small></div>
            </div>
          ))}
        </div>
        <p className="benefit-disclaimer container">Desconto e parcelamento sujeitos a confirmação pela filial no atendimento. Este site não processa pagamentos.</p>
      </section>

      <section className="how-it-works section" aria-labelledby="how-it-works-title">
        <div className="container">
          <div className="section-title"><div><span className="kicker">Simples e sem compromisso</span><h2 id="how-it-works-title">Como funciona o orçamento</h2></div></div>
          <ol className="steps-grid">
            {steps.map((step, index) => (
              <li key={step.title}><span aria-hidden="true">{index + 1}</span><div><strong>{step.title}</strong><p>{step.text}</p></div></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="offers-section section" id="ofertas">
        <div className="container">
          <div className="section-title"><div><span className="kicker">Seleção especial</span><h2>Motivos para comemorar</h2></div></div>
          <div className="offer-grid">
            <a className="offer-card offer-main" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Pedir as ofertas da semana pelo WhatsApp">
              <div>
                <span className="offer-label">OFERTAS DA SEMANA</span>
                <h3>Preços que deixam a festa ainda melhor</h3>
                <p>Uma seleção cheia de cor para você montar cada detalhe e economizar.</p>
                <small className="offer-disclaimer">Percentual e condições confirmados pela filial no atendimento.</small>
                <span className="offer-card-link">Pedir pelo WhatsApp →</span>
              </div>
              <strong className="discount" aria-hidden="true">ATÉ<br /><b>50%</b></strong>
            </a>
            <Link className="offer-card offer-side" href="/departamentos/festas-tematicas" aria-label="Ver novidades no departamento de Festas Temáticas">
              <span className="offer-label">NOVIDADES</span>
              <h3>Novos temas acabaram de chegar</h3>
              <p>Ideias para aniversários, encontros e celebrações inesquecíveis.</p>
              <span className="offer-card-link">Quero ver →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="store-locator-section section" aria-labelledby="store-locator-title">
        <div className="container store-locator-card">
          <div className="store-locator-icon store-locator-identity" aria-hidden="true">
            <img src="/impakto-identity-360.jpg" alt="" width={360} height={360} loading="lazy" decoding="async" />
          </div>
          <div><span className="kicker">Visite a Impakto</span><h2 id="store-locator-title">Uma loja cheia de ideias para sua próxima festa.</h2><p>Consulte endereços, cidades e rotas de todas as nossas 13 filiais ativas.</p></div>
          <Link className="button store-locator-button" href="/lojas">Encontre a loja mais próxima <Icon name="arrowRight" size={18} /></Link>
        </div>
      </section>

      <section className="newsletter section" id="newsletter">
        <div className="container newsletter-card">
          <div><span className="kicker">Novidades em primeira mão</span><h2>Acompanhe nossas novidades</h2><p>Siga a Impakto Festas no Instagram ou fale com a gente pelo WhatsApp para receber dicas e promoções em primeira mão.</p></div>
          <div className="hero-actions">
            <a className="button button-red" href={siteContacts.instagram.url} target="_blank" rel="noreferrer">Seguir no Instagram <Icon name="arrowRight" size={18} /></a>
            <a className="text-link" href={whatsapp} target="_blank" rel="noreferrer">Falar pelo WhatsApp</a>
          </div>
        </div>
      </section>
    </main>
  );
}
