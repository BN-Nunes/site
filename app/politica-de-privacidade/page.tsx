import type { Metadata } from "next";
import Link from "next/link";
import { canonicalUrl } from "../lib/site-config";
import { PENDING_LEGAL_REVIEW, knownContact } from "../lib/privacy-config";

export const metadata: Metadata = {
  title: "Política de privacidade | Impakto Festas",
  description: "Saiba como a Impakto Festas trata dados pessoais no site, em conformidade com a LGPD.",
  alternates: { canonical: canonicalUrl("/politica-de-privacidade") },
};

const controllerLine = PENDING_LEGAL_REVIEW.companyLegalName && PENDING_LEGAL_REVIEW.companyTaxId
  ? `${PENDING_LEGAL_REVIEW.companyLegalName} (CNPJ ${PENDING_LEGAL_REVIEW.companyTaxId}), operando sob o nome fantasia ${knownContact.tradeName}`
  : `${knownContact.tradeName}`;

const dpoLine = PENDING_LEGAL_REVIEW.dataProtectionOfficerName
  ? `nosso encarregado (DPO) ${PENDING_LEGAL_REVIEW.dataProtectionOfficerName}, pelo canal ${PENDING_LEGAL_REVIEW.dataProtectionOfficerContact ?? knownContact.supportEmail}`
  : `nossa equipe de atendimento, pelo e-mail ${knownContact.supportEmail}`;

