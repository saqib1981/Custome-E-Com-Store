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
import { formatMoney } from '@/lib/format-money'
import { shopifyCollectionPath } from '@/lib/shopify-collections'
import { fetchShopifyCollectionWithProducts } from '@/lib/shopify-collections-server'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

function isOnSale(
  product: Awaited<ReturnType<typeof fetchShopifyCollectionWithProducts>>['products'][number]
): boolean {
  const price = Number(product.priceAmount)
  const compare = Number(product.compareAtAmount)
  return Number.isFinite(price) && Number.isFinite(compare) && compare > price
}

function mapProduct(
  product: Awaited<ReturnType<typeof fetchShopifyCollectionWithProducts>>['products'][number]
): ResolvedCollectionTabProduct {
  const onSale = isOnSale(product)
  return {
    id: product.id,
    title: product.title,
    href: shopifyProductPath(product.handle),
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    price: formatMoney(product.priceAmount, product.priceCurrency),
    compareAtPrice: onSale
      ? formatMoney(product.compareAtAmount, product.compareAtCurrency)
      : '',
    onSale,
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
    const value = await readStoreSettingValue(COLLECTION_TABS_SETTING_KEY)
    if (!value) return normalizeCollectionTabsConfig(DEFAULT_COLLECTION_TABS)
    return normalizeCollectionTabsConfig(value as Partial<CollectionTabsConfig>)
  } catch (e) {
    console.error('readCollectionTabsConfig error:', e)
    return normalizeCollectionTabsConfig(DEFAULT_COLLECTION_TABS)
  }
}

export async function writeCollectionTabsConfig(
  config: Partial<CollectionTabsConfig> | CollectionTabsConfig
): Promise<CollectionTabsConfig> {
  const normalized = normalizeCollectionTabsConfig(config)
  const saved = await writeStoreSettingValue(
    COLLECTION_TABS_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeCollectionTabsConfig(saved as Partial<CollectionTabsConfig>)
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
