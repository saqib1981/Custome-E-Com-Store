-- Shopify menu selection for header navigation (menuId + menuHandle)
-- Empty menuId/menuHandle → app uses store default main-menu automatically.

insert into public.store_settings (key, value)
values (
  'header-nav',
  jsonb_build_object(
    'menuId', '',
    'menuHandle', '',
    'linkColor', '#1f2937',
    'linkHoverColor', '#0284c7',
    'linkActiveColor', '#0284c7',
    'linkActiveUnderlineColor', '#0284c7',
    'navBorderColor', '#e5e7eb',
    'menuHighlights', '[]'::jsonb
  )
)
on conflict (key) do nothing;

-- Add fields to existing header-nav row (safe to re-run)
update public.store_settings
set value = value || jsonb_build_object('menuId', '')
where key = 'header-nav'
  and not (value ? 'menuId');

update public.store_settings
set value = value || jsonb_build_object('menuHandle', '')
where key = 'header-nav'
  and not (value ? 'menuHandle');

update public.store_settings
set value = value || jsonb_build_object('menuHighlights', '[]'::jsonb)
where key = 'header-nav'
  and not (value ? 'menuHighlights');
