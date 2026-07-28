import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { siteContacts } from "./lib/site-contacts";

export const metadata: Metadata = {
  title: "Página não encontrada | Impakto Festas",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <div className="utility-bar"><span>Entrega para todo o Brasil</span><i aria-hidden="true" /><span>Impakto Festas</span></div>

      <header className="about-header">
        <div className="container about-header-inner">
          <Link className="brand" href="/" aria-label="Voltar para a página inicial">
            <img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" width={1056} height={321} />
          </Link>
          <nav aria-label="Navegação">
            <Link href="/">← Página inicial</Link>
            <Link href="/lojas">Nossas lojas</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="section">
        <div className="container">
          <section className="stores-empty not-found-card" aria-labelledby="not-found-title">
            <span aria-hidden="true">✦</span>
            <h1 id="not-found-title">Página não encontrada</h1>
            <p>O endereço que você tentou acessar não existe ou foi movido. Que tal explorar nossos departamentos ou encontrar uma loja perto de você?</p>
            <div className="hero-actions not-found-actions">
              <Link className="button button-red" href="/">Voltar para a página inicial</Link>
              <a className="text-link" href={siteContacts.whatsapp.baseUrl} target="_blank" rel="noreferrer">Falar pelo WhatsApp</a>
            </div>
          </section>
        </div>
      </main>

      <footer className="stores-footer">
        <div className="container">
          <img src="/impakto-logo.png" alt="" width={1056} height={321} loading="lazy" decoding="async" />
          <p>Transparência e respeito em cada atendimento.</p>
          <Link href="/lojas">Conheça nossas lojas →</Link>
        </div>
      </footer>
    </>
  );
}
