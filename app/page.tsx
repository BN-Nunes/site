import type { Metadata } from "next";
import Link from "next/link";
import { CategoryExplorer } from "./CategoryExplorer";
import { CartHeaderLink } from "./CartLinks";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { FooterMap } from "./FooterMap";
import { ManageCookiesLink } from "./ManageCookiesLink";
import { canonicalUrl } from "./lib/site-config";
import { siteContacts } from "./lib/site-contacts";
import { organizationJsonLd } from "./lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/") },
};

const benefits = [
  { icon: "🚚", title: "Entrega nacional", text: "Para todo o Brasil" },
  { icon: "🏷️", title: "5% de desconto", text: "Na primeira compra" },
  { icon: "💳", title: "4x sem juros", text: "Parcela mínima de R$ 80" },
  { icon: "🔒", title: "Compra segura", text: "Seus dados protegidos" },
];

const whatsapp = siteContacts.whatsapp.baseUrl;

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>

      <div className="utility-bar">
        <span>Entrega para todo o Brasil</span>
        <i aria-hidden="true" />
        <span>5% OFF na primeira compra</span>
        <i aria-hidden="true" />
        <span>4x sem juros</span>
      </div>

      <header className="site-header">
        <div className="container header-main">
          <a className="brand" href="#inicio" aria-label="Impakto Festas — início">
            <img className="brand-logo" src="/impakto-logo.png" alt="" width={1056} height={321} fetchPriority="high" decoding="async" />
          </a>

          <SearchBar />

          <div className="header-actions">
            <Link href="/conta" aria-label="Acessar ou criar minha conta"><span aria-hidden="true">♙</span><b>Minha conta</b></Link>
            <CartHeaderLink />
            <ThemeToggle />
          </div>
        </div>

        <nav className="main-nav" aria-label="Categorias principais">
          <div className="container nav-scroll">
            {[
              ["Festas", "/departamentos/festas-tematicas"], ["Descartáveis", "/departamentos/descartaveis"],
              ["Confeitaria", "/departamentos/confeitaria"], ["Decoração", "/departamentos/decoracao"],
              ["Papelaria", "/departamentos/papelaria"], ["Nossas lojas", "/lojas"], ["Ofertas", "/departamentos/ofertas"],
            ].map(([label, href]) => <Link className={label === "Ofertas" ? "nav-offer" : ""} href={href} key={label}>{label}</Link>)}
          </div>
        </nav>
      </header>

      <main id="conteudo">
        <section className="hero" id="inicio">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Sua festa começa aqui</span>
              <h1>Tudo para transformar qualquer momento em <strong>festa.</strong></h1>
              <p>Encontre balões, temas, confeitaria, descartáveis e decoração em um só lugar — com variedade, preço justo e entrega para todo o Brasil.</p>
              <div className="hero-actions">
                <a className="button button-red" href="#categorias">Explorar categorias <span aria-hidden="true">→</span></a>
                <a className="text-link" href={whatsapp} target="_blank" rel="noreferrer">Falar pelo WhatsApp</a>
              </div>
            </div>

            <div className="hero-visual" aria-label="Seleção profissional de artigos para festa com balões, decoração, descartáveis e bolo" role="img">
              <img
                src="/hero-party-professional.jpg"
                alt=""
                width={1536}
                height={1024}
                fetchPriority="high"
                decoding="async"
              />
              <div className="hero-campaign"><span>IMPAKTO FESTAS</span><strong>Sua festa completa<br />em um só clique!</strong></div>
              <div className="hero-offer"><strong>5% OFF</strong><span>na primeira compra</span></div>
            </div>
          </div>
        </section>

        <CategoryExplorer />

        <section className="benefit-band" aria-label="Vantagens de comprar na Impakto Festas">
          <div className="container benefit-grid">
            {benefits.map((benefit) => <div className="benefit" key={benefit.title}><span aria-hidden="true">{benefit.icon}</span><div><strong>{benefit.title}</strong><small>{benefit.text}</small></div></div>)}
          </div>
          <p className="benefit-disclaimer container">Desconto e parcelamento sujeitos a confirmação pela filial no atendimento. Este site não processa pagamentos.</p>
        </section>

        <section className="offers-section section" id="ofertas">
          <div className="container">
            <div className="section-title"><div><span className="kicker">Seleção especial</span><h2>Motivos para comemorar</h2></div></div>
            <div className="offer-grid">
              <a className="offer-card offer-main" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Pedir as ofertas da semana pelo WhatsApp">
                <div><span>OFERTAS DA SEMANA</span><h3>Preços que deixam a festa ainda melhor</h3><p>Uma seleção cheia de cor para você montar cada detalhe e economizar.</p><small className="offer-disclaimer">Percentual e condições confirmados pela filial no atendimento.</small><span className="offer-card-link">Pedir pelo WhatsApp →</span></div>
                <strong className="discount" aria-hidden="true">ATÉ<br /><b>50%</b></strong>
              </a>
              <Link className="offer-card offer-side" href="/departamentos/festas-tematicas" aria-label="Ver novidades no departamento de Festas Temáticas"><span>NOVIDADES</span><h3>Novos temas acabaram de chegar</h3><p>Ideias para aniversários, encontros e celebrações inesquecíveis.</p><span className="offer-card-link">Quero ver →</span></Link>
            </div>
          </div>
        </section>

        <section className="store-locator-section section" aria-labelledby="store-locator-title">
          <div className="container store-locator-card">
            <div className="store-locator-icon store-locator-identity" aria-hidden="true">
              <img src="/impakto-identity-360.jpg" alt="" width={360} height={360} loading="lazy" decoding="async" />
            </div>
            <div><span className="kicker">Visite a Impakto</span><h2 id="store-locator-title">Uma loja cheia de ideias para sua próxima festa.</h2><p>Consulte endereços, cidades e rotas de todas as nossas 13 filiais ativas.</p></div>
            <Link className="button store-locator-button" href="/lojas">Encontre a loja mais próxima de você <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="newsletter section" id="newsletter">
          <div className="container newsletter-card">
            <div><span className="kicker">Novidades em primeira mão</span><h2>Acompanhe nossas novidades</h2><p>Siga a Impakto Festas no Instagram ou fale com a gente pelo WhatsApp para receber dicas e promoções em primeira mão.</p></div>
            <div className="hero-actions">
              <a className="button button-red" href={siteContacts.instagram.url} target="_blank" rel="noreferrer">Seguir no Instagram <span aria-hidden="true">→</span></a>
              <a className="text-link" href={whatsapp} target="_blank" rel="noreferrer">Falar pelo WhatsApp</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-contact-grid">
          <section className="footer-contact-card" aria-labelledby="footer-sac">
            <div className="footer-contact-title"><span aria-hidden="true">☎</span><h3 id="footer-sac">SAC</h3></div>
            <a className="footer-highlight" href={`tel:+${siteContacts.sac.phoneE164}`}>{siteContacts.sac.phoneDisplay}</a>
            <p><span aria-hidden="true">◷</span> Segunda a sexta, das 9h às 17h.</p>
          </section>

          <section className="footer-contact-card" aria-labelledby="footer-whatsapp">
            <div className="footer-contact-title"><img className="footer-whatsapp-icon" src="/whatsapp-logo.png" alt="" aria-hidden="true" width={200} height={200} loading="lazy" decoding="async" /><h3 id="footer-whatsapp">WhatsApp</h3></div>
            <a className="footer-highlight" href={whatsapp} target="_blank" rel="noreferrer">{siteContacts.whatsapp.display}</a>
            <p>Fale diretamente com nossa equipe pelo WhatsApp.</p>
          </section>

          <section className="footer-contact-card" aria-labelledby="footer-contato">
            <div className="footer-contact-title"><span aria-hidden="true">✉</span><h3 id="footer-contato">Fale com a Impakto</h3></div>
            <a className="footer-email" href={`mailto:${siteContacts.sac.email}`}>{siteContacts.sac.email}</a>
            <address><span aria-hidden="true">⌖</span><span>{siteContacts.headquarters.street}<br />{siteContacts.headquarters.district}, {siteContacts.headquarters.city} — {siteContacts.headquarters.state}<br />CEP {siteContacts.headquarters.postalCode}</span></address>
          </section>

          <FooterMap />
        </div>
        <div className="container footer-secondary">
          <section>
            <h3>Navegação</h3>
            <nav className="footer-link-list" aria-label="Navegação do rodapé">
              <Link href="/">Página inicial</Link>
              <Link href="/quem-somos">Quem somos</Link>
              <Link href="/politica-de-privacidade">Política de privacidade</Link>
              <Link href="/politica-de-cookies">Política de cookies</Link>
              <ManageCookiesLink />
              <Link href="/#categorias">Departamentos</Link>
              <Link href="/lojas">Nossas lojas</Link>
            </nav>
          </section>
          <section>
            <h3>Atendimento</h3>
            <nav className="footer-link-list" aria-label="Atendimento ao cliente">
              <Link href="/conta">Minha conta</Link>
              <Link href="/carrinho">Carrinho de orçamento</Link>
              <a href={whatsapp} target="_blank" rel="noreferrer">Fale pelo WhatsApp</a>
            </nav>
          </section>
          <section>
            <h3>Redes sociais</h3>
            <a className="footer-social-link" href={siteContacts.instagram.url} target="_blank" rel="noreferrer" aria-label="Acessar o Instagram da Impakto Festas">
              <img src="/instagram-logo.webp" alt="" width={600} height={600} loading="lazy" decoding="async" />
              <span><strong>Instagram</strong><small>{siteContacts.instagram.handle}</small></span>
            </a>
          </section>
          <section className="footer-brand-promo">
            <h3>Conheça nossas soluções profissionais em limpeza, higiene e descartáveis.</h3>
            <a href={siteContacts.professionalSiteUrl} target="_blank" rel="noreferrer" aria-label="Acessar o site da Impakto Higiene, Limpeza e Descartáveis"><img src="/impakto-profissional.png" alt="Impakto Higiene, Limpeza e Descartáveis" width={1928} height={1140} loading="lazy" decoding="async" /></a>
            <a href={siteContacts.professionalSiteUrl} target="_blank" rel="noreferrer">Acesse nosso site →</a>
          </section>
        </div>
        <div className="container footer-bottom"><span>© 2026 Impakto Festas. Todos os direitos reservados.</span><span>Compra segura • Entrega para todo o Brasil</span></div>
      </footer>

      <a className="whatsapp-float" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Falar com a Impakto Festas pelo WhatsApp"><img src="/whatsapp-logo.png" alt="" width={200} height={200} decoding="async" /></a>
    </>
  );
}
