import {
  DEFAULT_HEADER_NAV_SETTINGS,
  HEADER_NAV_SETTINGS_KEY,
  normalizeHeaderNavSettingsConfig,
  type HeaderNavSettingsConfig,
} from '@/lib/header-settings'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

export async function readHeaderNavSettingsConfig(): Promise<HeaderNavSettingsConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default header nav settings')
    return DEFAULT_HEADER_NAV_SETTINGS
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('value')
      .eq('key', HEADER_NAV_SETTINGS_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read header nav settings error:', error.message)
      return DEFAULT_HEADER_NAV_SETTINGS
    }

    if (!data?.value) return DEFAULT_HEADER_NAV_SETTINGS

    return normalizeHeaderNavSettingsConfig(data.value as Partial<HeaderNavSettingsConfig>)
  } catch (e) {
    console.error('readHeaderNavSettingsConfig error:', e)
    return DEFAULT_HEADER_NAV_SETTINGS
  }
}

export async function writeHeaderNavSettingsConfig(
  config: Partial<HeaderNavSettingsConfig> | HeaderNavSettingsConfig
): Promise<HeaderNavSettingsConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeHeaderNavSettingsConfig(config)
  normalized.menuHighlights = normalized.menuHighlights.filter((item) => item.menuTitle.length > 0)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: HEADER_NAV_SETTINGS_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('value')
    .single()

  if (error) {
    console.error('Supabase write header nav settings error:', error.message)
    throw new Error('Failed to save header nav settings to Supabase')
  }

  return normalizeHeaderNavSettingsConfig(data.value as Partial<HeaderNavSettingsConfig>)
}
