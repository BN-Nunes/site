-- Impakto Festas — estatística de orçamentos enviados pelo carrinho.
--
-- Esta migration NÃO foi aplicada automaticamente. Revise e execute manualmente
-- no SQL Editor do Supabase (ou via `supabase db push`) quando estiver pronta.
-- Enquanto ela não for aplicada, o site continua funcionando: o registro falha
-- em silêncio e o orçamento segue normalmente para o WhatsApp.
--
-- Objetivo: saber quais lojas e quais produtos recebem mais pedidos de
-- orçamento, contando todos os visitantes (com ou sem conta). Diferente de
-- `quote_requests` (histórico pessoal de quem tem conta), esta tabela não guarda
-- nada que identifique o cliente: nem nome, nem observações, nem usuário — só a
-- loja escolhida, os itens e se o envio foi feito com login.

-- ============================================================================
-- 1. quote_events — um registro por orçamento enviado
-- ============================================================================
create table if not exists public.quote_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  store_cnpj text not null check (char_length(store_cnpj) between 1 and 20),
  store_name text not null check (char_length(store_name) between 1 and 80),
  items jsonb not null check (
    jsonb_typeof(items) = 'array'
    and jsonb_array_length(items) between 1 and 200
    and octet_length(items::text) <= 50000
  ),
  signed_in boolean not null default false
);

create index if not exists quote_events_created_at_idx on public.quote_events (created_at);

alter table public.quote_events enable row level security;

-- O navegador só pode inserir, e só estas colunas: `id` e `created_at` são
-- sempre do banco, para ninguém forjar a data de um registro. Sem permissão de
-- leitura, a API nunca devolve estes dados.
revoke all on public.quote_events from anon, authenticated;
grant insert (store_cnpj, store_name, items, signed_in) on public.quote_events to anon, authenticated;

-- `signed_in` tem de bater com a sessão de quem envia.
create policy "Visitantes podem registrar orçamentos enviados"
  on public.quote_events for insert
  to anon, authenticated
  with check (signed_in = (auth.uid() is not null));

-- ============================================================================
-- 2. Relatórios para a equipe (schema `relatorios`, fora da API pública)
-- ============================================================================
-- Para ver: Supabase → Table Editor → troque o schema de "public" para
-- "relatorios". As visões agrupam por CNPJ e por código do produto, então uma
-- loja ou um produto renomeado continua somando no mesmo lugar, com o nome mais
-- recente.
create schema if not exists relatorios;
revoke all on schema relatorios from public, anon, authenticated;

create or replace view relatorios.orcamentos_por_loja as
select
  (array_agg(store_name order by created_at desc))[1] as loja,
  count(*) as orcamentos,
  count(*) filter (where created_at >= now() - interval '30 days') as ultimos_30_dias,
  count(*) filter (where created_at >= now() - interval '7 days') as ultimos_7_dias,
  max(created_at) as ultimo_envio
from public.quote_events
group by store_cnpj
order by orcamentos desc;

create or replace view relatorios.produtos_mais_pedidos as
select
  coalesce(nullif(item ->> 'sku', ''), item ->> 'id') as codigo,
  (array_agg(item ->> 'name' order by event.created_at desc))[1] as produto,
  (array_agg(item ->> 'department' order by event.created_at desc))[1] as departamento,
  count(distinct event.id) as orcamentos,
  sum(case when item ->> 'quantity' ~ '^[0-9]{1,4}$' then (item ->> 'quantity')::int else 0 end) as quantidade
from public.quote_events as event
cross join lateral jsonb_array_elements(event.items) as item
group by 1
order by orcamentos desc, quantidade desc;

create or replace view relatorios.orcamentos_por_dia as
select
  (created_at at time zone 'America/Sao_Paulo')::date as dia,
  count(*) as orcamentos,
  count(*) filter (where signed_in) as com_login
from public.quote_events
group by 1
order by 1 desc;

-- ============================================================================
-- Notas
-- ============================================================================
-- * A chave anon é pública, então qualquer pessoa consegue inserir linhas aqui.
--   Os limites acima seguram o tamanho de cada linha; se aparecer lixo, filtre
--   pelo CNPJ (só os das lojas reais) ou apague as linhas pelo painel.
-- * Não há dados pessoais nesta tabela, então ela não entra nos pedidos de
--   acesso/exclusão da LGPD. Se um dia passar a guardar nome ou contato, revise
--   a política de privacidade antes.
