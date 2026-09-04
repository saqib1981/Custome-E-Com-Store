import type { StoreFooterConfig } from '@/lib/store-footer'
import {
  DEFAULT_STORE_FOOTER,
  STORE_FOOTER_SETTING_KEY,
  normalizeStoreFooterConfig,
} from '@/lib/store-footer'
import { assertShopifyFilesUrl } from '@/lib/store-media'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readStoreFooterConfig(): Promise<StoreFooterConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default store footer settings')
    return normalizeStoreFooterConfig(DEFAULT_STORE_FOOTER)
  }

  try {
    const value = await readStoreSettingValue(STORE_FOOTER_SETTING_KEY)
    if (!value) return normalizeStoreFooterConfig(DEFAULT_STORE_FOOTER)
    return normalizeStoreFooterConfig(value as Partial<StoreFooterConfig>)
  } catch (e) {
    console.error('readStoreFooterConfig error:', e)
    return normalizeStoreFooterConfig(DEFAULT_STORE_FOOTER)
  }
}

export async function writeStoreFooterConfig(
  config: Partial<StoreFooterConfig> | StoreFooterConfig
): Promise<StoreFooterConfig> {
  const normalized = normalizeStoreFooterConfig(config)
  assertShopifyFilesUrl(normalized.logoUrl, 'Footer logo')

  const saved = await writeStoreSettingValue(
    STORE_FOOTER_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeStoreFooterConfig(saved as Partial<StoreFooterConfig>)
}
