-- Migration: announcement bar text + background colors
-- Run in Supabase → SQL Editor if you already ran store-settings.sql before this feature.
-- Safe to run multiple times.

update public.store_settings
set value = value
  || jsonb_build_object(
    'backgroundColor', coalesce(value->>'backgroundColor', '#0369a1'),
    'textColor', coalesce(value->>'textColor', '#ffffff')
  )
where key = 'announcement'
  and (
    value->>'backgroundColor' is null
    or value->>'textColor' is null
  );

-- If announcement row is missing entirely, insert full defaults:
insert into public.store_settings (key, value)
values (
  'announcement',
  jsonb_build_object(
    'enabled', true,
    'message', 'Free shipping on orders above PKR 3500 in Pakistan',
    'speed', '15s',
    'gap', '3rem',
    'backgroundColor', '#0369a1',
    'textColor', '#ffffff'
  )
)
on conflict (key) do nothing;
