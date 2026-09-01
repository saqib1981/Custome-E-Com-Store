import type { CollectionCardSlot, CollectionCardsConfig, ResolvedCollectionCard } from '@/lib/collection-cards'
import {
  COLLECTION_CARDS_SETTING_KEY,
  DEFAULT_COLLECTION_CARDS,
  normalizeCollectionCardsConfig,
} from '@/lib/collection-cards'
import { shopifyCollectionPath } from '@/lib/shopify-collections'
import { fetchShopifyCollectionDetail } from '@/lib/shopify-collections-server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

export async function resolveCollectionCards(
  slots: CollectionCardSlot[]
): Promise<ResolvedCollectionCard[]> {
  const results = await Promise.all(
    slots.map(async (slot) => {
      if (!slot.collectionId && !slot.collectionHandle) {
        return {
          id: slot.id,
          title: '',
          href: '',
          imageUrl: '',
          imageAlt: '',
        }
      }

      const collection = await fetchShopifyCollectionDetail({
        collectionId: slot.collectionId,
        collectionHandle: slot.collectionHandle,
      })

      if (!collection) {
        return {
          id: slot.id,
          title: slot.collectionHandle || 'Collection',
          href: slot.collectionHandle ? shopifyCollectionPath(slot.collectionHandle) : '',
          imageUrl: '',
          imageAlt: slot.collectionHandle || 'Collection',
        }
      }

      return {
        id: slot.id,
        title: collection.title,
        href: shopifyCollectionPath(collection.handle),
        imageUrl: collection.imageUrl ?? '',
        imageAlt: collection.imageAlt ?? collection.title,
        productCount: collection.productCount,
      }
    })
  )

  return results
}

export async function readCollectionCardsConfig(): Promise<CollectionCardsConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default collection cards settings')
    return normalizeCollectionCardsConfig(DEFAULT_COLLECTION_CARDS)
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('value')
      .eq('key', COLLECTION_CARDS_SETTING_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read collection cards error:', error.message)
      return normalizeCollectionCardsConfig(DEFAULT_COLLECTION_CARDS)
    }

    if (!data?.value) return normalizeCollectionCardsConfig(DEFAULT_COLLECTION_CARDS)

    return normalizeCollectionCardsConfig(data.value as Partial<CollectionCardsConfig>)
  } catch (e) {
    console.error('readCollectionCardsConfig error:', e)
    return normalizeCollectionCardsConfig(DEFAULT_COLLECTION_CARDS)
  }
}

export async function writeCollectionCardsConfig(
  config: Partial<CollectionCardsConfig> | CollectionCardsConfig
): Promise<CollectionCardsConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeCollectionCardsConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: COLLECTION_CARDS_SETTING_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('value')
    .single()

  if (error) {
    console.error('Supabase write collection cards error:', error.message)
    throw new Error('Failed to save collection cards settings to Supabase')
  }

  return normalizeCollectionCardsConfig(data.value as Partial<CollectionCardsConfig>)
}

export async function readResolvedCollectionCards(): Promise<{
  config: CollectionCardsConfig
  cards: ResolvedCollectionCard[]
}> {
  const config = await readCollectionCardsConfig()
  const cards = config.enabled ? await resolveCollectionCards(config.cards) : []
  return { config, cards }
}
