-- Migration: announcement bar height control
-- Run in Supabase → SQL Editor if you already have store_settings without height.
-- Safe to run multiple times.

update public.store_settings
set value = value || jsonb_build_object('height', coalesce(value->>'height', '36px'))
where key = 'announcement'
  and value->>'height' is null;

insert into public.store_settings (key, value)
values (
  'announcement',
  jsonb_build_object(
    'enabled', true,
    'message', 'Free shipping on orders above PKR 3500 in Pakistan',
    'speed', '15s',
    'gap', '3rem',
    'backgroundColor', '#0369a1',
    'textColor', '#ffffff',
    'height', '36px'
  )
)
on conflict (key) do nothing;
