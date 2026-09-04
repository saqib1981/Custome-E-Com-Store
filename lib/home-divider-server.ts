import type { HomeDividerConfig } from '@/lib/home-divider'
import {
  DEFAULT_HOME_DIVIDER,
  HOME_DIVIDER_AFTER_CARDS_SETTING_KEY,
  HOME_DIVIDER_AFTER_TABS_SETTING_KEY,
  HOME_DIVIDER_AFTER_TRUST_BANNER_SETTING_KEY,
  HOME_DIVIDER_SETTING_KEY,
  normalizeHomeDividerConfig,
} from '@/lib/home-divider'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

async function readDividerConfigByKey(
  settingKey: string,
  defaultConfig: HomeDividerConfig
): Promise<HomeDividerConfig> {
  if (!isSupabaseConfigured()) {
    console.warn(`Supabase not configured — using default divider settings (${settingKey})`)
    return defaultConfig
  }

  try {
    const value = await readStoreSettingValue(settingKey)
    if (!value) return defaultConfig
    return normalizeHomeDividerConfig(value as Partial<HomeDividerConfig>)
  } catch (e) {
    console.error(`readDividerConfigByKey error (${settingKey}):`, e)
    return defaultConfig
  }
}

async function writeDividerConfigByKey(
  settingKey: string,
  config: Partial<HomeDividerConfig> | HomeDividerConfig
): Promise<HomeDividerConfig> {
  const normalized = normalizeHomeDividerConfig(config)
  const saved = await writeStoreSettingValue(
    settingKey,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeHomeDividerConfig(saved as Partial<HomeDividerConfig>)
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

export async function readHomeDividerAfterTabsConfig(): Promise<HomeDividerConfig> {
  return readDividerConfigByKey(HOME_DIVIDER_AFTER_TABS_SETTING_KEY, DEFAULT_HOME_DIVIDER)
}

export async function writeHomeDividerAfterTabsConfig(
  config: Partial<HomeDividerConfig> | HomeDividerConfig
): Promise<HomeDividerConfig> {
  return writeDividerConfigByKey(HOME_DIVIDER_AFTER_TABS_SETTING_KEY, config)
}

export async function readHomeDividerAfterTrustBannerConfig(): Promise<HomeDividerConfig> {
  return readDividerConfigByKey(HOME_DIVIDER_AFTER_TRUST_BANNER_SETTING_KEY, DEFAULT_HOME_DIVIDER)
}

export async function writeHomeDividerAfterTrustBannerConfig(
  config: Partial<HomeDividerConfig> | HomeDividerConfig
): Promise<HomeDividerConfig> {
  return writeDividerConfigByKey(HOME_DIVIDER_AFTER_TRUST_BANNER_SETTING_KEY, config)
}
