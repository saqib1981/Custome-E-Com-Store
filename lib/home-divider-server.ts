import type { HomeDividerConfig } from '@/lib/home-divider'
import {
  DEFAULT_HOME_DIVIDER,
  HOME_DIVIDER_AFTER_CARDS_SETTING_KEY,
  HOME_DIVIDER_SETTING_KEY,
  normalizeHomeDividerConfig,
} from '@/lib/home-divider'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

async function readDividerConfigByKey(
  settingKey: string,
  defaultConfig: HomeDividerConfig
): Promise<HomeDividerConfig> {
  if (!isSupabaseConfigured()) {
    console.warn(`Supabase not configured — using default divider settings (${settingKey})`)
    return defaultConfig
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('value')
      .eq('key', settingKey)
      .maybeSingle()

    if (error) {
      console.error(`Supabase read divider error (${settingKey}):`, error.message)
      return defaultConfig
    }

    if (!data?.value) return defaultConfig

    return normalizeHomeDividerConfig(data.value as Partial<HomeDividerConfig>)
  } catch (e) {
    console.error(`readDividerConfigByKey error (${settingKey}):`, e)
    return defaultConfig
  }
}

async function writeDividerConfigByKey(
  settingKey: string,
  config: Partial<HomeDividerConfig> | HomeDividerConfig
): Promise<HomeDividerConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeHomeDividerConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: settingKey,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('value')
    .single()

  if (error) {
    console.error(`Supabase write divider error (${settingKey}):`, error.message)
    throw new Error('Failed to save divider settings to Supabase')
  }

  return normalizeHomeDividerConfig(data.value as Partial<HomeDividerConfig>)
}

export async function readHomeDividerConfig(): Promise<HomeDividerConfig> {
  return readDividerConfigByKey(HOME_DIVIDER_SETTING_KEY, DEFAULT_HOME_DIVIDER)
}

export async function writeHomeDividerConfig(
  config: Partial<HomeDividerConfig> | HomeDividerConfig
): Promise<HomeDividerConfig> {
  return writeDividerConfigByKey(HOME_DIVIDER_SETTING_KEY, config)
}

export async function readHomeDividerAfterCardsConfig(): Promise<HomeDividerConfig> {
  return readDividerConfigByKey(HOME_DIVIDER_AFTER_CARDS_SETTING_KEY, DEFAULT_HOME_DIVIDER)
}

export async function writeHomeDividerAfterCardsConfig(
  config: Partial<HomeDividerConfig> | HomeDividerConfig
): Promise<HomeDividerConfig> {
  return writeDividerConfigByKey(HOME_DIVIDER_AFTER_CARDS_SETTING_KEY, config)
}
