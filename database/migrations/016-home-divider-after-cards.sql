-- Homepage divider below collection cards (theme editor)
insert into public.store_settings (key, value)
values (
  'home-divider-after-cards',
  jsonb_build_object(
    'enabled', true,
    'lineColor', '#e5e7eb',
    'gapTop', '15px',
    'gapBottom', '15px'
  )
)
on conflict (key) do nothing;
