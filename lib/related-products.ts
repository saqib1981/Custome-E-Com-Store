import type { CollectionProductCardAspect } from '@/lib/collection-products'

/** Shared shape for related / recent product card grids on the PDP. */
export type ProductCardsSectionConfig = {
  enabled: boolean
  heading: string
  limit: 4 | 8 | 12
  columnsDesktop: 2 | 3 | 4
  cardImageAspect: CollectionProductCardAspect
  showSaleBadge: boolean
  showNewBadge: boolean
  newBadgeDays: number
}

export const RELATED_PRODUCTS_SETTING_KEY = 'related-products'

export type RelatedProductsLimit = 4 | 8 | 12
export type RelatedProductsColumns = 2 | 3 | 4

export type RelatedProductsConfig = {
  enabled: boolean
  heading: string
  /** How many related product cards to show. */
  limit: RelatedProductsLimit
  columnsDesktop: RelatedProductsColumns
  cardImageAspect: CollectionProductCardAspect
  showSaleBadge: boolean
  showNewBadge: boolean
  newBadgeDays: number
}

export const RELATED_PRODUCTS_LIMIT_OPTIONS: RelatedProductsLimit[] = [4, 8, 12]

export const DEFAULT_RELATED_PRODUCTS: RelatedProductsConfig = {
  enabled: true,
  heading: 'Related products',
  limit: 4,
  columnsDesktop: 4,
  cardImageAspect: 'square',
  showSaleBadge: true,
  showNewBadge: true,
  newBadgeDays: 30,
}

function normalizeLimit(value: unknown): RelatedProductsLimit {
  const n = Number(value)
  if (n === 8 || n === 12 || n === 4) return n
  return DEFAULT_RELATED_PRODUCTS.limit
}

function normalizeColumns(value: unknown): RelatedProductsColumns {
  if (value === 2 || value === 3 || value === 4) return value
  return DEFAULT_RELATED_PRODUCTS.columnsDesktop
}

function normalizeNewBadgeDays(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_RELATED_PRODUCTS.newBadgeDays
  return Math.min(365, Math.max(1, Math.round(parsed)))
}

export function normalizeRelatedProductsConfig(
  input: Partial<RelatedProductsConfig> | null | undefined
): RelatedProductsConfig {
  const aspect = input?.cardImageAspect
  const cardImageAspect: CollectionProductCardAspect =
    aspect === 'portrait' || aspect === 'landscape' || aspect === 'square'
      ? aspect
      : DEFAULT_RELATED_PRODUCTS.cardImageAspect

  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_RELATED_PRODUCTS.enabled),
    heading:
      String(input?.heading ?? DEFAULT_RELATED_PRODUCTS.heading).trim() ||
      DEFAULT_RELATED_PRODUCTS.heading,
    limit: normalizeLimit(input?.limit),
    columnsDesktop: normalizeColumns(input?.columnsDesktop),
    cardImageAspect,
    showSaleBadge: Boolean(input?.showSaleBadge ?? DEFAULT_RELATED_PRODUCTS.showSaleBadge),
    showNewBadge: Boolean(input?.showNewBadge ?? DEFAULT_RELATED_PRODUCTS.showNewBadge),
    newBadgeDays: normalizeNewBadgeDays(
      input?.newBadgeDays ?? DEFAULT_RELATED_PRODUCTS.newBadgeDays
    ),
  }
}

export function relatedProductsConfigsEqual(
  a: RelatedProductsConfig,
  b: RelatedProductsConfig
): boolean {
  return (
    a.enabled === b.enabled &&
    a.heading === b.heading &&
    a.limit === b.limit &&
    a.columnsDesktop === b.columnsDesktop &&
    a.cardImageAspect === b.cardImageAspect
  )
}
