import type { ProductPageConfig } from '@/lib/product-page'
import {
  DEFAULT_PRODUCT_PAGE,
  PRODUCT_PAGE_SETTING_KEY,
  normalizeProductPageConfig,
} from '@/lib/product-page'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readProductPageConfig(): Promise<ProductPageConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default product page settings')
    return normalizeProductPageConfig(DEFAULT_PRODUCT_PAGE)
  }

  try {
    const value = await readStoreSettingValue(PRODUCT_PAGE_SETTING_KEY)
    if (!value) return normalizeProductPageConfig(DEFAULT_PRODUCT_PAGE)
    return normalizeProductPageConfig(value as Partial<ProductPageConfig>)
  } catch (e) {
    console.error('readProductPageConfig error:', e)
    return normalizeProductPageConfig(DEFAULT_PRODUCT_PAGE)
  }
}

export async function writeProductPageConfig(
  config: Partial<ProductPageConfig> | ProductPageConfig
): Promise<ProductPageConfig> {
  const normalized = normalizeProductPageConfig(config)
  const saved = await writeStoreSettingValue(
    PRODUCT_PAGE_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeProductPageConfig(saved as Partial<ProductPageConfig>)
}
