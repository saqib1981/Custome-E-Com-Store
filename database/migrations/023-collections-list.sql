-- Collections list page (/collections) — all Shopify collections as cards
insert into public.store_settings (key, value)
values (
  'collections-list',
  jsonb_build_object(
    'enabled', true,
    'titlePosition', 'overlay',
    'pageTitle', 'Collections',
    'columnsDesktop', 4,
    'pageSize', 24,
    'paginationMode', 'pagination'
  )
)
on conflict (key) do nothing;
