import type { Metadata } from "next";
import Link from "next/link";
import { BrandWord } from "./BrandWord";
import { CategoryExplorer } from "./CategoryExplorer";
import { Icon, type IconName } from "./Icon";
import { JsonLd } from "./JsonLd";
import { stores } from "./lojas/stores";
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

const themes = [
  { label: "Meninos", text: "Temas infantis", image: "/fotos/temas/meninos.webp", href: "/departamentos/festas-tematicas" },
  { label: "Meninas", text: "Temas infantis", image: "/fotos/temas/meninas.webp", href: "/departamentos/festas-tematicas" },
  { label: "Doces", text: "Para a mesa da festa", image: "/fotos/temas/doces.webp", href: "/departamentos/confeitaria" },
  { label: "Confeitaria", text: "Bolos e cupcakes", image: "/fotos/temas/confeitaria.webp", href: "/departamentos/confeitaria" },
];

const steps = [
  { title: "Escolha os produtos", text: "Navegue pelos departamentos e adicione ao carrinho de orçamento o que precisar." },
  { title: "Selecione uma filial", text: "Diga qual das nossas 13 lojas deve atender você." },
  { title: "Receba pelo WhatsApp", text: "A filial confirma preços, estoque e condições direto com você." },
];

const storePhotos = [
  { src: "/fotos/lojas/tatuape.webp", name: "Tatuapé" },
  { src: "/fotos/lojas/alphaville.webp", name: "Alphaville" },
  { src: "/fotos/lojas/santo-andre.webp", name: "Santo André" },
];

const storeCities = Array.from(new Set(stores.map((store) => store.city))).sort((a, b) => a.localeCompare(b, "pt-BR"));

const whatsapp = siteContacts.whatsapp.baseUrl;

export default function Home() {
  return (
    <main id="conteudo">
      <JsonLd data={organizationJsonLd()} />

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Realizando sonhos</span>
            <h1>A festa começa na <BrandWord />.</h1>
            <p>Balões, temas, confeitaria, descartáveis e decoração em 13 lojas em São Paulo — e orçamento rápido pelo WhatsApp.</p>
            <div className="hero-actions">
              <a className="button button-cta" href="#categorias">Explorar departamentos <Icon name="arrowRight" size={18} /></a>
              <Link className="text-link" href="/lojas">Encontrar uma loja</Link>
            </div>
          </div>

          <div className="hero-collage" role="img" aria-label="Mesas de festa montadas com produtos Impakto: tema infantil, doces e confeitaria">
            <img className="hero-photo hero-photo-main" src="/fotos/temas/meninas.webp" alt="" width={640} height={522} fetchPriority="high" decoding="async" />
            <img className="hero-photo hero-photo-top" src="/fotos/temas/doces.webp" alt="" width={640} height={522} decoding="async" />
            <img className="hero-photo hero-photo-bottom" src="/fotos/temas/confeitaria.webp" alt="" width={640} height={522} decoding="async" />
            <span className="hero-sticker" aria-hidden="true"><strong>5% OFF</strong>na 1ª compra</span>
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

      <section className="themes-section section" aria-labelledby="temas-title">
        <div className="container">
          <div className="section-title"><div><span className="kicker">Inspiração</span><h2 id="temas-title">Festas que a gente monta todo dia</h2></div></div>
          <ul className="theme-grid">
            {themes.map((theme) => (
              <li key={theme.label}>
                <Link className="theme-card" href={theme.href}>
                  <img src={theme.image} alt="" width={640} height={522} loading="lazy" decoding="async" />
                  <span><strong>{theme.label}</strong><small>{theme.text}</small></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
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
          <div className="store-locator-copy">
            <span className="kicker">Visite a Impakto</span>
            <h2 id="store-locator-title">13 lojas cheias de ideias para a sua festa.</h2>
            <p>Em {storeCities.slice(0, -1).join(", ")} e {storeCities.at(-1)}. Veja a rota, chame no WhatsApp ou ligue direto para a loja.</p>
            <Link className="button store-locator-button" href="/lojas">Encontre a loja mais próxima <Icon name="arrowRight" size={18} /></Link>
          </div>
          <ul className="store-locator-photos" aria-label="Algumas das nossas lojas">
            {storePhotos.map((photo) => (
              <li key={photo.name}><img src={photo.src} alt={`Fachada da Impakto Festas ${photo.name}`} width={800} height={480} loading="lazy" decoding="async" /><span>{photo.name}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="newsletter section" id="newsletter">
        <div className="container newsletter-card">
          <div><span className="kicker">Novidades em primeira mão</span><h2>Acompanhe nossas novidades</h2><p>Siga a Impakto Festas no Instagram ou fale com a gente pelo WhatsApp para receber dicas e promoções em primeira mão.</p></div>
          <div className="hero-actions">
            <a className="button button-cta" href={siteContacts.instagram.url} target="_blank" rel="noreferrer">Seguir no Instagram <Icon name="arrowRight" size={18} /></a>
            <a className="text-link" href={whatsapp} target="_blank" rel="noreferrer">Falar pelo WhatsApp</a>
          </div>
        </div>
      </section>
    </main>
  );
}
