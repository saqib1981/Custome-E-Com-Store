import {
  DEFAULT_GENERAL_SETTINGS,
  GENERAL_SETTINGS_KEY,
  normalizeGeneralSettingsConfig,
  type GeneralSettingsConfig,
} from '@/lib/general-settings'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

export async function readGeneralSettingsConfig(): Promise<GeneralSettingsConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default general settings')
    return DEFAULT_GENERAL_SETTINGS
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('value')
      .eq('key', GENERAL_SETTINGS_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read general settings error:', error.message)
      return DEFAULT_GENERAL_SETTINGS
    }

    if (!data?.value) return DEFAULT_GENERAL_SETTINGS

    return normalizeGeneralSettingsConfig(data.value as Partial<GeneralSettingsConfig>)
  } catch (e) {
    console.error('readGeneralSettingsConfig error:', e)
    return DEFAULT_GENERAL_SETTINGS
  }
}

export async function writeGeneralSettingsConfig(
  config: Partial<GeneralSettingsConfig> | GeneralSettingsConfig
): Promise<GeneralSettingsConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeGeneralSettingsConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: GENERAL_SETTINGS_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('value')
    .single()

  if (error) {
    console.error('Supabase write general settings error:', error.message)
    throw new Error('Failed to save general settings to Supabase')
  }

  return normalizeGeneralSettingsConfig(data.value as Partial<GeneralSettingsConfig>)
}
