import {
  DEFAULT_RELATED_PRODUCTS,
  normalizeRelatedProductsConfig,
  type RelatedProductsConfig,
} from '@/lib/related-products'
import { settingsFetchUrl } from '@/lib/store-settings-cache'

const CACHE_KEY = 'store-related-products-v1'

export const RELATED_PRODUCTS_CACHE_KEY = CACHE_KEY
export const RELATED_PRODUCTS_UPDATED_EVENT = 'store-related-products-updated'

let fetchInflight: Promise<RelatedProductsConfig> | null = null
let settingsEpoch = 0

export function readCachedRelatedProducts(): RelatedProductsConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return normalizeRelatedProductsConfig(JSON.parse(raw) as Partial<RelatedProductsConfig>)
  } catch {
    return null
  }
}

export function cacheRelatedProducts(config: RelatedProductsConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(normalizeRelatedProductsConfig(config)))
  } catch {
    // ignore
  }
}

export function clearCachedRelatedProducts(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}

export function notifyRelatedProductsUpdated(config: RelatedProductsConfig): void {
  if (typeof window === 'undefined') return
  const normalized = normalizeRelatedProductsConfig(config)
  cacheRelatedProducts(normalized)
  window.dispatchEvent(
    new CustomEvent<RelatedProductsConfig>(RELATED_PRODUCTS_UPDATED_EVENT, {
      detail: normalized,
    })
  )
}

function invalidateInflightFetch(): void {
  settingsEpoch += 1
  fetchInflight = null
}

export async function fetchRelatedProductsSettings(
  signal?: AbortSignal
): Promise<RelatedProductsConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const epochAtStart = settingsEpoch

  const req = (async () => {
    const res = await fetch(settingsFetchUrl('/api/admin/related-products-settings'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal,
    })
    const data = (res.ok ? await res.json() : DEFAULT_RELATED_PRODUCTS) as RelatedProductsConfig
    const normalized = normalizeRelatedProductsConfig(data)

    if (epochAtStart !== settingsEpoch) {
      return readCachedRelatedProducts() ?? normalized
    }

    cacheRelatedProducts(normalized)
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

export async function persistRelatedProductsSettings(
  config: RelatedProductsConfig
): Promise<RelatedProductsConfig> {
  const normalized = normalizeRelatedProductsConfig(config)
  const res = await fetch('/api/admin/related-products-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(normalized),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to save related products settings')
  const saved = normalizeRelatedProductsConfig(
    (await res.json()) as Partial<RelatedProductsConfig>
  )
  invalidateInflightFetch()
  clearCachedRelatedProducts()
  notifyRelatedProductsUpdated(saved)
  return saved
}
