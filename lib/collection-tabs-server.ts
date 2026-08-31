import type {
  CollectionTabSlot,
  CollectionTabsConfig,
  ResolvedCollectionTab,
  ResolvedCollectionTabProduct,
} from '@/lib/collection-tabs'
import {
  COLLECTION_TABS_SETTING_KEY,
  DEFAULT_COLLECTION_TABS,
  normalizeCollectionTabsConfig,
  shopifyProductPath,
} from '@/lib/collection-tabs'
import { shopifyCollectionPath } from '@/lib/shopify-collections'
import { fetchShopifyCollectionWithProducts } from '@/lib/shopify-collections-server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

function formatProductPrice(amount: string, currencyCode: string): string {
  const value = Number(amount)
  if (!Number.isFinite(value)) return ''
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(value)
  } catch {
    return `${currencyCode} ${amount}`
  }
}

function mapProduct(
  product: Awaited<ReturnType<typeof fetchShopifyCollectionWithProducts>>['products'][number]
): ResolvedCollectionTabProduct {
  return {
    id: product.id,
    title: product.title,
    href: shopifyProductPath(product.handle),
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    price: formatProductPrice(product.priceAmount, product.priceCurrency),
  }
}

export async function resolveCollectionTabs(
  slots: CollectionTabSlot[],
  productsPerTab: number
): Promise<ResolvedCollectionTab[]> {
  const results = await Promise.all(
    slots.map(async (slot) => {
      if (!slot.collectionId && !slot.collectionHandle) {
        return {
          id: slot.id,
          title: '',
          href: '',
          products: [],
        }
      }

      const { collection, products } = await fetchShopifyCollectionWithProducts(
        {
          collectionId: slot.collectionId,
          collectionHandle: slot.collectionHandle,
        },
        productsPerTab
      )

      if (!collection) {
        return {
          id: slot.id,
          title: slot.collectionHandle || 'Collection',
          href: slot.collectionHandle ? shopifyCollectionPath(slot.collectionHandle) : '',
          products: [],
        }
      }

      return {
        id: slot.id,
        title: collection.title,
        href: shopifyCollectionPath(collection.handle),
        products: products.map(mapProduct),
      }
    })
  )

  return results.filter((tab) => tab.title && tab.href)
}

export async function readCollectionTabsConfig(): Promise<CollectionTabsConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default collection tabs settings')
    return normalizeCollectionTabsConfig(DEFAULT_COLLECTION_TABS)
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('value')
      .eq('key', COLLECTION_TABS_SETTING_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read collection tabs error:', error.message)
      return normalizeCollectionTabsConfig(DEFAULT_COLLECTION_TABS)
    }

    if (!data?.value) return normalizeCollectionTabsConfig(DEFAULT_COLLECTION_TABS)

    return normalizeCollectionTabsConfig(data.value as Partial<CollectionTabsConfig>)
  } catch (e) {
    console.error('readCollectionTabsConfig error:', e)
    return normalizeCollectionTabsConfig(DEFAULT_COLLECTION_TABS)
  }
}

export async function writeCollectionTabsConfig(
  config: Partial<CollectionTabsConfig> | CollectionTabsConfig
): Promise<CollectionTabsConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeCollectionTabsConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: COLLECTION_TABS_SETTING_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('value')
    .single()

  if (error) {
    console.error('Supabase write collection tabs error:', error.message)
    throw new Error('Failed to save collection tabs settings to Supabase')
  }

  return normalizeCollectionTabsConfig(data.value as Partial<CollectionTabsConfig>)
}

export async function readResolvedCollectionTabs(): Promise<{
  config: CollectionTabsConfig
  tabs: ResolvedCollectionTab[]
}> {
  const config = await readCollectionTabsConfig()
  const configuredTabs = config.tabs.filter((tab) => tab.collectionId || tab.collectionHandle)
  const tabs =
    config.enabled && configuredTabs.length
      ? await resolveCollectionTabs(configuredTabs, config.productsPerTab)
      : []
  return { config, tabs }
}
