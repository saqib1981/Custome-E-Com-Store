-- Enable Realtime for store_settings (safe to re-run).
-- Run in Supabase SQL Editor if live sync is not updating storefront tabs.

do $$
begin
  alter publication supabase_realtime add table public.store_settings;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'supabase_realtime publication missing — enable Realtime in Supabase dashboard';
end $$;
