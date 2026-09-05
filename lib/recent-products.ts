import type { CollectionProductCardAspect } from '@/lib/collection-products'
import type { ProductCardsSectionConfig } from '@/lib/related-products'

export const RECENT_PRODUCTS_SETTING_KEY = 'recent-products'

export type RecentProductsLimit = 4 | 8 | 12
export type RecentProductsColumns = 2 | 3 | 4

export type RecentProductsConfig = ProductCardsSectionConfig

export const RECENT_PRODUCTS_LIMIT_OPTIONS: RecentProductsLimit[] = [4, 8, 12]

export const DEFAULT_RECENT_PRODUCTS: RecentProductsConfig = {
  enabled: true,
  heading: 'Recently viewed',
  limit: 4,
  columnsDesktop: 4,
  cardImageAspect: 'square',
  showSaleBadge: true,
  showNewBadge: true,
  newBadgeDays: 30,
}

function normalizeLimit(value: unknown): RecentProductsLimit {
  const n = Number(value)
  if (n === 8 || n === 12 || n === 4) return n
  return DEFAULT_RECENT_PRODUCTS.limit
}

function normalizeColumns(value: unknown): RecentProductsColumns {
  if (value === 2 || value === 3 || value === 4) return value
  return DEFAULT_RECENT_PRODUCTS.columnsDesktop
}

function normalizeNewBadgeDays(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_RECENT_PRODUCTS.newBadgeDays
  return Math.min(365, Math.max(1, Math.round(parsed)))
}

export function normalizeRecentProductsConfig(
  input: Partial<RecentProductsConfig> | null | undefined
): RecentProductsConfig {
  const aspect = input?.cardImageAspect
  const cardImageAspect: CollectionProductCardAspect =
    aspect === 'portrait' || aspect === 'landscape' || aspect === 'square'
      ? aspect
      : DEFAULT_RECENT_PRODUCTS.cardImageAspect

  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_RECENT_PRODUCTS.enabled),
    heading:
      String(input?.heading ?? DEFAULT_RECENT_PRODUCTS.heading).trim() ||
      DEFAULT_RECENT_PRODUCTS.heading,
    limit: normalizeLimit(input?.limit),
    columnsDesktop: normalizeColumns(input?.columnsDesktop),
    cardImageAspect,
    showSaleBadge: Boolean(input?.showSaleBadge ?? DEFAULT_RECENT_PRODUCTS.showSaleBadge),
    showNewBadge: Boolean(input?.showNewBadge ?? DEFAULT_RECENT_PRODUCTS.showNewBadge),
    newBadgeDays: normalizeNewBadgeDays(
      input?.newBadgeDays ?? DEFAULT_RECENT_PRODUCTS.newBadgeDays
    ),
  }
}

export function recentProductsConfigsEqual(
  a: RecentProductsConfig,
  b: RecentProductsConfig
): boolean {
  return (
    a.enabled === b.enabled &&
    a.heading === b.heading &&
    a.limit === b.limit &&
    a.columnsDesktop === b.columnsDesktop &&
    a.cardImageAspect === b.cardImageAspect
  )
}
