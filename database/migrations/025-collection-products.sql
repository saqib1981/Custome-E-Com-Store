-- Collection page products grid (/collections/[handle])
insert into public.store_settings (key, value)
values (
  'collection-products',
  jsonb_build_object(
    'enabled', true,
    'columnsDesktop', 4,
    'pageSize', 24,
    'paginationMode', 'load-more',
    'defaultSort', 'manual',
    'showSaleBadge', true
  )
)
on conflict (key) do nothing;
