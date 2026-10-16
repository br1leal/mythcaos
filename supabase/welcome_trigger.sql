-- MythCaos · gatilho do e-mail de boas-vindas (alternativa ao painel de Database Webhooks)
-- Rodado no SQL Editor em 16/10/2026. A senha NÃO fica aqui: ela vive no Vault como 'welcome_hook_secret'
-- (criada uma vez com: select vault.create_secret('<senha>', 'welcome_hook_secret');)
-- e precisa ser igual à secret WELCOME_HOOK_SECRET da Edge Function.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_welcome_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare s text;
begin
  select decrypted_secret into s
    from vault.decrypted_secrets where name = 'welcome_hook_secret' limit 1;

  perform net.http_post(
    url := 'https://hqpletnbkucuarkdixug.supabase.co/functions/v1/welcome-email',
    body := jsonb_build_object('type','INSERT','table','leads','schema','public','record', to_jsonb(new)),
    headers := jsonb_build_object('Content-Type','application/json','x-hook-secret', coalesce(s,'')),
    timeout_milliseconds := 5000
  );
  return new;
exception when others then
  return new; -- se o e-mail falhar, o cadastro continua funcionando
end;
$$;

revoke execute on function public.notify_welcome_email() from public, anon, authenticated;

drop trigger if exists welcome_email on public.leads;
create trigger welcome_email
after insert on public.leads
for each row execute function public.notify_welcome_email();
