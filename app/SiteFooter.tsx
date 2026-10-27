import Link from "next/link";
import { FooterMap } from "./FooterMap";
import { Icon } from "./Icon";
import { ManageCookiesLink } from "./ManageCookiesLink";
import { siteContacts } from "./lib/site-contacts";
import { stores } from "./lojas/stores";

const whatsapp = siteContacts.whatsapp.baseUrl;

/** Rodapé único do site, com os mesmos canais de contato e links em todas as páginas. */
export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="festa-stripe" aria-hidden="true" />
      <div className="container footer-brand">
        <Link className="footer-brand-logo" href="/" aria-label="Impakto Festas — página inicial"><img src="/impakto-logo.png" alt="" width={1056} height={321} loading="lazy" decoding="async" /></Link>
        <p><strong>Realizando sonhos</strong> em cada festa, em {stores.length} lojas e pelo WhatsApp.</p>
      </div>
      <div className="container footer-contact-grid">
        <section className="footer-contact-card" aria-labelledby="footer-sac">
          <div className="footer-contact-title"><Icon name="phone" /><h2 id="footer-sac">SAC</h2></div>
          <a className="footer-highlight" href={`tel:+${siteContacts.sac.phoneE164}`}>{siteContacts.sac.phoneDisplay}</a>
          <p><Icon name="clock" size={16} /> Segunda a sexta, das 9h às 17h.</p>
        </section>

        <section className="footer-contact-card" aria-labelledby="footer-whatsapp">
          <div className="footer-contact-title"><img className="footer-whatsapp-icon" src="/whatsapp-logo.png" alt="" width={200} height={200} loading="lazy" decoding="async" /><h2 id="footer-whatsapp">WhatsApp</h2></div>
          <a className="footer-highlight" href={whatsapp} target="_blank" rel="noreferrer">{siteContacts.whatsapp.display}</a>
          <p>Fale diretamente com nossa equipe pelo WhatsApp.</p>
        </section>

        <section className="footer-contact-card" aria-labelledby="footer-contato">
          <div className="footer-contact-title"><Icon name="mail" /><h2 id="footer-contato">Fale com a Impakto</h2></div>
          <a className="footer-email" href={`mailto:${siteContacts.sac.email}`}>{siteContacts.sac.email}</a>
          <address><Icon name="pin" size={16} /><span>{siteContacts.headquarters.street}<br />{siteContacts.headquarters.district}, {siteContacts.headquarters.city} — {siteContacts.headquarters.state}<br />CEP {siteContacts.headquarters.postalCode}</span></address>
        </section>

        <FooterMap />
      </div>

      <div className="container footer-secondary">
        <section aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title">Navegação</h2>
          <nav className="footer-link-list" aria-labelledby="footer-nav-title">
            <Link href="/">Página inicial</Link>
            <Link href="/#categorias">Departamentos</Link>
            <Link href="/lojas">Nossas lojas</Link>
            <Link href="/quem-somos">Quem somos</Link>
          </nav>
        </section>
        <section aria-labelledby="footer-help-title">
          <h2 id="footer-help-title">Atendimento</h2>
          <nav className="footer-link-list" aria-labelledby="footer-help-title">
            <Link href="/conta">Minha conta</Link>
            <Link href="/carrinho">Carrinho de orçamento</Link>
            <a href={whatsapp} target="_blank" rel="noreferrer">Fale pelo WhatsApp</a>
          </nav>
        </section>
        <section aria-labelledby="footer-privacy-title">
          <h2 id="footer-privacy-title">Privacidade</h2>
          <nav className="footer-link-list" aria-labelledby="footer-privacy-title">
            <Link href="/politica-de-privacidade">Política de privacidade</Link>
            <Link href="/politica-de-cookies">Política de cookies</Link>
            <ManageCookiesLink />
          </nav>
        </section>
        <section aria-labelledby="footer-social-title">
          <h2 id="footer-social-title">Redes sociais</h2>
          <a className="footer-social-link" href={siteContacts.instagram.url} target="_blank" rel="noreferrer" aria-label="Acessar o Instagram da Impakto Festas">
            <img src="/instagram-logo.webp" alt="" width={600} height={600} loading="lazy" decoding="async" />
            <span><strong>Instagram</strong><small>{siteContacts.instagram.handle}</small></span>
          </a>
        </section>
        <section className="footer-brand-promo">
          <h2>Conheça nossas soluções profissionais em limpeza, higiene e descartáveis.</h2>
          <a href={siteContacts.professionalSiteUrl} target="_blank" rel="noreferrer" aria-label="Acessar o site da Impakto Higiene, Limpeza e Descartáveis"><img src="/impakto-profissional.png" alt="" width={1928} height={1140} loading="lazy" decoding="async" /></a>
          <a href={siteContacts.professionalSiteUrl} target="_blank" rel="noreferrer">Acesse nosso site →</a>
        </section>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {siteContacts.tradeName}. Todos os direitos reservados.</span>
        <span>Orçamentos pelo WhatsApp • Preços e estoque confirmados pela filial</span>
      </div>
    </footer>
  );
}
