-- Related products section on product detail pages (/products/[handle])
insert into public.store_settings (key, value)
values (
  'related-products',
  jsonb_build_object(
    'enabled', true,
    'heading', 'Related products',
    'limit', 4,
    'columnsDesktop', 4,
    'cardImageAspect', 'square',
    'showSaleBadge', true,
    'showNewBadge', true,
    'newBadgeDays', 5
  )
)
on conflict (key) do nothing;
