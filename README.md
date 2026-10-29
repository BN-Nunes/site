# Impakto Festas — site

Catálogo de artigos para festas da Impakto Festas. O cliente monta um
**carrinho de orçamento**, escolhe uma das filiais e envia a lista pelo
**WhatsApp** — o site não vende nem processa pagamentos.

Produção: https://impakto-festas.vercel.app

## Stack

- [vinext](https://github.com/cloudflare/vinext) (App Router do Next.js sobre Vite) + React 19
- CSS próprio em `app/globals.css` e `app/cookies.css` (sem framework)
- Supabase para login, perfil, endereços e histórico de orçamentos (`app/conta/`)
- Hospedagem na Vercel (`npm run build:vercel`); o build padrão (`npm run build`) gera um Worker da Cloudflare, usado pelos testes

## Identidade visual

Tudo vem do logo da Impakto Festas e da fachada das lojas ("Realizando sonhos"):

- **Cores** (tokens `--c-*` em `app/globals.css`): amarelo `#FCCC0C`, magenta `#CC1884`, verde `#00843C`, roxo `#3C1890`, vermelho `#F01E2C`. O magenta é a cor de ação (botões); o roxo escuro `--brand-deep` é a base de barras e rodapé.
- **Tipografia**: Baloo 2 (títulos, arredondada como as letras-balão do logo) e Nunito (texto), self-hosted via `@fontsource-variable`.
- **Grafismo**: as "pílulas" diagonais com anéis da identidade, em `public/brand/pills.svg` e `public/brand/pills-stripe.svg`.
- **Fotos** (otimizadas em `public/fotos/`): parte das fachadas vem de `impaktofestas.com.br`; as de Perdizes, Indianópolis e Cotia foram enviadas pela equipe. As fotos de temas da home são do Pexels, cuja licença permite uso comercial sem crédito: safári e docinhos (Vidal Balielo Jr.), unicórnio (Silvia Trigo) e cupcakes (Ferawan). Ao trocar uma foto, use um nome de arquivo novo: imagens ficam 1 hora no cache do navegador.

## Rodando localmente

Requer Node.js `>=22.13.0`.

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000 (use --port para mudar)
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run lint` | ESLint |
| `npm test` | build + testes (`tests/rendered-html.test.mjs`): renderiza as rotas pelo Worker e testa as funções puras de `app/lib/` |
| `npm run build:vercel` | build usado no deploy da Vercel |
| `npm run db:import-catalog` | copia o catálogo estático para as tabelas `departments`/`products` do Supabase |
| `npm run photos:check -- arquivo.csv` | testa no servidor de fotos quais SKUs de uma exportação do sistema têm foto e grava `arquivo-fotos.csv` com as colunas FOTO e URL IMAGEM; com `--site`, também regrava os produtos do sistema que o site mostra (`app/departamentos/system-products.ts`) |

## Variáveis de ambiente

Veja `.env.example`. Resumo:

- `NEXT_PUBLIC_SITE_URL` — URL canônica (metadata, sitemap, Open Graph).
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — chave **pública** do Supabase, usada no navegador.
- `PRODUCTS_CSV_URL` — planilha publicada como CSV com os produtos (colunas em `catalogo/modelo-catalogo.csv`). O site soma a ela os produtos com foto da exportação do sistema (`app/departamentos/system-products.ts`, gerado por `npm run photos:check -- exportacao.csv --site`, que escolhe o departamento pela FAMÍLIA); um código que está nos dois aparece uma vez, como está na planilha. Sem a planilha, ou se ela falhar, ficam só os do sistema; departamento sem nenhum produto mostra os de exemplo de `app/departamentos/departments.ts`.
- `SUPABASE_SERVICE_ROLE_KEY` — **secreta**, só para o script de importação. Nunca use prefixo `VITE_`.

## Onde fica cada coisa

- `app/layout.tsx` — header (`SiteHeader`), footer (`SiteFooter`), botão flutuante do WhatsApp e aviso de cookies, compartilhados por todas as páginas.
- `app/departamentos/` — dados dos departamentos, página de departamento e card de produto. A página mostra 24 produtos por vez (`?pagina=2` soma os 24 seguintes, pelo botão "Carregar mais produtos") e, quando o departamento tem mais de 24, um campo de busca só dele (`?busca=`); a lógica fica em `app/lib/department-listing.ts`. Foto que não existe no servidor de fotos (o CloudFront responde 403) vira o ícone do departamento no card e o ícone padrão no carrinho (`ProductPhoto.tsx`).
- `app/busca/` — página de resultados, também 24 produtos por vez (`?pagina=`, mesmo "Carregar mais produtos" dos departamentos); a lógica de busca está em `app/lib/search.ts`.
- `app/carrinho/` — carrinho de orçamento e montagem da mensagem (`app/lib/quote-message.ts`).
- `app/lojas/` — lista de filiais (`stores.ts`) com filtro e ordenação por distância, e uma página por loja (`/lojas/[slug]`, com horário, mapa, contatos e lojas próximas). O horário (`hours`) foi copiado da ficha de cada loja no Google Maps em 27/10/2026 (o de Guarulhos 3, que não tem ficha, foi enviado pela equipe); lojas sem `hours` simplesmente não mostram horário. O endereço da página sai do nome da loja (`storeSlug`), então renomear uma loja muda o link dela. O número de lojas nas páginas sai dessa lista; a única exceção é `public/og-festas.png` (prévia de compartilhamento), que tem o número escrito na imagem e precisa ser refeita quando uma loja abre ou fecha.
- `app/lib/site-contacts.ts` — telefones, WhatsApp, e-mail, endereço e o link da loja no Mercado Livre: altere aqui, não nas páginas.
- `public/marcas/mercado-livre.png` — símbolo do Mercado Livre usado nos links para a loja oficial. Foi recortado de uma imagem pequena enviada pela equipe (78×54), por isso só aparece em tamanho pequeno; se chegar o arquivo oficial, substitua por ele com um nome novo.
- `supabase/migrations/` — SQL das tabelas; aplique manualmente no SQL Editor do Supabase.

## Estatísticas

- **Visitas:** Vercel Web Analytics (painel do projeto na Vercel → Analytics). Não usa cookies, por isso carrega sem depender do aviso de cookies. O script só é incluído nos deploys da Vercel (`process.env.VERCEL`).
- **Orçamentos:** cada envio pelo carrinho grava a loja e os itens em `quote_events`, sem nome nem observações (`app/lib/quote-events.ts`). Os relatórios ficam no Supabase, Table Editor, schema `relatorios`: orçamentos por loja, por dia e produtos mais pedidos. Requer aplicar `supabase/migrations/20261027_quote_events.sql`; antes disso o registro falha em silêncio e o WhatsApp funciona normalmente.
- Se mudar o que é coletado, atualize as políticas de privacidade e de cookies.

## Deploy

O deploy de produção é feito pela Vercel (projeto `impakto-festas`), com `vercel.json`
definindo o comando de build e os cabeçalhos de segurança (CSP). Se adicionar um
domínio externo (imagens, APIs, iframes), atualize a CSP em `vercel.json` **e**
em `worker/index.ts`.
