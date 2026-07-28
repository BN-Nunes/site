import type { Metadata } from "next";
import Link from "next/link";
import { StoresExplorer } from "./StoresExplorer";
import { ThemeToggle } from "../ThemeToggle";
import { ManageCookiesLink } from "../ManageCookiesLink";
import { canonicalUrl } from "../lib/site-config";
import { siteContacts } from "../lib/site-contacts";
import { storeJsonLd } from "../lib/structured-data";
import { stores } from "./stores";

export const metadata: Metadata = {
  title: "Nossas lojas | Impakto Festas",
  description: "Encontre a unidade Impakto Festas mais próxima de você.",
  alternates: { canonical: canonicalUrl("/lojas") },
};

const whatsapp = siteContacts.whatsapp.baseUrl;

export default function StoresPage() {
  return (
    <>
      {stores.map((store) => (
        <script
          key={store.cnpj}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd(store)) }}
        />
      ))}
      <a className="skip-link" href="#filiais">Pular para as filiais</a>
      <div className="utility-bar"><span>13 lojas para receber você</span><i aria-hidden="true" /><span>Variedade para sua festa</span><i aria-hidden="true" /><span>Atendimento especializado</span></div>

      <header className="stores-header">
        <div className="container stores-header-inner">
          <Link className="brand" href="/" aria-label="Voltar para a página inicial"><img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" width={1056} height={321} /></Link>
          <nav aria-label="Navegação da página de lojas"><Link href="/">← Voltar para o início</Link><a className="stores-whatsapp" href={whatsapp} target="_blank" rel="noreferrer">Falar no WhatsApp</a><ThemeToggle /></nav>
        </div>
      </header>

      <main className="stores-main" id="filiais">
        <section className="stores-hero">
          <div className="container stores-hero-grid">
            <div><span className="eyebrow">Nossas lojas</span><h1>Encontre a Impakto <strong>mais próxima de você.</strong></h1><p>Pesquise por cidade, bairro, endereço ou CEP e descubra a melhor unidade para visitar.</p></div>
            <aside><strong>13</strong><span>filiais ativas em São Paulo</span><p>Escolha uma loja e abra a rota completa no Google Maps.</p></aside>
          </div>
        </section>

        <section className="stores-directory section">
          <div className="container"><StoresExplorer /></div>
        </section>
      </main>

      <footer className="stores-footer"><div className="container"><img src="/impakto-logo.png" alt="" width={1056} height={321} loading="lazy" decoding="async" /><p>Precisa de ajuda para escolher uma loja?</p><ManageCookiesLink /><a href={whatsapp} target="_blank" rel="noreferrer">Fale com a nossa equipe →</a></div></footer>
      <a className="whatsapp-float" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Falar com a Impakto Festas pelo WhatsApp"><img src="/whatsapp-logo.png" alt="" width={200} height={200} decoding="async" /></a>
    </>
  );
}
