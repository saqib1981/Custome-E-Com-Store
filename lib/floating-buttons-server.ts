import type { FloatingButtonsConfig } from '@/lib/floating-buttons'
import {
  DEFAULT_FLOATING_BUTTONS,
  FLOATING_BUTTONS_SETTING_KEY,
  normalizeFloatingButtonsConfig,
} from '@/lib/floating-buttons'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readFloatingButtonsConfig(): Promise<FloatingButtonsConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default floating buttons settings')
    return normalizeFloatingButtonsConfig(DEFAULT_FLOATING_BUTTONS)
  }

  try {
    const value = await readStoreSettingValue(FLOATING_BUTTONS_SETTING_KEY)
    if (!value) return normalizeFloatingButtonsConfig(DEFAULT_FLOATING_BUTTONS)
    return normalizeFloatingButtonsConfig(value as Partial<FloatingButtonsConfig>)
  } catch (e) {
    console.error('readFloatingButtonsConfig error:', e)
    return normalizeFloatingButtonsConfig(DEFAULT_FLOATING_BUTTONS)
  }
}

export async function writeFloatingButtonsConfig(
  config: Partial<FloatingButtonsConfig> | FloatingButtonsConfig
): Promise<FloatingButtonsConfig> {
  const normalized = normalizeFloatingButtonsConfig(config)
  const saved = await writeStoreSettingValue(
    FLOATING_BUTTONS_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeFloatingButtonsConfig(saved as Partial<FloatingButtonsConfig>)
}