export default function PrivacyPolicyPage() {
  return (
    <main className="cookie-policy-main" id="conteudo">
      <section className="cookie-policy-hero">
        <div className="container">
          <span className="eyebrow">Privacidade</span>
          <h1>Política de privacidade</h1>
          <p>Como a {knownContact.tradeName} coleta, usa e protege dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>
          <small>Última atualização: 27 de julho de 2026.</small>
        </div>
      </section>

      <section className="cookie-policy-content section">
        <div className="container cookie-policy-layout">
          <article className="cookie-policy-card">
            <h2>1. Quem controla os seus dados</h2>
            <p>
              O controlador dos dados pessoais tratados neste site é a {controllerLine}.
              Para qualquer solicitação relacionada a dados pessoais, você pode falar com {dpoLine}.
            </p>

            <h2>2. Quais dados coletamos</h2>
            <p><b>Dados de cadastro e conta:</b> ao criar uma conta, coletamos nome, telefone e e-mail informados por você, além do endereço, quando cadastrado na área de endereços da conta.</p>
            <p><b>Dados de autenticação:</b> e-mail e senha (processados de forma segura pelo Supabase Auth, nosso provedor de autenticação) e identificadores de sessão necessários para manter você conectado.</p>
            <p><b>Carrinho de orçamento:</b> os produtos que você seleciona ficam guardados no seu navegador (e, quando você está autenticado, também podem ficar associados à sua conta) até o envio do orçamento pelo WhatsApp.</p>
            <p><b>Interações com WhatsApp:</b> ao clicar em &quot;Falar pelo WhatsApp&quot; ou enviar um orçamento, você é direcionado ao aplicativo WhatsApp/Meta com uma mensagem pré-preenchida contendo os itens escolhidos. Essa conversa passa a ocorrer diretamente entre você e a Impakto Festas dentro do WhatsApp, sob a política de privacidade da Meta.</p>
            <p><b>Cadastro para novidades por e-mail:</b> caso o site ofereça um formulário de inscrição para novidades, o e-mail informado só é utilizado com o seu consentimento explícito e pode ser removido a qualquer momento.</p>
            <p><b>Localização geográfica:</b> na página &quot;Nossas lojas&quot;, você pode optar por compartilhar sua localização para descobrir a filial mais próxima. Essa permissão é pedida pelo próprio navegador, é usada apenas naquele momento para ordenar a lista de filiais por distância, e não é enviada aos nossos servidores nem armazenada — fica apenas na memória da página enquanto você navega.</p>
            <p><b>Dados técnicos e logs de hospedagem:</b> nossos provedores de hospedagem e infraestrutura (Vercel e, em ambientes alternativos, Cloudflare) processam automaticamente dados técnicos de acesso, como endereço IP, tipo de navegador e páginas acessadas, para operar e proteger o site.</p>

            <h2>3. Para que usamos os seus dados</h2>
            <p>Usamos os dados coletados para: (i) criar e manter sua conta; (ii) processar e organizar orçamentos solicitados; (iii) permitir contato pelo WhatsApp ou e-mail sobre o seu pedido; (iv) manter a segurança e o funcionamento técnico do site; e (v), quando você consentir, enviar novidades e promoções.</p>

            <h2>4. Bases legais aplicáveis</h2>
            <p>Tratamos os dados com base em: execução de solicitação do titular (art. 7º, V, LGPD) para orçamentos e atendimento; consentimento (art. 7º, I) para newsletter e cookies não essenciais; e legítimo interesse (art. 7º, IX) para segurança, prevenção a fraude e melhoria técnica do site, sempre de forma proporcional e informada.</p>

            <h2>5. Com quem compartilhamos dados (fornecedores)</h2>
            <p>Para operar o site, utilizamos os seguintes fornecedores, que atuam como operadores dos dados que processam em nosso nome:</p>
            <ul>
              <li><b>Supabase:</b> autenticação de contas e armazenamento de dados de perfil, endereços e orçamentos salvos.</li>
              <li><b>Vercel:</b> hospedagem do site e logs técnicos de acesso.</li>
              <li><b>Google Maps:</b> exibição de mapas das nossas lojas, carregado apenas quando você opta por abri-lo.</li>
              <li><b>WhatsApp/Meta:</b> canal de comunicação para envio de orçamentos e atendimento, quando você escolhe usá-lo.</li>
              <li><b>Mercado Pago:</b> integração de pagamentos mantida desativada; será mencionada nesta política com detalhes de tratamento de dados apenas se e quando um checkout for efetivamente ativado.</li>
            </ul>
            <p>Não vendemos dados pessoais a terceiros nem os compartilhamos para fins de publicidade de terceiros.</p>

            <h2>6. Transferência internacional</h2>
            <p>Alguns dos fornecedores listados acima podem processar ou armazenar dados em servidores localizados fora do Brasil, como parte de sua infraestrutura global. Nesses casos, exigimos que esses fornecedores adotem salvaguardas adequadas de proteção de dados, compatíveis com a LGPD.</p>

            <h2>7. Por quanto tempo guardamos os dados</h2>
            <p>Mantemos os dados de conta e endereços enquanto sua conta estiver ativa. Orçamentos salvos ficam disponíveis para consulta enquanto forem úteis ao atendimento. Você pode solicitar a exclusão da sua conta e dos dados associados a qualquer momento, conforme a seção 9.</p>

            <h2>8. Segurança da informação</h2>
            <p>Adotamos medidas técnicas e administrativas para proteger os dados pessoais, incluindo controle de acesso por autenticação, políticas de restrição de acesso a dados (Row Level Security) no banco de dados, e comunicação criptografada (HTTPS) em todo o site.</p>

            <h2>9. Seus direitos como titular de dados</h2>
            <p>Nos termos da LGPD, você pode solicitar a qualquer momento: confirmação da existência de tratamento; acesso aos seus dados; correção de dados incompletos, inexatos ou desatualizados; exclusão dos dados tratados com base no seu consentimento; portabilidade, quando aplicável; informação sobre compartilhamento com terceiros; e revogação do consentimento previamente dado.</p>
            <p>
              Para exercer qualquer um desses direitos, envie um e-mail para{" "}
              <a href={`mailto:${knownContact.supportEmail}?subject=${encodeURIComponent("Solicitação sobre dados pessoais - LGPD")}`}>
                {knownContact.supportEmail}
              </a>{" "}
              descrevendo o pedido. Responderemos dentro de um prazo razoável. Pedidos de exclusão de conta são processados manualmente pela nossa equipe — não há exclusão automática instantânea no momento.
            </p>

            <h2>10. Cookies e tecnologias semelhantes</h2>
            <p>Detalhes sobre cookies, armazenamento local e as categorias utilizadas (necessários, funcionais e de terceiros) estão descritos na nossa <Link href="/politica-de-cookies">política de cookies</Link>, incluindo como gerenciar suas preferências.</p>

            <h2>11. Alterações nesta política</h2>
            <p>Esta política pode ser atualizada sempre que houver mudança relevante em como tratamos dados pessoais, nas funcionalidades do site ou nos fornecedores utilizados. A data da versão mais recente é sempre exibida no início desta página.</p>

            <h2>12. Fale conosco</h2>
            <p>Dúvidas sobre esta política ou sobre o tratamento dos seus dados pessoais podem ser enviadas para <a href={`mailto:${knownContact.supportEmail}`}>{knownContact.supportEmail}</a>.</p>
          </article>

          <aside className="cookie-policy-summary" aria-label="Resumo da política de privacidade">
            <span aria-hidden="true">🔒</span>
            <h2>Resumo rápido</h2>
            <ul>
              <li>Não vendemos seus dados a terceiros.</li>
              <li>Orçamentos são enviados por você via WhatsApp.</li>
              <li>Localização é opcional, usada só para achar a loja mais próxima, e nunca sai do seu navegador.</li>
              <li>Você pode pedir acesso, correção ou exclusão a qualquer momento.</li>
              <li>Mercado Pago fica inativo até um checkout ser lançado.</li>
            </ul>
            <Link href="/politica-de-cookies">Ver política de cookies →</Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
