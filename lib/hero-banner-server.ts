import {
  assertHeroBannerMediaUrls,
  DEFAULT_HERO_BANNER,
  HERO_BANNER_SETTING_KEY,
  normalizeHeroBannerConfig,
  type HeroBannerConfig,
} from '@/lib/hero-banner'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readHeroBannerConfig(): Promise<HeroBannerConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default hero banner settings')
    return DEFAULT_HERO_BANNER
  }

  try {
    const value = await readStoreSettingValue(HERO_BANNER_SETTING_KEY)
    if (!value) return DEFAULT_HERO_BANNER
    return normalizeHeroBannerConfig(value as Partial<HeroBannerConfig>)
  } catch (e) {
    console.error('readHeroBannerConfig error:', e)
    return DEFAULT_HERO_BANNER
  }
}

export async function writeHeroBannerConfig(
  config: Partial<HeroBannerConfig> | HeroBannerConfig
): Promise<HeroBannerConfig> {
  const normalized = assertHeroBannerMediaUrls(normalizeHeroBannerConfig(config))
  const saved = await writeStoreSettingValue(
    HERO_BANNER_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeHeroBannerConfig(saved as Partial<HeroBannerConfig>)
}
