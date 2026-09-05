import type { RecentProductsConfig } from '@/lib/recent-products'
import {
  DEFAULT_RECENT_PRODUCTS,
  RECENT_PRODUCTS_SETTING_KEY,
  normalizeRecentProductsConfig,
} from '@/lib/recent-products'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readRecentProductsConfig(): Promise<RecentProductsConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default recent products settings')
    return normalizeRecentProductsConfig(DEFAULT_RECENT_PRODUCTS)
  }

  try {
    const value = await readStoreSettingValue(RECENT_PRODUCTS_SETTING_KEY)
    if (!value) return normalizeRecentProductsConfig(DEFAULT_RECENT_PRODUCTS)
    return normalizeRecentProductsConfig(value as Partial<RecentProductsConfig>)
  } catch (e) {
    console.error('readRecentProductsConfig error:', e)
    return normalizeRecentProductsConfig(DEFAULT_RECENT_PRODUCTS)
  }
}

export async function writeRecentProductsConfig(
  config: Partial<RecentProductsConfig> | RecentProductsConfig
): Promise<RecentProductsConfig> {
  const normalized = normalizeRecentProductsConfig(config)
  const saved = await writeStoreSettingValue(
    RECENT_PRODUCTS_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeRecentProductsConfig(saved as Partial<RecentProductsConfig>)
}
