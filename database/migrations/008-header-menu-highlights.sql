-- Add menu item highlight blocks to header nav settings
update public.store_settings
set value = value || jsonb_build_object('menuHighlights', '[]'::jsonb)
where key = 'header-nav'
  and not (value ? 'menuHighlights');
