import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";
import { ManageCookiesLink } from "../ManageCookiesLink";
import { canonicalUrl } from "../lib/site-config";
import { siteContacts } from "../lib/site-contacts";

export const metadata: Metadata = {
  title: "Política de cookies | Impakto Festas",
  description: "Saiba como a Impakto Festas utiliza cookies e armazenamento local em seu site.",
  alternates: { canonical: canonicalUrl("/politica-de-cookies") },
};

const storageItems = [
  {
    name: "Sessão da conta",
    purpose: "Mantém o cliente conectado com segurança e permite renovar a sessão de acesso.",
    type: "Necessário",
    duration: "Durante a sessão e conforme o ciclo de autenticação, até sair da conta ou limpar os dados do navegador.",
  },
  {
    name: "impakto-cookie-consent-v1",
    purpose: "Registra a escolha feita no aviso de cookies (somente necessários ou funcionalidades aceitas).",
    type: "Necessário",
    duration: "Até a escolha ser alterada ou os dados do navegador serem apagados.",
  },
  {
    name: "impakto-orcamento",
    purpose: "Mantém os produtos escolhidos no carrinho de orçamento neste dispositivo. Só é gravado se você aceitar cookies funcionais.",
    type: "Funcional",
    duration: "Até o orçamento ser limpo ou os dados do navegador serem apagados.",
  },
  {
    name: "impakto-theme",
    purpose: "Lembra a preferência entre o modo claro e o modo escuro. Só é gravado se você aceitar cookies funcionais.",
    type: "Funcional",
    duration: "Até a preferência ser alterada ou os dados do navegador serem apagados.",
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <a className="skip-link" href="#politica-cookies">Pular para a política de cookies</a>
      <div className="utility-bar"><span>Transparência e privacidade</span><i aria-hidden="true" /><span>Impakto Festas</span></div>

      <header className="about-header">
        <div className="container about-header-inner">
          <Link className="brand" href="/" aria-label="Voltar para a página inicial">
            <img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" width={1056} height={321} />
          </Link>
          <nav aria-label="Navegação da política de cookies">
            <Link href="/">← Página inicial</Link>
            <Link href="/politica-de-privacidade">Política de privacidade</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="cookie-policy-main" id="politica-cookies">
        <section className="cookie-policy-hero">
          <div className="container">
            <span className="eyebrow">Privacidade</span>
            <h1>Política de cookies</h1>
            <p>Entenda quais recursos ficam armazenados no seu navegador e para que eles são utilizados.</p>
            <small>Última atualização: 27 de julho de 2026.</small>
          </div>
        </section>

        <section className="cookie-policy-content section">
          <div className="container cookie-policy-layout">
            <article className="cookie-policy-card">
              <h2>1. O que são cookies e armazenamento local?</h2>
              <p>Cookies são pequenos arquivos gravados no dispositivo durante a navegação. O armazenamento local possui função semelhante e permite que o navegador guarde preferências e informações necessárias para determinadas funcionalidades do site.</p>

              <h2>2. O que utilizamos</h2>
              <p>Atualmente, a Impakto Festas não utiliza cookies de publicidade nem ferramentas de análise de comportamento. Usamos os recursos abaixo para viabilizar funções solicitadas pelo próprio visitante.</p>

              <div className="cookie-storage-list" aria-label="Recursos armazenados pelo site">
                {storageItems.map((item) => (
                  <section key={item.name}>
                    <div><strong>{item.name}</strong><span>{item.type}</span></div>
                    <p><b>Finalidade:</b> {item.purpose}</p>
                    <p><b>Duração:</b> {item.duration}</p>
                  </section>
                ))}
              </div>

              <h2>3. Cookies de terceiros</h2>
              <p>O mapa do Google não é carregado automaticamente. Somente após a escolha de abrir o mapa o navegador estabelece conexão com o Google Maps, que poderá tratar dados técnicos e utilizar tecnologias próprias conforme suas políticas.</p>

              <h2>4. Suas escolhas</h2>
              <p>Ao visitar o site pela primeira vez, você vê um aviso com três opções:</p>
              <p><b>&quot;Somente necessários&quot;:</b> mantemos apenas o essencial para o site funcionar (sessão de login e o registro da sua própria escolha). O carrinho de orçamento e o tema deixam de ser salvos entre visitas — o carrinho continua funcionando durante a navegação, mas não é gravado no seu navegador.</p>
              <p><b>&quot;Aceitar funcionalidades&quot;:</b> além do necessário, passamos a lembrar seu carrinho de orçamento e sua preferência de tema (claro/escuro) entre visitas.</p>
              <p><b>&quot;Ver política&quot;:</b> abre esta página antes de decidir.</p>
              <p>Se você já escolheu &quot;Aceitar funcionalidades&quot; e depois muda para &quot;Somente necessários&quot;, removemos imediatamente o carrinho e o tema já salvos no seu navegador.</p>

              <h2>5. Como gerenciar sua escolha</h2>
              <p>Você pode mudar de ideia a qualquer momento clicando em <b>&quot;Gerenciar cookies&quot;</b> no rodapé de qualquer página, que reabre o aviso de escolha. Também é possível apagar cookies e dados locais diretamente nas configurações de privacidade do navegador — isso pode encerrar sua sessão e remover os itens do carrinho de orçamento.</p>

              <h2>6. Alterações nesta política</h2>
              <p>Esta política poderá ser atualizada quando houver mudança nas funcionalidades, nos fornecedores ou nas tecnologias utilizadas. A data da versão mais recente será sempre informada no início desta página.</p>

              <h2>7. Fale conosco</h2>
              <p>Em caso de dúvidas sobre esta política ou sobre o tratamento de dados pessoais, entre em contato pelo e-mail <a href={`mailto:${siteContacts.sac.email}`}>{siteContacts.sac.email}</a> ou consulte nossa <Link href="/politica-de-privacidade">política de privacidade</Link>.</p>
            </article>

            <aside className="cookie-policy-summary" aria-label="Resumo da política">
              <span aria-hidden="true">✓</span>
              <h2>Resumo rápido</h2>
              <ul>
                <li>Sem cookies de publicidade.</li>
                <li>Sem analytics no momento.</li>
                <li>Carrinho e tema só ficam salvos se você aceitar.</li>
                <li>Google Maps somente após sua ação.</li>
                <li>Mude sua escolha quando quiser em &quot;Gerenciar cookies&quot;.</li>
              </ul>
              <Link href="/">Voltar para a página inicial →</Link>
            </aside>
          </div>
        </section>
      </main>

      <footer className="stores-footer">
        <div className="container"><img src="/impakto-logo.png" alt="" width={1056} height={321} loading="lazy" decoding="async" /><p>Transparência e respeito em cada atendimento.</p><ManageCookiesLink /><a href={`mailto:${siteContacts.sac.email}`}>Fale conosco →</a></div>
      </footer>
    </>
  );
}
