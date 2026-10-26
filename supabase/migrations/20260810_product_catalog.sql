-- Impakto Festas — catálogo de departamentos e produtos.
--
-- Esta migration NÃO foi aplicada automaticamente. Revise e execute manualmente
-- no SQL Editor do Supabase (ou via `supabase db push`) quando estiver pronta.
--
-- Objetivo: guardar no Supabase uma cópia do catálogo hoje definido em
-- app/departamentos/departments.ts, populada por
-- scripts/import-catalog-to-supabase.ts. O site continua servindo o catálogo
-- como hoje (departments.ts + planilha CSV) — estas tabelas não são lidas em
-- produção ainda, só armazenam os dados para uso futuro/consulta.

-- ============================================================================
-- 0. Função compartilhada para manter updated_at em dia
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. departments — um departamento do catálogo (ex.: Balões, Confeitaria)
-- ============================================================================
create table if not exists public.departments (
  slug text primary key,
  name text not null,
  short_description text not null,
  description text not null,
  icon text not null,
  class_name text not null,
  product_types text[] not null default '{}',
  featured boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.departments enable row level security;

-- Catálogo público: qualquer visitante (mesmo sem login, via chave anon) pode ler.
drop policy if exists "Qualquer pessoa pode ler departamentos" on public.departments;
create policy "Qualquer pessoa pode ler departamentos"
  on public.departments for select
  using (true);

drop trigger if exists departments_set_updated_at on public.departments;
create trigger departments_set_updated_at
  before update on public.departments
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- 2. products — produtos de um departamento
-- ============================================================================
create table if not exists public.products (
  id text primary key,
  department_slug text not null references public.departments (slug) on delete cascade,
  sku text,
  name text not null,
  description text not null default '',
  price text not null default '',
  image text not null default '',
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_department_slug_idx on public.products (department_slug);

alter table public.products enable row level security;

drop policy if exists "Qualquer pessoa pode ler produtos" on public.products;
create policy "Qualquer pessoa pode ler produtos"
  on public.products for select
  using (true);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- Notas de segurança
-- ============================================================================
-- * Nenhuma policy de insert/update/delete é criada para estas tabelas: só a
--   service role key (usada exclusivamente pelo script de importação, nunca
--   no navegador) pode escrever. A chave anon/publishable usada pelo site só
--   consegue ler.
-- * Nunca use a service role key no navegador nem em código com prefixo VITE_.
