-- Custom E-Com Store — store settings (theme editor, announcement bar, etc.)
-- Run once in Supabase → SQL Editor

create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.store_settings is 'Admin-managed store/theme settings keyed by section (e.g. announcement).';

-- Default announcement bar (matches lib/announcement.ts)
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

-- Default logo and favicon (global theme settings)
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

-- Default general theme settings
insert into public.store_settings (key, value)
values (
  'general',
  jsonb_build_object(
    'backgroundColor', '#ffffff'
  )
)
on conflict (key) do nothing;

-- Default floating buttons (back to top + WhatsApp)
insert into public.store_settings (key, value)
values (
  'floating-buttons',
  jsonb_build_object(
    'backToTopEnabled', true,
    'whatsappEnabled', false,
    'whatsappNumber', ''
  )
)
on conflict (key) do nothing;

-- Default global Sale / New badges
insert into public.store_settings (key, value)
values (
  'badges',
  jsonb_build_object(
    'showSaleBadge', true,
    'showNewBadge', true,
    'newBadgeDays', 30
  )
)
on conflict (key) do nothing;

-- Default customer account page
insert into public.store_settings (key, value)
values (
  'account',
  jsonb_build_object(
    'enabled', true,
    'loginTitle', 'Login',
    'registerTitle', 'Create account',
    'accountTitle', 'My account',
    'showRegister', true,
    'showRecoverPassword', true,
    'showOrders', true,
    'showAddresses', true,
    'loginButtonLabel', 'Sign in',
    'registerButtonLabel', 'Create',
    'logoutButtonLabel', 'Log out'
  )
)
on conflict (key) do nothing;

alter table public.store_settings enable row level security;

-- No public policies: reads/writes go through Next.js API using the service role key.

create or replace function public.store_settings_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists store_settings_updated_at on public.store_settings;
create trigger store_settings_updated_at
  before update on public.store_settings
  for each row
  execute function public.store_settings_set_updated_at();
