-- Product page divider below related products (before footer)
insert into public.store_settings (key, value)
values (
  'home-divider-after-related-products',
  jsonb_build_object(
    'enabled', true,
    'lineColor', '#e5e7eb',
    'gapTop', '15px',
    'gapBottom', '15px'
  )
)
on conflict (key) do nothing;
