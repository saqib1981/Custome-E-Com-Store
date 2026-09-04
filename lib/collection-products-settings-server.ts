import type { CollectionProductsConfig } from '@/lib/collection-products'
import {
  COLLECTION_PRODUCTS_SETTING_KEY,
  DEFAULT_COLLECTION_PRODUCTS,
  normalizeCollectionProductsConfig,
} from '@/lib/collection-products'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readCollectionProductsConfig(): Promise<CollectionProductsConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default collection products settings')
    return normalizeCollectionProductsConfig(DEFAULT_COLLECTION_PRODUCTS)
  }

  try {
    const value = await readStoreSettingValue(COLLECTION_PRODUCTS_SETTING_KEY)
    if (!value) return normalizeCollectionProductsConfig(DEFAULT_COLLECTION_PRODUCTS)
    return normalizeCollectionProductsConfig(value as Partial<CollectionProductsConfig>)
  } catch (e) {
    console.error('readCollectionProductsConfig error:', e)
    return normalizeCollectionProductsConfig(DEFAULT_COLLECTION_PRODUCTS)
  }
}

export async function writeCollectionProductsConfig(
  config: Partial<CollectionProductsConfig> | CollectionProductsConfig
): Promise<CollectionProductsConfig> {
  const normalized = normalizeCollectionProductsConfig(config)
  const saved = await writeStoreSettingValue(
    COLLECTION_PRODUCTS_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeCollectionProductsConfig(saved as Partial<CollectionProductsConfig>)
}
