-- MythCaos · schema do Supabase
-- Rodar uma vez no SQL Editor (New query → colar → Run). Pode rodar de novo sem quebrar.

-- ============ LEADS (lista de espera / popup / desafio) ============
create table if not exists public.leads (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  nome       text check (char_length(nome) <= 80),
  email      text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  tel        text check (char_length(tel) <= 30),
  mesa       text check (char_length(mesa) <= 40),
  catarse    boolean default false,
  origem     text check (origem in ('popup','lista','desafio')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.leads enable row level security;

-- cada visitante (login anônimo) só vê e grava o próprio contato; ninguém lista os outros
drop policy if exists "leads: ler o proprio" on public.leads;
create policy "leads: ler o proprio" on public.leads for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "leads: criar o proprio" on public.leads;
create policy "leads: criar o proprio" on public.leads for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "leads: editar o proprio" on public.leads;
create policy "leads: editar o proprio" on public.leads for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.leads from anon, authenticated;
grant select, insert, update on public.leads to authenticated;

-- contador "X pessoas já guardaram lugar na mesa" sem expor os contatos
create or replace function public.mesa_count() returns integer
language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.leads
$$;
revoke all on function public.mesa_count() from public;
grant execute on function public.mesa_count() to anon, authenticated;

-- ============ PUZZLE (Desafio Monte a Lenda · ranking) ============
create table if not exists public.puzzle (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  nome       text not null check (char_length(nome) between 1 and 80),
  t          integer[] not null check (cardinality(t) <= 10),
  total      integer not null check (total > 0),
  moves      integer not null check (moves >= 0),
  updated_at timestamptz not null default now()
);
create index if not exists puzzle_total_idx on public.puzzle (total);
alter table public.puzzle enable row level security;

-- ranking é público (só nome e tempos); cada um grava só a própria pontuação
drop policy if exists "puzzle: ranking publico" on public.puzzle;
create policy "puzzle: ranking publico" on public.puzzle for select to anon, authenticated using (true);
drop policy if exists "puzzle: criar o proprio" on public.puzzle;
create policy "puzzle: criar o proprio" on public.puzzle for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "puzzle: editar o proprio" on public.puzzle;
create policy "puzzle: editar o proprio" on public.puzzle for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.puzzle from anon, authenticated;
grant select on public.puzzle to anon, authenticated;
grant insert, update on public.puzzle to authenticated;

-- updated_at automático
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists leads_touch on public.leads;
create trigger leads_touch before update on public.leads for each row execute function public.touch_updated_at();
drop trigger if exists puzzle_touch on public.puzzle;
create trigger puzzle_touch before update on public.puzzle for each row execute function public.touch_updated_at();
