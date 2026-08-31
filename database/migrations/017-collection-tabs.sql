-- Homepage collection tabs section
insert into public.store_settings (key, value)
values (
  'collection-tabs',
  jsonb_build_object(
    'enabled', true,
    'productsPerTab', 8,
    'tabs', jsonb_build_array()
  )
)
on conflict (key) do nothing;
