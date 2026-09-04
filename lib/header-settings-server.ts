import {
  DEFAULT_HEADER_NAV_SETTINGS,
  HEADER_NAV_SETTINGS_KEY,
  normalizeHeaderNavSettingsConfig,
  type HeaderNavSettingsConfig,
} from '@/lib/header-settings'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readHeaderNavSettingsConfig(): Promise<HeaderNavSettingsConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default header nav settings')
    return DEFAULT_HEADER_NAV_SETTINGS
  }

  try {
    const value = await readStoreSettingValue(HEADER_NAV_SETTINGS_KEY)
    if (!value) return DEFAULT_HEADER_NAV_SETTINGS
    return normalizeHeaderNavSettingsConfig(value as Partial<HeaderNavSettingsConfig>)
  } catch (e) {
    console.error('readHeaderNavSettingsConfig error:', e)
    return DEFAULT_HEADER_NAV_SETTINGS
  }
}

export async function writeHeaderNavSettingsConfig(
  config: Partial<HeaderNavSettingsConfig> | HeaderNavSettingsConfig
): Promise<HeaderNavSettingsConfig> {
  const normalized = normalizeHeaderNavSettingsConfig(config)
  normalized.menuHighlights = normalized.menuHighlights.filter((item) => item.menuTitle.length > 0)

  const saved = await writeStoreSettingValue(
    HEADER_NAV_SETTINGS_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeHeaderNavSettingsConfig(saved as Partial<HeaderNavSettingsConfig>)
}
