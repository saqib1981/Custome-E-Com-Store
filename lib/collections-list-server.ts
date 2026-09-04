import type { ResolvedCollectionCard } from '@/lib/collection-cards'
import type { CollectionsListConfig } from '@/lib/collections-list'
import {
  COLLECTIONS_LIST_SETTING_KEY,
  DEFAULT_COLLECTIONS_LIST,
  normalizeCollectionsListConfig,
} from '@/lib/collections-list'
import { shopifyCollectionPath } from '@/lib/shopify-collections'
import { fetchShopifyCollectionsList } from '@/lib/shopify-collections-server'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function resolveAllCollectionsListCards(): Promise<ResolvedCollectionCard[]> {
  const { collections } = await fetchShopifyCollectionsList()

  return collections.map((collection) => ({
    id: collection.id,
    title: collection.title,
    href: shopifyCollectionPath(collection.handle),
    imageUrl: collection.imageUrl ?? '',
    imageAlt: collection.imageAlt ?? collection.title,
    productCount: collection.productCount,
  }))
}

export async function readCollectionsListConfig(): Promise<CollectionsListConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default collections list settings')
    return normalizeCollectionsListConfig(DEFAULT_COLLECTIONS_LIST)
  }

  try {
    const value = await readStoreSettingValue(COLLECTIONS_LIST_SETTING_KEY)
    if (!value) return normalizeCollectionsListConfig(DEFAULT_COLLECTIONS_LIST)
    return normalizeCollectionsListConfig(value as Partial<CollectionsListConfig>)
  } catch (e) {
    console.error('readCollectionsListConfig error:', e)
    return normalizeCollectionsListConfig(DEFAULT_COLLECTIONS_LIST)
  }
}

export async function writeCollectionsListConfig(
  config: Partial<CollectionsListConfig> | CollectionsListConfig
): Promise<CollectionsListConfig> {
  const normalized = normalizeCollectionsListConfig(config)
  const saved = await writeStoreSettingValue(
    COLLECTIONS_LIST_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeCollectionsListConfig(saved as Partial<CollectionsListConfig>)
}

export async function readResolvedCollectionsList(): Promise<{
  config: CollectionsListConfig
  cards: ResolvedCollectionCard[]
}> {
  const config = await readCollectionsListConfig()
  const cards = config.enabled ? await resolveAllCollectionsListCards() : []
  return { config, cards }
}
