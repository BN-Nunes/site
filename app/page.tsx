import { CategoryExplorer } from "./CategoryExplorer";
import { CartHeaderLink } from "./CartLinks";

const benefits = [
  { icon: "🚚", title: "Entrega nacional", text: "Para todo o Brasil" },
  { icon: "🏷️", title: "5% de desconto", text: "Na primeira compra" },
  { icon: "💳", title: "4x sem juros", text: "Parcela mínima de R$ 80" },
  { icon: "🔒", title: "Compra segura", text: "Seus dados protegidos" },
];

const whatsapp = "https://api.whatsapp.com/send?phone=551146155051";

export default function Home() {
  return (
    <>
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
            <img className="brand-logo" src="/impakto-logo.png" alt="" />
          </a>

          <form className="search" action="#categorias">
            <label className="sr-only" htmlFor="busca">Buscar produtos</label>
            <input id="busca" name="q" placeholder="O que você está procurando?" />
            <button type="submit" aria-label="Buscar">⌕</button>
          </form>

          <div className="header-actions">
            <a href="/conta" aria-label="Acessar ou criar minha conta"><span aria-hidden="true">♙</span><b>Minha conta</b></a>
            <CartHeaderLink />
          </div>
        </div>

        <nav className="main-nav" aria-label="Categorias principais">
          <div className="container nav-scroll">
            {[
              ["Festas", "/departamentos/festas-tematicas"], ["Descartáveis", "/departamentos/descartaveis"],
              ["Confeitaria", "/departamentos/confeitaria"], ["Decoração", "/departamentos/decoracao"],
              ["Papelaria", "/departamentos/papelaria"], ["Nossas lojas", "/lojas"], ["Ofertas", "/departamentos/ofertas"],
            ].map(([label, href]) => <a className={label === "Ofertas" ? "nav-offer" : ""} href={href} key={label}>{label}</a>)}
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
              <img src="/hero-party-professional.png" alt="" />
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
        </section>

        <section className="offers-section section" id="ofertas">
          <div className="container">
            <div className="section-title"><div><span className="kicker">Seleção especial</span><h2>Motivos para comemorar</h2></div></div>
            <div className="offer-grid">
              <article className="offer-card offer-main">
                <div><span>OFERTAS DA SEMANA</span><h3>Preços que deixam a festa ainda melhor</h3><p>Uma seleção cheia de cor para você montar cada detalhe e economizar.</p><a href={whatsapp} target="_blank" rel="noreferrer">Pedir pelo WhatsApp →</a></div>
                <strong className="discount" aria-hidden="true">ATÉ<br /><b>50%</b></strong>
              </article>
              <article className="offer-card offer-side"><span>NOVIDADES</span><h3>Novos temas acabaram de chegar</h3><p>Ideias para aniversários, encontros e celebrações inesquecíveis.</p><a href="#categorias">Quero ver →</a></article>
            </div>
          </div>
        </section>

        <section className="store-locator-section section" aria-labelledby="store-locator-title">
          <div className="container store-locator-card">
            <div className="store-locator-icon store-locator-identity" aria-hidden="true">
              <img src="/impakto-identity.png" alt="" />
            </div>
            <div><span className="kicker">Visite a Impakto</span><h2 id="store-locator-title">Uma loja cheia de ideias para sua próxima festa.</h2><p>Consulte endereços, cidades e rotas de todas as nossas 13 filiais ativas.</p></div>
            <a className="button store-locator-button" href="/lojas">Encontre a loja mais próxima de você <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <section className="newsletter section" id="newsletter">
          <div className="container newsletter-card">
            <div><span className="kicker">Novidades em primeira mão</span><h2>Receba dicas e promoções</h2><p>Inspiração para sua próxima festa, direto no seu e-mail.</p></div>
            <form action="#newsletter"><label className="sr-only" htmlFor="email">Seu melhor e-mail</label><input id="email" name="email" type="email" placeholder="Seu melhor e-mail" required /><button type="submit">Quero receber</button></form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-contact-grid">
          <section className="footer-contact-card" aria-labelledby="footer-sac">
            <div className="footer-contact-title"><span aria-hidden="true">☎</span><h3 id="footer-sac">SAC</h3></div>
            <a className="footer-highlight" href="tel:+5511939410125">(11) 93941-0125</a>
            <p><span aria-hidden="true">◷</span> Segunda a sexta, das 9h às 17h.</p>
          </section>

          <section className="footer-contact-card" aria-labelledby="footer-whatsapp">
            <div className="footer-contact-title"><img className="footer-whatsapp-icon" src="/whatsapp-logo.jpg" alt="" aria-hidden="true" /><h3 id="footer-whatsapp">WhatsApp</h3></div>
            <a className="footer-highlight" href={whatsapp} target="_blank" rel="noreferrer">(11) 4615-5051</a>
            <p>Fale diretamente com nossa equipe pelo WhatsApp.</p>
          </section>

          <section className="footer-contact-card" aria-labelledby="footer-contato">
            <div className="footer-contact-title"><span aria-hidden="true">✉</span><h3 id="footer-contato">Fale com a Impakto</h3></div>
            <a className="footer-email" href="mailto:sac@impakto.com.br">sac@impakto.com.br</a>
            <address><span aria-hidden="true">⌖</span><span>Estr. do Embu, 320<br />Jardim Torino, Cotia — SP<br />CEP 06713-100</span></address>
          </section>

          <section className="footer-map-card" aria-label="Localização da Impakto Festas">
            <iframe
              title="Mapa da Impakto Festas em Cotia"
              src="https://www.google.com/maps?q=Estrada%20do%20Embu%2C%20320%2C%20Jardim%20Torino%2C%20Cotia%2C%20SP%2C%2006713-100&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a href="https://www.google.com/maps/search/?api=1&query=Estrada%20do%20Embu%2C%20320%2C%20Jardim%20Torino%2C%20Cotia%2C%20SP%2C%2006713-100" target="_blank" rel="noreferrer">Abrir no Google Maps ↗</a>
          </section>
        </div>
        <div className="container footer-secondary">
          <section>
            <h3>Navegação</h3>
            <nav className="footer-link-list" aria-label="Navegação do rodapé">
              <a href="/">Página inicial</a>
              <a href="/#categorias">Departamentos</a>
              <a href="/lojas">Nossas lojas</a>
            </nav>
          </section>
          <section>
            <h3>Atendimento</h3>
            <nav className="footer-link-list" aria-label="Atendimento ao cliente">
              <a href="/conta">Minha conta</a>
              <a href="/carrinho">Carrinho de orçamento</a>
              <a href={whatsapp} target="_blank" rel="noreferrer">Fale pelo WhatsApp</a>
            </nav>
          </section>
          <section>
            <h3>Redes sociais</h3>
            <a className="footer-social-link" href="https://www.instagram.com/impaktofestas/?hl=pt" target="_blank" rel="noreferrer" aria-label="Acessar o Instagram da Impakto Festas">
              <img src="/instagram-logo.webp" alt="" />
              <span><strong>Instagram</strong><small>@impaktofestas</small></span>
            </a>
          </section>
          <section className="footer-brand-promo">
            <h3>Conheça nossas soluções profissionais em limpeza, higiene e descartáveis.</h3>
            <a href="https://www.impakto.com.br/" target="_blank" rel="noreferrer" aria-label="Acessar o site da Impakto Higiene, Limpeza e Descartáveis"><img src="/impakto-profissional.png" alt="Impakto Higiene, Limpeza e Descartáveis" /></a>
            <a href="https://www.impakto.com.br/" target="_blank" rel="noreferrer">Acesse nosso site →</a>
          </section>
        </div>
        <div className="container footer-bottom"><span>© 2026 Impakto Festas. Todos os direitos reservados.</span><span>Compra segura • Entrega para todo o Brasil</span></div>
      </footer>

      <a className="whatsapp-float" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Falar com a Impakto Festas pelo WhatsApp"><img src="/whatsapp-logo.jpg" alt="" /></a>
    </>
  );
}
