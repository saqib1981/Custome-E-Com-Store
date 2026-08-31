-- Migration: Logo and favicon global settings
-- Run in Supabase → SQL Editor if store_settings already exists.
-- Safe to run multiple times.

insert into public.store_settings (key, value)
values (
  'logo-favicon',
  jsonb_build_object(
    'faviconUrl', '',
    'faviconFileName', '',
    'logoUrl', '',
    'logoFileName', '',
    'logoTransparentUrl', '',
    'logoTransparentFileName', '',
    'logoWidthDesktop', 200,
    'logoWidthMobile', 150
  )
)
on conflict (key) do nothing;
