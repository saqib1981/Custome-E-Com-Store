-- Homepage collection cards section (4 × 3:4 tiles)
insert into public.store_settings (key, value)
values (
  'collection-cards',
  jsonb_build_object(
    'enabled', true,
    'cards', jsonb_build_array()
  )
)
on conflict (key) do nothing;
