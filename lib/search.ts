import type { CollectionProductCard } from '@/lib/collection-products'
import { shopifyProductPath } from '@/lib/collection-tabs'

export const SEARCH_SETTING_KEY = 'search'

export type SearchConfig = {
  enabled: boolean
  placeholder: string
  showProductImages: boolean
  showPrices: boolean
  maxResults: number
  minQueryLength: number
  noResultsText: string
  emptyHintText: string
}

export const DEFAULT_SEARCH: SearchConfig = {
  enabled: true,
  placeholder: 'Search products…',
  showProductImages: true,
  showPrices: true,
  maxResults: 8,
  minQueryLength: 2,
  noResultsText: 'No products found',
  emptyHintText: 'Start typing to search the store',
}

export type SearchProductHit = {
  id: string
  title: string
  handle: string
  imageUrl: string
  imageAlt: string
  price: string
  compareAtPrice: string
  available?: boolean
}

export function searchHitToProductCard(
  hit: SearchProductHit,
  options?: { showImages?: boolean; showPrices?: boolean }
): CollectionProductCard {
  const showImages = options?.showImages !== false
  const showPrices = options?.showPrices !== false
  return {
    id: hit.id,
    title: hit.title,
    href: shopifyProductPath(hit.handle),
    imageUrl: showImages ? hit.imageUrl : '',
    imageAlt: hit.imageAlt || hit.title,
    price: showPrices ? hit.price : '',
    compareAtPrice: showPrices ? hit.compareAtPrice : '',
    onSale: showPrices && Boolean(hit.compareAtPrice),
    isNew: false,
    createdAt: '',
    hasNewTag: false,
    available: hit.available !== false,
  }
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

export function normalizeSearchConfig(
  input: Partial<SearchConfig> | null | undefined
): SearchConfig {
  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_SEARCH.enabled),
    placeholder:
      String(input?.placeholder ?? DEFAULT_SEARCH.placeholder).trim() ||
      DEFAULT_SEARCH.placeholder,
    showProductImages: Boolean(
      input?.showProductImages ?? DEFAULT_SEARCH.showProductImages
    ),
    showPrices: Boolean(input?.showPrices ?? DEFAULT_SEARCH.showPrices),
    maxResults: clampInt(input?.maxResults, 4, 24, DEFAULT_SEARCH.maxResults),
    minQueryLength: clampInt(
      input?.minQueryLength,
      1,
      5,
      DEFAULT_SEARCH.minQueryLength
    ),
    noResultsText:
      String(input?.noResultsText ?? DEFAULT_SEARCH.noResultsText).trim() ||
      DEFAULT_SEARCH.noResultsText,
    emptyHintText:
      String(input?.emptyHintText ?? DEFAULT_SEARCH.emptyHintText).trim() ||
      DEFAULT_SEARCH.emptyHintText,
  }
}

export function searchConfigsEqual(a: SearchConfig, b: SearchConfig): boolean {
  return (
    a.enabled === b.enabled &&
    a.placeholder === b.placeholder &&
    a.showProductImages === b.showProductImages &&
    a.showPrices === b.showPrices &&
    a.maxResults === b.maxResults &&
    a.minQueryLength === b.minQueryLength &&
    a.noResultsText === b.noResultsText &&
    a.emptyHintText === b.emptyHintText
  )
}

export function parseSearchQueryFromPath(path: string): string {
  try {
    const url = new URL(path, 'http://local.invalid')
    return String(url.searchParams.get('q') ?? '').trim()
  } catch {
    const qIndex = path.indexOf('?')
    if (qIndex < 0) return ''
    const params = new URLSearchParams(path.slice(qIndex + 1))
    return String(params.get('q') ?? '').trim()
  }
}

export function buildSearchPath(query: string): string {
  const q = query.trim()
  return q ? `/search?q=${encodeURIComponent(q)}` : '/search'
}
