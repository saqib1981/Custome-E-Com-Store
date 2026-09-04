-- New badge settings for collection product cards
update public.store_settings
set value =
  coalesce(value, '{}'::jsonb)
  || jsonb_build_object(
    'showNewBadge', true,
    'newBadgeDays', 30
  )
where key = 'collection-products'
  and (
    (value->>'showNewBadge') is null
    or (value->>'newBadgeDays') is null
  );

insert into public.store_settings (key, value)
values (
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
    'newBadgeDays', 30
  )
)
on conflict (key) do nothing;
