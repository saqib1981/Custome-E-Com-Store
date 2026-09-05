import { formatMoney } from '@/lib/format-money'
import {
  isProductCreatedWithinDays,
  toCollectionProductCard,
  type CollectionProductCard,
} from '@/lib/collection-products'
import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import {
  fetchShopifyCollectionProductsPage,
  type ShopifyCollectionProduct,
} from '@/lib/shopify-collections-server'
import { readRelatedProductsConfig } from '@/lib/related-products-settings-server'
import {
  normalizeRelatedProductsConfig,
  type RelatedProductsConfig,
} from '@/lib/related-products'
import { applyBadgesConfig } from '@/lib/badges'
import { readBadgesConfig } from '@/lib/badges-server'
import { isProductPagePreviewPlaceholder } from '@/lib/product-page'
import { fetchShopifyProductByHandle } from '@/lib/shopify-product-server'

export type ResolvedRelatedProducts = {
  config: RelatedProductsConfig
  products: CollectionProductCard[]
  sourceCollectionHandle: string | null
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

async function resolveProductCollectionHandle(
  handle: string
): Promise<{ productId: string; collectionHandle: string | null }> {
  type Res = {
    productByHandle: {
      id: string
      collections?: { nodes?: Array<{ handle?: string | null } | null> | null } | null
    } | null
  }

  const data = await shopifyAdminGraphql<Res>(
    `
      query RelatedProductCollections($handle: String!) {
        productByHandle(handle: $handle) {
          id
          collections(first: 3) {
            nodes {
              handle
            }
          }
        }
      }
    `,
    { handle }
  )

  const product = data.productByHandle
  if (!product?.id) return { productId: '', collectionHandle: null }

  const collectionHandle =
    product.collections?.nodes
      ?.map((node) => String(node?.handle ?? '').trim())
      .find(Boolean) ?? null

  return { productId: product.id, collectionHandle }
}

export async function resolveRelatedProducts(
  handle: string,
  options?: { limit?: number }
): Promise<ResolvedRelatedProducts> {
  const config = await readRelatedProductsConfig()
  const badges = await readBadgesConfig()
  const normalized = applyBadgesConfig(normalizeRelatedProductsConfig(config), badges)
  const limitOverride = Number(options?.limit)
  if (limitOverride === 4 || limitOverride === 8 || limitOverride === 12) {
    normalized.limit = limitOverride
  }

  if (!normalized.enabled) {
    return { config: normalized, products: [], sourceCollectionHandle: null }
  }

  if (!isShopifyConfigured()) {
    return {
      config: normalized,
      products: [],
      sourceCollectionHandle: null,
      error: 'Shopify is not configured.',
    }
  }

  let safeHandle = String(handle ?? '').trim()
  if (isProductPagePreviewPlaceholder(safeHandle)) {
    const product = await fetchShopifyProductByHandle(safeHandle)
    safeHandle = product.handle || safeHandle
  }

  if (!safeHandle) {
    return {
      config: normalized,
      products: [],
      sourceCollectionHandle: null,
      error: 'Missing product handle.',
    }
  }

  try {
    const { productId, collectionHandle } = await resolveProductCollectionHandle(safeHandle)
    const fetchCount = Math.min(50, normalized.limit + 12)

    const page = await fetchShopifyCollectionProductsPage({
      collectionHandle: collectionHandle || 'all',
      first: fetchCount,
      sort: collectionHandle ? 'shopify' : 'created-desc',
    })

    if (page.error) {
      return {
        config: normalized,
        products: [],
        sourceCollectionHandle: collectionHandle,
        error: page.error,
      }
    }

    const products = page.products
      .filter((product) => {
        if (productId && product.id === productId) return false
        if (product.handle.toLowerCase() === safeHandle.toLowerCase()) return false
        return true
      })
      .slice(0, normalized.limit)
      .map((product) => mapProduct(product, normalized.newBadgeDays))

    return {
      config: normalized,
      products,
      sourceCollectionHandle: collectionHandle,
      error: page.error,
    }
  } catch (e) {
    console.error('resolveRelatedProducts error:', e)
    return {
      config: normalized,
      products: [],
      sourceCollectionHandle: null,
      error: e instanceof Error ? e.message : 'Failed to load related products.',
    }
  }
}
