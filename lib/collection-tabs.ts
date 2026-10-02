export const COLLECTION_TABS_MAX = 8

export type CollectionTabSlot = {
  id: string
  collectionId: string
  collectionHandle: string
}

export type CollectionTabsConfig = {
  enabled: boolean
  /** How many products to show per active tab. */
  productsPerTab: number
  tabs: CollectionTabSlot[]
}

export type ResolvedCollectionTabProduct = {
  id: string
  title: string
  href: string
  imageUrl: string
  imageAlt: string
  price: string
  /** Compare-at (struck-through) when on sale; empty otherwise. */
  compareAtPrice: string
  onSale: boolean
  /** Custom left badge from `custom.bunndle_offer_tags`. */
  customBadge: string
}

export type ResolvedCollectionTab = {
  id: string
  title: string
  href: string
  products: ResolvedCollectionTabProduct[]
}

export const COLLECTION_TABS_SETTING_KEY = 'collection-tabs'

export const DEFAULT_COLLECTION_TABS: CollectionTabsConfig = {
  enabled: true,
  productsPerTab: 8,
  tabs: [],
}

const PRODUCTS_PER_TAB_OPTIONS = [4, 8, 12, 24] as const

function createTabId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createCollectionTabSlot(patch: Partial<CollectionTabSlot> = {}): CollectionTabSlot {
  return {
    id: String(patch.id ?? createTabId()),
    collectionId: String(patch.collectionId ?? '').trim(),
    collectionHandle: String(patch.collectionHandle ?? '').trim(),
  }
}

export function normalizeProductsPerTab(value: unknown, fallback = DEFAULT_COLLECTION_TABS.productsPerTab): number {
  const num = typeof value === 'number' ? value : Number(value)
  if (PRODUCTS_PER_TAB_OPTIONS.includes(num as (typeof PRODUCTS_PER_TAB_OPTIONS)[number])) {
    return num
  }
  return fallback
}

export function normalizeCollectionTabsConfig(
  input: Partial<CollectionTabsConfig> | null | undefined
): CollectionTabsConfig {
  const raw = Array.isArray(input?.tabs) ? input.tabs : []
  const tabs = raw
    .slice(0, COLLECTION_TABS_MAX)
    .map((slot) =>
      createCollectionTabSlot({
        id: (slot as Partial<CollectionTabSlot>)?.id,
        collectionId: (slot as Partial<CollectionTabSlot>)?.collectionId,
        collectionHandle: (slot as Partial<CollectionTabSlot>)?.collectionHandle,
      })
    )

  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_COLLECTION_TABS.enabled),
    productsPerTab: normalizeProductsPerTab(input?.productsPerTab),
    tabs,
  }
}

export function collectionTabsConfigsEqual(a: CollectionTabsConfig, b: CollectionTabsConfig): boolean {
  if (
    a.enabled !== b.enabled ||
    a.productsPerTab !== b.productsPerTab ||
    a.tabs.length !== b.tabs.length
  ) {
    return false
  }
  return a.tabs.every(
    (tab, index) =>
      tab.id === b.tabs[index]?.id &&
      tab.collectionId === b.tabs[index]?.collectionId &&
      tab.collectionHandle === b.tabs[index]?.collectionHandle
  )
}

export function shopifyProductPath(handle: string): string {
  const safe = String(handle ?? '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/^products\/?/, '')
  return safe ? `/products/${safe}` : '/products'
}
