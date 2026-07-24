import type { Metadata } from "next";
import { ThemeToggle } from "../ThemeToggle";

export const metadata: Metadata = {
  title: "Política de cookies | Impakto Festas",
  description: "Saiba como a Impakto Festas utiliza cookies e armazenamento local em seu site.",
};

const storageItems = [
  {
    name: "Sessão da conta",
    purpose: "Mantém o cliente conectado com segurança e permite renovar a sessão de acesso.",
    type: "Necessário",
    duration: "Durante a sessão e conforme o ciclo de autenticação, até sair da conta ou limpar os dados do navegador.",
  },
  {
    name: "impakto-orcamento",
    purpose: "Mantém os produtos escolhidos no carrinho de orçamento neste dispositivo.",
    type: "Funcional",
    duration: "Até o orçamento ser limpo ou os dados do navegador serem apagados.",
  },
  {
    name: "impakto-theme",
    purpose: "Lembra a preferência entre o modo claro e o modo escuro.",
    type: "Funcional",
    duration: "Até a preferência ser alterada ou os dados do navegador serem apagados.",
  },
  {
    name: "impakto-cookie-notice-v1",
    purpose: "Registra que este aviso de privacidade já foi exibido e compreendido.",
    type: "Funcional",
    duration: "Até os dados do navegador serem apagados.",
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <a className="skip-link" href="#politica-cookies">Pular para a política de cookies</a>
      <div className="utility-bar"><span>Transparência e privacidade</span><i aria-hidden="true" /><span>Impakto Festas</span></div>

      <header className="about-header">
        <div className="container about-header-inner">
          <a className="brand" href="/" aria-label="Voltar para a página inicial">
            <img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" width={1056} height={321} />
          </a>
          <nav aria-label="Navegação da política de cookies">
            <a href="/">← Página inicial</a>
            <a href="/quem-somos">Quem somos</a>
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
            <small>Última atualização: 22 de julho de 2026.</small>
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

              <h2>3. Serviços de terceiros</h2>
              <p>O mapa do Google não é carregado automaticamente. Somente após a escolha de abrir o mapa o navegador estabelece conexão com o Google Maps, que poderá tratar dados técnicos e utilizar tecnologias próprias conforme suas políticas.</p>

              <h2>4. Como gerenciar</h2>
              <p>Você pode apagar cookies e dados locais nas configurações de privacidade do navegador. Essa ação pode encerrar sua sessão, remover os itens do carrinho de orçamento e restaurar o tema padrão do site.</p>

              <h2>5. Alterações nesta política</h2>
              <p>Esta política poderá ser atualizada quando houver mudança nas funcionalidades, nos fornecedores ou nas tecnologias utilizadas. A data da versão mais recente será sempre informada no início desta página.</p>

              <h2>6. Fale conosco</h2>
              <p>Em caso de dúvidas sobre esta política ou sobre o tratamento de dados pessoais, entre em contato pelo e-mail <a href="mailto:sac@impakto.com.br">sac@impakto.com.br</a>.</p>
            </article>

            <aside className="cookie-policy-summary" aria-label="Resumo da política">
              <span aria-hidden="true">✓</span>
              <h2>Resumo rápido</h2>
              <ul>
                <li>Sem cookies de publicidade.</li>
                <li>Sem analytics no momento.</li>
                <li>Sessão, carrinho e tema ficam no navegador.</li>
                <li>Google Maps somente após sua ação.</li>
              </ul>
              <a href="/">Voltar para a página inicial →</a>
            </aside>
          </div>
        </section>
      </main>

      <footer className="stores-footer">
        <div className="container"><img src="/impakto-logo.png" alt="" width={1056} height={321} /><p>Transparência e respeito em cada atendimento.</p><a href="mailto:sac@impakto.com.br">Fale conosco →</a></div>
      </footer>
    </>
  );
}
