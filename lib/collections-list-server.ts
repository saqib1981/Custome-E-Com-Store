import type { ResolvedCollectionCard } from '@/lib/collection-cards'
import type { CollectionsListConfig } from '@/lib/collections-list'
import {
  COLLECTIONS_LIST_SETTING_KEY,
  DEFAULT_COLLECTIONS_LIST,
  normalizeCollectionsListConfig,
} from '@/lib/collections-list'
import { shopifyCollectionPath } from '@/lib/shopify-collections'
import { fetchShopifyCollectionsList } from '@/lib/shopify-collections-server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

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
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('*')
      .eq('key', COLLECTIONS_LIST_SETTING_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read collections list error:', error.message)
      return normalizeCollectionsListConfig(DEFAULT_COLLECTIONS_LIST)
    }

    if (!data?.value) return normalizeCollectionsListConfig(DEFAULT_COLLECTIONS_LIST)

    return normalizeCollectionsListConfig(data.value as Partial<CollectionsListConfig>)
  } catch (e) {
    console.error('readCollectionsListConfig error:', e)
    return normalizeCollectionsListConfig(DEFAULT_COLLECTIONS_LIST)
  }
}

export async function writeCollectionsListConfig(
  config: Partial<CollectionsListConfig> | CollectionsListConfig
): Promise<CollectionsListConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeCollectionsListConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: COLLECTIONS_LIST_SETTING_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('*')
    .single()

  if (error) {
    console.error('Supabase write collections list error:', error.message)
    throw new Error('Failed to save collections list settings to Supabase')
  }

  return normalizeCollectionsListConfig(data.value as Partial<CollectionsListConfig>)
}

export async function readResolvedCollectionsList(): Promise<{
  config: CollectionsListConfig
  cards: ResolvedCollectionCard[]
}> {
  const config = await readCollectionsListConfig()
  const cards = config.enabled ? await resolveAllCollectionsListCards() : []
  return { config, cards }
}
