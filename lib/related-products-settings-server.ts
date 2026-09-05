import type { RelatedProductsConfig } from '@/lib/related-products'
import {
  DEFAULT_RELATED_PRODUCTS,
  RELATED_PRODUCTS_SETTING_KEY,
  normalizeRelatedProductsConfig,
} from '@/lib/related-products'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readRelatedProductsConfig(): Promise<RelatedProductsConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default related products settings')
    return normalizeRelatedProductsConfig(DEFAULT_RELATED_PRODUCTS)
  }

  try {
    const value = await readStoreSettingValue(RELATED_PRODUCTS_SETTING_KEY)
    if (!value) return normalizeRelatedProductsConfig(DEFAULT_RELATED_PRODUCTS)
    return normalizeRelatedProductsConfig(value as Partial<RelatedProductsConfig>)
  } catch (e) {
    console.error('readRelatedProductsConfig error:', e)
    return normalizeRelatedProductsConfig(DEFAULT_RELATED_PRODUCTS)
  }
}

export async function writeRelatedProductsConfig(
  config: Partial<RelatedProductsConfig> | RelatedProductsConfig
): Promise<RelatedProductsConfig> {
  const normalized = normalizeRelatedProductsConfig(config)
  const saved = await writeStoreSettingValue(
    RELATED_PRODUCTS_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeRelatedProductsConfig(saved as Partial<RelatedProductsConfig>)
}
