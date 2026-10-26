# Impakto Festas — site

Catálogo de artigos para festas da Impakto Festas. O cliente monta um
**carrinho de orçamento**, escolhe uma das 13 filiais e envia a lista pelo
**WhatsApp** — o site não vende nem processa pagamentos.

Produção: https://impakto-festas.vercel.app

## Stack

- [vinext](https://github.com/cloudflare/vinext) (App Router do Next.js sobre Vite) + React 19
- CSS próprio em `app/globals.css` e `app/cookies.css` (sem framework); fonte Inter self-hosted via `@fontsource-variable/inter`
- Supabase para login, perfil, endereços e histórico de orçamentos (`app/conta/`)
- Hospedagem na Vercel (`npm run build:vercel`); o build padrão (`npm run build`) gera um Worker da Cloudflare, usado pelos testes

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

## Variáveis de ambiente

Veja `.env.example`. Resumo:

- `NEXT_PUBLIC_SITE_URL` — URL canônica (metadata, sitemap, Open Graph).
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — chave **pública** do Supabase, usada no navegador.
- `PRODUCTS_CSV_URL` — planilha publicada como CSV com os produtos (colunas em `catalogo/modelo-catalogo.csv`). Sem ela, ou se a planilha falhar, o site usa os produtos de `app/departamentos/departments.ts`.
- `SUPABASE_SERVICE_ROLE_KEY` — **secreta**, só para o script de importação. Nunca use prefixo `VITE_`.

## Onde fica cada coisa

- `app/layout.tsx` — header (`SiteHeader`), footer (`SiteFooter`), botão flutuante do WhatsApp e aviso de cookies, compartilhados por todas as páginas.
- `app/departamentos/` — dados dos departamentos, página de departamento e card de produto.
- `app/busca/` — página de resultados; a lógica de busca está em `app/lib/search.ts`.
- `app/carrinho/` — carrinho de orçamento e montagem da mensagem (`app/lib/quote-message.ts`).
- `app/lojas/` — lista de filiais (`stores.ts`) com filtro e ordenação por distância.
- `app/lib/site-contacts.ts` — telefones, WhatsApp, e-mail e endereço: altere aqui, não nas páginas.
- `supabase/migrations/` — SQL das tabelas; aplique manualmente no SQL Editor do Supabase.

## Deploy

O deploy de produção é feito pela Vercel (projeto `impakto-festas`), com `vercel.json`
definindo o comando de build e os cabeçalhos de segurança (CSP). Se adicionar um
domínio externo (imagens, APIs, iframes), atualize a CSP em `vercel.json` **e**
em `worker/index.ts`.
