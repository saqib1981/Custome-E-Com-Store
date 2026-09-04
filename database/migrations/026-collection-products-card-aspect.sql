-- Uniform product card image aspect on collection pages
update public.store_settings
set value = coalesce(value, '{}'::jsonb) || jsonb_build_object('cardImageAspect', 'square')
where key = 'collection-products'
  and (value->>'cardImageAspect') is null;

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
    'showSaleBadge', true
  )
)
on conflict (key) do nothing;
