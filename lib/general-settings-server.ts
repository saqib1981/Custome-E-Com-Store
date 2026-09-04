import {
  DEFAULT_GENERAL_SETTINGS,
  GENERAL_SETTINGS_KEY,
  normalizeGeneralSettingsConfig,
  type GeneralSettingsConfig,
} from '@/lib/general-settings'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readGeneralSettingsConfig(): Promise<GeneralSettingsConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default general settings')
    return DEFAULT_GENERAL_SETTINGS
  }

  try {
    const value = await readStoreSettingValue(GENERAL_SETTINGS_KEY)
    if (!value) return DEFAULT_GENERAL_SETTINGS
    return normalizeGeneralSettingsConfig(value as Partial<GeneralSettingsConfig>)
  } catch (e) {
    console.error('readGeneralSettingsConfig error:', e)
    return DEFAULT_GENERAL_SETTINGS
  }
}

export async function writeGeneralSettingsConfig(
  config: Partial<GeneralSettingsConfig> | GeneralSettingsConfig
): Promise<GeneralSettingsConfig> {
  const normalized = normalizeGeneralSettingsConfig(config)
  const saved = await writeStoreSettingValue(
    GENERAL_SETTINGS_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeGeneralSettingsConfig(saved as Partial<GeneralSettingsConfig>)
}
