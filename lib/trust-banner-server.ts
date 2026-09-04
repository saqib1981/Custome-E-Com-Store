import type { TrustBannerConfig } from '@/lib/trust-banner'
import {
  DEFAULT_TRUST_BANNER,
  TRUST_BANNER_SETTING_KEY,
  normalizeTrustBannerConfig,
} from '@/lib/trust-banner'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readTrustBannerConfig(): Promise<TrustBannerConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default trust banner settings')
    return normalizeTrustBannerConfig(DEFAULT_TRUST_BANNER)
  }

  try {
    const value = await readStoreSettingValue(TRUST_BANNER_SETTING_KEY)
    if (!value) return normalizeTrustBannerConfig(DEFAULT_TRUST_BANNER)
    return normalizeTrustBannerConfig(value as Partial<TrustBannerConfig>)
  } catch (e) {
    console.error('readTrustBannerConfig error:', e)
    return normalizeTrustBannerConfig(DEFAULT_TRUST_BANNER)
  }
}

export async function writeTrustBannerConfig(
  config: Partial<TrustBannerConfig> | TrustBannerConfig
): Promise<TrustBannerConfig> {
  const normalized = normalizeTrustBannerConfig(config)
  const saved = await writeStoreSettingValue(
    TRUST_BANNER_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeTrustBannerConfig(saved as Partial<TrustBannerConfig>)
}
