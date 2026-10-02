export type ShopifyCollectionSummary = {
  id: string
  title: string
  handle: string
  imageUrl?: string
  imageAlt?: string
  productCount?: number
  /** Shopify Admin `Collection.sortOrder` (e.g. BEST_SELLING, MANUAL). */
  sortOrder?: string
  /**
   * Collection metafield `custom.bunndle_offer_tags` — shown as product-card badge
   * when the product itself has no value.
   */
  bundleOfferTag?: string
}

export function shopifyCollectionPath(handle: string): string {
  const safe = String(handle ?? '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/^collections\/?/, '')
  return safe ? `/collections/${safe}` : '/collections/all'
}

export function parseCollectionHandleFromLink(linkUrl: string): string | null {
  const raw = String(linkUrl ?? '').trim()
  const match = raw.match(/^\/collections\/([^/?#]+)\/?$/i)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Map Shopify Admin `Collection.sortOrder` (CollectionSortOrder enum)
 * to storefront Sort by values.
 */
export function mapShopifyCollectionSortOrder(sortOrder: unknown):
  | 'manual'
  | 'best-selling'
  | 'title-asc'
  | 'title-desc'
  | 'price-asc'
  | 'price-desc'
  | 'created-desc'
  | 'created-asc' {
  switch (String(sortOrder ?? '').trim().toUpperCase()) {
    case 'ALPHA_ASC':
      return 'title-asc'
    case 'ALPHA_DESC':
      return 'title-desc'
    case 'BEST_SELLING':
      return 'best-selling'
    case 'CREATED':
      return 'created-asc'
    case 'CREATED_DESC':
      return 'created-desc'
    case 'PRICE_ASC':
      return 'price-asc'
    case 'PRICE_DESC':
      return 'price-desc'
    case 'MANUAL':
    default:
      return 'manual'
  }
}
