-- REQUIRED — Supabase → SQL Editor → Run
-- Fixes: admin Save shows success but reload shows old settings (e.g. newBadgeDays stuck at 30)

-- 1) Allow service role writes
alter table public.store_settings disable row level security;
drop policy if exists "store_settings_service_all" on public.store_settings;

-- 2) Drop old broken helpers
drop function if exists public.force_upsert_store_setting(text, jsonb);
drop function if exists public.upsert_store_setting(text, jsonb);
drop function if exists public.get_store_setting(text);

-- 3) Write function: update-or-insert, then re-read in SAME transaction
create or replace function public.force_upsert_store_setting(p_key text, p_value jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  k text := trim(coalesce(p_key, ''));
  v jsonb;
  n int;
begin
  if k = '' then
    raise exception 'store setting key is required';
  end if;
  if p_value is null or jsonb_typeof(p_value) <> 'object' then
    raise exception 'store setting value must be a jsonb object';
  end if;

  update public.store_settings
  set value = p_value,
      updated_at = now()
  where key = k;
  get diagnostics n = row_count;

  if n = 0 then
    insert into public.store_settings (key, value, updated_at)
    values (k, p_value, now());
  end if;

  select value into v from public.store_settings where key = k;

  -- Compare by content, not key order (jsonb equality is order-insensitive for objects)
  if v is null or not (v @> p_value and p_value @> v) then
    raise exception 'force_upsert_store_setting persist check failed for key % (got %)', k, v;
  end if;

  return v;
end;
$$;

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
  select value into v from public.store_settings where key = trim(p_key);
  return v;
end;
$$;

-- alias
create or replace function public.upsert_store_setting(p_key text, p_value jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.force_upsert_store_setting(p_key, p_value);
end;
$$;

alter function public.force_upsert_store_setting(text, jsonb) owner to postgres;
alter function public.get_store_setting(text) owner to postgres;
alter function public.upsert_store_setting(text, jsonb) owner to postgres;

revoke all on function public.force_upsert_store_setting(text, jsonb) from public;
revoke all on function public.get_store_setting(text) from public;
revoke all on function public.upsert_store_setting(text, jsonb) from public;

grant execute on function public.force_upsert_store_setting(text, jsonb) to service_role;
grant execute on function public.get_store_setting(text) to service_role;
grant execute on function public.upsert_store_setting(text, jsonb) to service_role;

-- 4) Reload PostgREST schema cache (important!)
notify pgrst, 'reload schema';

-- 5) Prove write works: set days to 5, then read back
select public.force_upsert_store_setting(
  'collection-products',
  jsonb_build_object(
    'enabled', true,
    'columnsDesktop', 4,
    'cardImageAspect', 'square',
    'pageSize', 24,
    'paginationMode', 'load-more',
    'defaultSort', 'manual',
    'showSaleBadge', true,
    'showNewBadge', true,
    'newBadgeDays', 5
  )
) as after_write;

select value->>'newBadgeDays' as days_should_be_5
from public.store_settings
where key = 'collection-products';
