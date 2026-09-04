-- Authoritative store_settings upsert (bypasses RLS via SECURITY DEFINER).
-- Re-run this even if 029 was applied earlier — replaces the functions.

create or replace function public.get_store_setting(p_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v jsonb;
begin
  if p_key is null or length(trim(p_key)) = 0 then
    return null;
  end if;

  select s.value
  into v
  from public.store_settings s
  where s.key = trim(p_key);

  return v;
end;
$$;

create or replace function public.upsert_store_setting(p_key text, p_value jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v jsonb;
  k text;
begin
  k := trim(coalesce(p_key, ''));
  if k = '' then
    raise exception 'store setting key is required';
  end if;

  if p_value is null or jsonb_typeof(p_value) <> 'object' then
    raise exception 'store setting value must be a jsonb object';
  end if;

  -- Delete + insert avoids silent no-op updates under restrictive RLS / WITH CHECK.
  delete from public.store_settings where key = k;

  insert into public.store_settings (key, value, updated_at)
  values (k, p_value, now())
  returning value into v;

  return v;
end;
$$;

revoke all on function public.get_store_setting(text) from public;
revoke all on function public.upsert_store_setting(text, jsonb) from public;

grant execute on function public.get_store_setting(text) to service_role;
grant execute on function public.upsert_store_setting(text, jsonb) to service_role;
grant execute on function public.get_store_setting(text) to postgres;
grant execute on function public.upsert_store_setting(text, jsonb) to postgres;
