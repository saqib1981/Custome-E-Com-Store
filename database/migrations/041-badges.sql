-- Global Sale / New badge settings (used store-wide on product cards + PDP)
insert into public.store_settings (key, value)
select
  'badges',
  jsonb_build_object(
    'showSaleBadge', coalesce((cp.value->>'showSaleBadge')::boolean, true),
    'showNewBadge', coalesce((cp.value->>'showNewBadge')::boolean, true),
    'newBadgeDays', coalesce(
      nullif(cp.value->>'newBadgeDays', '')::int,
      5
    )
  )
from (select 1) as _
left join public.store_settings cp on cp.key = 'collection-products'
on conflict (key) do nothing;
