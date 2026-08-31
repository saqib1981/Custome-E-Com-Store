-- General theme settings (background color, etc.)
insert into public.store_settings (key, value)
values (
  'general',
  jsonb_build_object(
    'backgroundColor', '#ffffff'
  )
)
on conflict (key) do nothing;
