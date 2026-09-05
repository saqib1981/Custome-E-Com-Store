-- Product page divider between product details and related products
insert into public.store_settings (key, value)
values (
  'home-divider-after-product',
  jsonb_build_object(
    'enabled', true,
    'lineColor', '#e5e7eb',
    'gapTop', '15px',
    'gapBottom', '15px'
  )
)
on conflict (key) do nothing;
