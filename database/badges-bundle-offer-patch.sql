-- =============================================================================
-- Patch: Bundle offer badge fields on store_settings.key = 'badges'
-- Safe to re-run. Does not wipe existing Sale / New settings.
-- Run in Supabase → SQL Editor if your project already has a `badges` row.
-- New installs that run store-settings.sql already include these keys.
-- =============================================================================

do $$
declare
  k text := 'badges';
  v jsonb;
begin
  select value into v from public.store_settings where key = k;

  if v is null then
    insert into public.store_settings (key, value, updated_at)
    values (
      k,
      jsonb_build_object(
        'showSaleBadge', true,
        'showNewBadge', true,
        'newBadgeDays', 30,
        'showCustomBadge', true,
        'customBadgeBackgroundColor', '#dc2626',
        'customBadgeTextColor', '#ffffff'
      ),
      now()
    );
    return;
  end if;

  -- Only fill missing keys; keep merchant-chosen Sale/New/days values.
  v := v
    || jsonb_build_object(
      'showCustomBadge', coalesce((v ->> 'showCustomBadge')::boolean, true),
      'customBadgeBackgroundColor', coalesce(
        nullif(v ->> 'customBadgeBackgroundColor', ''),
        '#dc2626'
      ),
      'customBadgeTextColor', coalesce(
        nullif(v ->> 'customBadgeTextColor', ''),
        '#ffffff'
      )
    );

  update public.store_settings
  set value = v, updated_at = now()
  where key = k;
end $$;
