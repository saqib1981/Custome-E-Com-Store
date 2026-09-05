import { shopifyProductPath } from '@/lib/collection-tabs'
import { mapShopifyCollectionSortOrder } from '@/lib/shopify-collections'

export const COLLECTION_PRODUCTS_PAGE_SIZE = 24

export type CollectionProductsSort =
  | 'manual'
  | 'best-selling'
  | 'title-asc'
  | 'title-desc'
  | 'price-asc'
  | 'price-desc'
  | 'created-desc'
  | 'created-asc'

export type CollectionProductsColumns = 2 | 3 | 4
export type CollectionProductsPaginationMode = 'pagination' | 'load-more'
/** Image frame aspect — keeps every product card the same size in the grid. */
export type CollectionProductCardAspect = 'square' | 'portrait' | 'landscape'

export type CollectionProductsConfig = {
  enabled: boolean
  columnsDesktop: CollectionProductsColumns
  /** Shared image aspect for all product cards (uniform size). */
  cardImageAspect: CollectionProductCardAspect
  pageSize: number
  paginationMode: CollectionProductsPaginationMode
  defaultSort: CollectionProductsSort
  showSaleBadge: boolean
  showNewBadge: boolean
  /** Products created within this many days show the New badge. */
  newBadgeDays: number
}

export const COLLECTION_PRODUCTS_SETTING_KEY = 'collection-products'
export const COLLECTION_PRODUCTS_NEW_BADGE_DAYS_DEFAULT = 30

export const DEFAULT_COLLECTION_PRODUCTS: CollectionProductsConfig = {
  enabled: true,
  columnsDesktop: 4,
  cardImageAspect: 'square',
  pageSize: COLLECTION_PRODUCTS_PAGE_SIZE,
  paginationMode: 'load-more',
  defaultSort: 'manual',
  showSaleBadge: true,
  showNewBadge: true,
  newBadgeDays: COLLECTION_PRODUCTS_NEW_BADGE_DAYS_DEFAULT,
}

export type CollectionProductCard = {
  id: string
  title: string
  href: string
  imageUrl: string
  imageAlt: string
  price: string
  compareAtPrice: string
  onSale: boolean
  isNew: boolean
  /** ISO createdAt from Shopify — used to recompute New badge when days change. */
  createdAt: string
  /** True when product has Shopify tag `new`. */
  hasNewTag: boolean
  available: boolean
}

export type CollectionProductsPage = {
  handle: string
  title: string
  productCount: number
  products: CollectionProductCard[]
  pageInfo: {
    hasNextPage: boolean
    endCursor: string | null
  }
  /** Active sort applied to this page (matches Sort by dropdown). */
  sort: CollectionProductsSort
  /** Sort configured on the Shopify collection (merchant setting). */
  collectionSort: CollectionProductsSort
  error?: string
}

export const COLLECTION_PRODUCTS_SORT_OPTIONS: Array<{
  value: CollectionProductsSort
  label: string
}> = [
  { value: 'manual', label: 'Featured' },
  { value: 'best-selling', label: 'Best selling' },
  { value: 'title-asc', label: 'Alphabetically, A-Z' },
  { value: 'title-desc', label: 'Alphabetically, Z-A' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'created-desc', label: 'Date, new to old' },
  { value: 'created-asc', label: 'Date, old to new' },
]

export function normalizeCollectionProductsSort(value: unknown): CollectionProductsSort {
  const raw = String(value ?? '').trim()
  if (raw === 'shopify' || raw === 'collection-default') {
    return 'manual'
  }
  if (COLLECTION_PRODUCTS_SORT_OPTIONS.some((option) => option.value === raw)) {
    return raw as CollectionProductsSort
  }
  return 'manual'
}

/** Map Shopify Admin `CollectionSortOrder` → storefront Sort by value. */
export { mapShopifyCollectionSortOrder } from '@/lib/shopify-collections'

function normalizePageSize(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return COLLECTION_PRODUCTS_PAGE_SIZE
  return Math.min(48, Math.max(1, Math.round(parsed)))
}

