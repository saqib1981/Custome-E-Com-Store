import type { BadgesConfig } from '@/lib/badges'
import {
  BADGES_SETTING_KEY,
  DEFAULT_BADGES,
  normalizeBadgesConfig,
} from '@/lib/badges'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readBadgesConfig(): Promise<BadgesConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default badge settings')
    return normalizeBadgesConfig(DEFAULT_BADGES)
  }

  try {
    const value = await readStoreSettingValue(BADGES_SETTING_KEY)
    if (!value) return normalizeBadgesConfig(DEFAULT_BADGES)
    return normalizeBadgesConfig(value as Partial<BadgesConfig>)
  } catch (e) {
    console.error('readBadgesConfig error:', e)
    return normalizeBadgesConfig(DEFAULT_BADGES)
  }
}

export async function writeBadgesConfig(
  config: Partial<BadgesConfig> | BadgesConfig
): Promise<BadgesConfig> {
  const normalized = normalizeBadgesConfig(config)
  const saved = await writeStoreSettingValue(
    BADGES_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeBadgesConfig(saved as Partial<BadgesConfig>)
}
