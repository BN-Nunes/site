-- Impakto Festas — perfil de cliente, endereços e orçamentos salvos.
--
-- Esta migration NÃO foi aplicada automaticamente. Revise e execute manualmente
-- no SQL Editor do Supabase (ou via `supabase db push`) quando estiver pronta.
--
-- Objetivo: parar de depender de `auth.users.user_metadata` (que não tem RLS e
-- não é o lugar apropriado para dados de perfil) e mover nome, telefone,
-- endereços e orçamentos salvos para tabelas próprias com Row Level Security,
-- garantindo que cada cliente só possa ler e escrever os seus próprios dados.

-- ============================================================================
-- 1. profiles — dados de perfil do cliente (1 linha por usuário autenticado)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Clientes podem ver o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Clientes podem criar o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Clientes podem atualizar o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Mantém updated_at em dia a cada alteração.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- 2. addresses — endereços do cliente (1 cliente pode ter vários, com um padrão)
-- ============================================================================
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  postal_code text not null,
  street text not null,
  number text not null,
  complement text,
  district text not null,
  city text not null,
  state text not null,
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses (user_id);

alter table public.addresses enable row level security;

create policy "Clientes podem ver os próprios endereços"
  on public.addresses for select
  using (auth.uid() = user_id);

create policy "Clientes podem criar os próprios endereços"
  on public.addresses for insert
  with check (auth.uid() = user_id);

create policy "Clientes podem atualizar os próprios endereços"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Clientes podem remover os próprios endereços"
  on public.addresses for delete
  using (auth.uid() = user_id);

create trigger addresses_set_updated_at
  before update on public.addresses
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- 3. quote_requests — orçamentos salvos (carrinho enviado pelo WhatsApp)
-- ============================================================================
-- `user_id` é opcional: visitantes não autenticados enviam o orçamento pelo
-- WhatsApp normalmente, sem que nada seja persistido aqui. Só gravamos uma
-- linha quando o cliente está autenticado no momento do envio.
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  store_cnpj text not null,
  store_name text not null,
  items jsonb not null,
  status text not null default 'sent' check (status in ('sent', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists quote_requests_user_id_idx on public.quote_requests (user_id);

alter table public.quote_requests enable row level security;

create policy "Clientes podem ver os próprios orçamentos"
  on public.quote_requests for select
  using (auth.uid() = user_id);

create policy "Clientes podem criar os próprios orçamentos"
  on public.quote_requests for insert
  with check (auth.uid() = user_id);

-- Sem policy de update/delete: orçamentos enviados não são editáveis pelo
-- cliente após o envio. Se for necessário no futuro (ex.: cancelar), adicione
-- uma policy de update restrita a linhas do próprio usuário.

-- ============================================================================
-- Notas de segurança
-- ============================================================================
-- * Nunca use a service role key no navegador. Todas as policies acima
--   dependem de `auth.uid()`, que só existe no contexto de uma sessão
--   autenticada via chave publishable/anon.
-- * Nenhuma policy concede acesso público (sem autenticação) de leitura ou
--   escrita a estas tabelas.
-- * `user_metadata` deixa de ser a fonte de verdade para nome/telefone/
--   endereço assim que o código da aplicação for atualizado para usar estas
--   tabelas (ver refatoração de app/conta/AccountClient.tsx).
