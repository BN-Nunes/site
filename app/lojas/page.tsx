import type { Metadata } from "next";
import { StoresExplorer } from "./StoresExplorer";
import { ThemeToggle } from "../ThemeToggle";

export const metadata: Metadata = {
  title: "Nossas lojas | Impakto Festas",
  description: "Encontre a unidade Impakto Festas mais próxima de você.",
};

const whatsapp = "https://api.whatsapp.com/send?phone=5511940591588";

export default function StoresPage() {
  return (
    <>
      <a className="skip-link" href="#filiais">Pular para as filiais</a>
      <div className="utility-bar"><span>13 lojas para receber você</span><i aria-hidden="true" /><span>Variedade para sua festa</span><i aria-hidden="true" /><span>Atendimento especializado</span></div>

      <header className="stores-header">
        <div className="container stores-header-inner">
          <a className="brand" href="/" aria-label="Voltar para a página inicial"><img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" /></a>
          <nav aria-label="Navegação da página de lojas"><a href="/">← Voltar para o início</a><a className="stores-whatsapp" href={whatsapp} target="_blank" rel="noreferrer">Falar no WhatsApp</a><ThemeToggle /></nav>
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

      <footer className="stores-footer"><div className="container"><img src="/impakto-logo.png" alt="" /><p>Precisa de ajuda para escolher uma loja?</p><a href={whatsapp} target="_blank" rel="noreferrer">Fale com a nossa equipe →</a></div></footer>
      <a className="whatsapp-float" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Falar com a Impakto Festas pelo WhatsApp"><img src="/whatsapp-logo.jpg" alt="" /></a>
    </>
  );
}
