import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "./Icon";
import { siteContacts } from "./lib/site-contacts";

export const metadata: Metadata = {
  title: "Página não encontrada | Impakto Festas",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="section not-found-main" id="conteudo">
      <div className="container">
        <section className="stores-empty not-found-card" aria-labelledby="not-found-title">
          <span aria-hidden="true"><Icon name="sparkles" size={40} /></span>
          <h1 id="not-found-title">Página não encontrada</h1>
          <p>O endereço que você tentou acessar não existe ou foi movido. Use a busca acima, explore nossos departamentos ou encontre uma loja perto de você.</p>
          <div className="hero-actions not-found-actions">
            <Link className="button button-red" href="/#categorias">Ver departamentos</Link>
            <Link className="text-link" href="/lojas">Nossas lojas</Link>
            <a className="text-link" href={siteContacts.whatsapp.baseUrl} target="_blank" rel="noreferrer">Falar pelo WhatsApp</a>
          </div>
        </section>
      </div>
    </main>
  );
}
