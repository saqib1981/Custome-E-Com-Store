-- Desktop menu title colors and nav bar border
insert into public.store_settings (key, value)
values (
  'header-nav',
  jsonb_build_object(
    'linkColor', '#1f2937',
    'linkHoverColor', '#0284c7',
    'linkActiveColor', '#0284c7',
    'linkActiveUnderlineColor', '#0284c7',
    'navBorderColor', '#e5e7eb'
  )
)
on conflict (key) do nothing;
