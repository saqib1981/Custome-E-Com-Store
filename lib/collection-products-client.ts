import {
  DEFAULT_COLLECTION_PRODUCTS,
  normalizeCollectionProductsConfig,
  type CollectionProductsConfig,
} from '@/lib/collection-products'
import { settingsFetchUrl } from '@/lib/store-settings-cache'

/** Bumped so old browsers drop stale v1 localStorage. */
const CACHE_KEY = 'store-collection-products-v2'

export const COLLECTION_PRODUCTS_CACHE_KEY = CACHE_KEY

export const COLLECTION_PRODUCTS_UPDATED_EVENT = 'store-collection-products-updated'

let fetchInflight: Promise<CollectionProductsConfig> | null = null
let settingsEpoch = 0

export function readCachedCollectionProducts(): CollectionProductsConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return normalizeCollectionProductsConfig(JSON.parse(raw) as Partial<CollectionProductsConfig>)
  } catch {
    return null
  }
}

export function cacheCollectionProducts(config: CollectionProductsConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(normalizeCollectionProductsConfig(config))
    )
  } catch {
    // ignore
  }
}

export function clearCachedCollectionProducts(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CACHE_KEY)
    window.localStorage.removeItem('store-collection-products-v1')
  } catch {
    // ignore
  }
}

export function notifyCollectionProductsUpdated(config: CollectionProductsConfig): void {
  if (typeof window === 'undefined') return
  const normalized = normalizeCollectionProductsConfig(config)
  cacheCollectionProducts(normalized)
  window.dispatchEvent(
    new CustomEvent<CollectionProductsConfig>(COLLECTION_PRODUCTS_UPDATED_EVENT, {
      detail: normalized,
    })
  )
}

function invalidateInflightFetch(): void {
  settingsEpoch += 1
  fetchInflight = null
}

export async function fetchCollectionProductsSettings(
  signal?: AbortSignal
): Promise<CollectionProductsConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const epochAtStart = settingsEpoch

  const req = (async () => {
    const res = await fetch(settingsFetchUrl('/api/admin/collection-products-settings'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal,
    })
    const data = (res.ok ? await res.json() : DEFAULT_COLLECTION_PRODUCTS) as CollectionProductsConfig
    const normalized = normalizeCollectionProductsConfig(data)

    // Save won while this GET was in flight — keep the saved cache, don't invent defaults.
    if (epochAtStart !== settingsEpoch) {
      return readCachedCollectionProducts() ?? normalized
    }

    cacheCollectionProducts(normalized)
    return normalized
  })()

  if (!signal) {
    fetchInflight = req
    req.finally(() => {
      if (fetchInflight === req) fetchInflight = null
    })
  }

  return req
}

export async function persistCollectionProductsSettings(
  config: CollectionProductsConfig
): Promise<CollectionProductsConfig> {
  const normalized = normalizeCollectionProductsConfig(config)
  const res = await fetch('/api/admin/collection-products-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(normalized),
    cache: 'no-store',
  })
  const body = (await res.json().catch(() => null)) as
    | (Partial<CollectionProductsConfig> & { error?: string })
    | null
  if (!res.ok) {
    throw new Error(body?.error || 'Failed to save collection products settings')
  }
  const saved = normalizeCollectionProductsConfig(body as Partial<CollectionProductsConfig>)
  invalidateInflightFetch()
  clearCachedCollectionProducts()
  notifyCollectionProductsUpdated(saved)
  return saved
}
