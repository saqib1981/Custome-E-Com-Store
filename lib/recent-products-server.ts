import { formatMoney } from '@/lib/format-money'
import {
  isProductCreatedWithinDays,
  toCollectionProductCard,
  type CollectionProductCard,
} from '@/lib/collection-products'
import { isShopifyConfigured } from '@/lib/shopify-config'
import {
  fetchShopifyProductsByHandles,
  type ShopifyCollectionProduct,
} from '@/lib/shopify-collections-server'
import { readRecentProductsConfig } from '@/lib/recent-products-settings-server'
import {
  normalizeRecentProductsConfig,
  type RecentProductsConfig,
} from '@/lib/recent-products'
import { applyBadgesConfig } from '@/lib/badges'
import { readBadgesConfig } from '@/lib/badges-server'
import { isProductPagePreviewPlaceholder } from '@/lib/product-page'
import { fetchShopifyProductByHandle } from '@/lib/shopify-product-server'

export type ResolvedRecentProducts = {
  config: RecentProductsConfig
  products: CollectionProductCard[]
  error?: string
}

function isOnSale(product: ShopifyCollectionProduct): boolean {
  const price = Number(product.priceAmount)
  const compare = Number(product.compareAtAmount)
  return Number.isFinite(price) && Number.isFinite(compare) && compare > price
}

function hasNewTag(product: ShopifyCollectionProduct): boolean {
  return product.tags.some((tag) => tag.toLowerCase() === 'new')
}

function mapProduct(
  product: ShopifyCollectionProduct,
  newBadgeDays: number
): CollectionProductCard {
  const taggedNew = hasNewTag(product)
  return toCollectionProductCard({
    id: product.id,
    title: product.title,
    handle: product.handle,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    price: formatMoney(product.priceAmount, product.priceCurrency),
    compareAtPrice: isOnSale(product)
      ? formatMoney(product.compareAtAmount, product.compareAtCurrency)
      : '',
    onSale: isOnSale(product),
    isNew: taggedNew || isProductCreatedWithinDays(product.createdAt, newBadgeDays),
    createdAt: product.createdAt,
    hasNewTag: taggedNew,
    available: product.available,
  })
}

function normalizeViewedHandles(handles: string[] | undefined): string[] {
  if (!Array.isArray(handles)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of handles) {
    const handle = String(raw ?? '').trim()
    if (!handle || handle.toLowerCase() === 'example') continue
    const key = handle.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(handle)
    if (out.length >= 24) break
  }
  return out
}

export async function resolveRecentProducts(
  handle: string,
  options?: { limit?: number; viewedHandles?: string[] }
): Promise<ResolvedRecentProducts> {
  const config = await readRecentProductsConfig()
  const badges = await readBadgesConfig()
  const normalized = applyBadgesConfig(normalizeRecentProductsConfig(config), badges)
  const limitOverride = Number(options?.limit)
  if (limitOverride === 4 || limitOverride === 8 || limitOverride === 12) {
    normalized.limit = limitOverride
  }

  if (!normalized.enabled) {
    return { config: normalized, products: [] }
  }

  if (!isShopifyConfigured()) {
    return {
      config: normalized,
      products: [],
      error: 'Shopify is not configured.',
    }
  }

  let safeHandle = String(handle ?? '').trim()
  if (isProductPagePreviewPlaceholder(safeHandle)) {
    const product = await fetchShopifyProductByHandle(safeHandle)
    safeHandle = product.handle || safeHandle
  }

  const viewedHandles = normalizeViewedHandles(options?.viewedHandles)
  if (!viewedHandles.length) {
    return { config: normalized, products: [] }
  }

  try {
    const page = await fetchShopifyProductsByHandles(viewedHandles)
    if (page.error) {
      return { config: normalized, products: [], error: page.error }
    }

    const exclude = safeHandle.toLowerCase()
    const products = page.products
      .filter((product) => {
        if (!exclude) return true
        return product.handle.toLowerCase() !== exclude
      })
      .slice(0, normalized.limit)
      .map((product) => mapProduct(product, normalized.newBadgeDays))

    return { config: normalized, products, error: page.error }
  } catch (e) {
    console.error('resolveRecentProducts error:', e)
    return {
      config: normalized,
      products: [],
      error: e instanceof Error ? e.message : 'Failed to load recent products.',
    }
  }
}