function normalizeNewBadgeDays(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return COLLECTION_PRODUCTS_NEW_BADGE_DAYS_DEFAULT
  return Math.min(365, Math.max(1, Math.round(parsed)))
}

export function isProductCreatedWithinDays(createdAt: string | null | undefined, days: number): boolean {
  if (!createdAt) return false
  const created = Date.parse(createdAt)
  if (!Number.isFinite(created)) return false
  const windowMs = Math.max(1, days) * 24 * 60 * 60 * 1000
  return Date.now() - created <= windowMs
}

export function normalizeCollectionProductsConfig(
  input: Partial<CollectionProductsConfig> | null | undefined
): CollectionProductsConfig {
  const columns = input?.columnsDesktop
  const columnsDesktop: CollectionProductsColumns =
    columns === 2 || columns === 3 || columns === 4
      ? columns
      : DEFAULT_COLLECTION_PRODUCTS.columnsDesktop

  const aspect = input?.cardImageAspect
  const cardImageAspect: CollectionProductCardAspect =
    aspect === 'portrait' || aspect === 'landscape' || aspect === 'square'
      ? aspect
      : DEFAULT_COLLECTION_PRODUCTS.cardImageAspect

  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_COLLECTION_PRODUCTS.enabled),
    columnsDesktop,
    cardImageAspect,
    pageSize: normalizePageSize(input?.pageSize),
    paginationMode: input?.paginationMode === 'pagination' ? 'pagination' : 'load-more',
    defaultSort: normalizeCollectionProductsSort(
      input?.defaultSort ?? DEFAULT_COLLECTION_PRODUCTS.defaultSort
    ),
    showSaleBadge: Boolean(input?.showSaleBadge ?? DEFAULT_COLLECTION_PRODUCTS.showSaleBadge),
    showNewBadge: Boolean(input?.showNewBadge ?? DEFAULT_COLLECTION_PRODUCTS.showNewBadge),
    newBadgeDays: normalizeNewBadgeDays(
      input?.newBadgeDays ?? DEFAULT_COLLECTION_PRODUCTS.newBadgeDays
    ),
  }
}

export function collectionProductsConfigsEqual(
  a: CollectionProductsConfig,
  b: CollectionProductsConfig
): boolean {
  return (
    a.enabled === b.enabled &&
    a.columnsDesktop === b.columnsDesktop &&
    a.cardImageAspect === b.cardImageAspect &&
    a.pageSize === b.pageSize &&
    a.paginationMode === b.paginationMode &&
    a.defaultSort === b.defaultSort
  )
}

export function collectionProductCardAspectClass(aspect: CollectionProductCardAspect): string {
  switch (aspect) {
    case 'portrait':
      return 'aspect-[3/4]'
    case 'landscape':
      return 'aspect-[4/3]'
    case 'square':
    default:
      return 'aspect-square'
  }
}

export function parseCollectionHandleFromPath(path: string): string | null {
  const normalized = (path.split('?')[0] || '/').replace(/\/+$/, '') || '/'
  const match = normalized.match(/^\/collections\/([^/]+)$/i)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

export function resolveProductIsNew(options: {
  createdAt?: string | null
  hasNewTag?: boolean
  newBadgeDays: number
}): boolean {
  return (
    Boolean(options.hasNewTag) ||
    isProductCreatedWithinDays(options.createdAt, options.newBadgeDays)
  )
}

export function toCollectionProductCard(input: {
  id: string
  title: string
  handle: string
  imageUrl: string
  imageAlt: string
  price: string
  compareAtPrice: string
  onSale: boolean
  isNew: boolean
  createdAt?: string
  hasNewTag?: boolean
  available: boolean
}): CollectionProductCard {
  const createdAt = String(input.createdAt ?? '').trim()
  const hasNewTag = Boolean(input.hasNewTag)
  return {
    id: input.id,
    title: input.title,
    href: shopifyProductPath(input.handle),
    imageUrl: input.imageUrl,
    imageAlt: input.imageAlt || input.title,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    onSale: input.onSale,
    isNew: Boolean(input.isNew),
    createdAt,
    hasNewTag,
    available: input.available,
  }
}
