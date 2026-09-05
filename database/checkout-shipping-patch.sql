-- One-shot: fix checkout shipping save + seed shipping fields on existing row.
-- Run in Supabase → SQL Editor if Checkout → Shipping save fails or still shows defaults only.

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

  if v is null then
    raise exception 'force_upsert_store_setting persist check failed for key %', k;
  end if;

  return v;
end;
$$;

alter function public.force_upsert_store_setting(text, jsonb) owner to postgres;
revoke all on function public.force_upsert_store_setting(text, jsonb) from public;
grant execute on function public.force_upsert_store_setting(text, jsonb) to service_role;

update public.store_settings
set value = coalesce(value, '{}'::jsonb) || jsonb_build_object(
  'shippingAmount', coalesce((value->>'shippingAmount')::numeric, 49),
  'shippingTitle', coalesce(nullif(value->>'shippingTitle', ''), 'Standard'),
  'freeShippingEnabled', coalesce((value->>'freeShippingEnabled')::boolean, true),
  'freeShippingThreshold', coalesce((value->>'freeShippingThreshold')::numeric, 3500)
),
updated_at = now()
where key = 'checkout';

notify pgrst, 'reload schema';
