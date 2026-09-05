import {
  DEFAULT_RECENT_PRODUCTS,
  normalizeRecentProductsConfig,
  type RecentProductsConfig,
} from '@/lib/recent-products'
import { settingsFetchUrl } from '@/lib/store-settings-cache'

const CACHE_KEY = 'store-recent-products-v1'

export const RECENT_PRODUCTS_CACHE_KEY = CACHE_KEY
export const RECENT_PRODUCTS_UPDATED_EVENT = 'store-recent-products-updated'

let fetchInflight: Promise<RecentProductsConfig> | null = null
let settingsEpoch = 0

export function readCachedRecentProducts(): RecentProductsConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return normalizeRecentProductsConfig(JSON.parse(raw) as Partial<RecentProductsConfig>)
  } catch {
    return null
  }
}

export function cacheRecentProducts(config: RecentProductsConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(normalizeRecentProductsConfig(config)))
  } catch {
    // ignore
  }
}

export function clearCachedRecentProducts(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}

export function notifyRecentProductsUpdated(config: RecentProductsConfig): void {
  if (typeof window === 'undefined') return
  const normalized = normalizeRecentProductsConfig(config)
  cacheRecentProducts(normalized)
  window.dispatchEvent(
    new CustomEvent<RecentProductsConfig>(RECENT_PRODUCTS_UPDATED_EVENT, {
      detail: normalized,
    })
  )
}

function invalidateInflightFetch(): void {
  settingsEpoch += 1
  fetchInflight = null
}

export async function fetchRecentProductsSettings(
  signal?: AbortSignal
): Promise<RecentProductsConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const epochAtStart = settingsEpoch

  const req = (async () => {
    const res = await fetch(settingsFetchUrl('/api/admin/recent-products-settings'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal,
    })
    const data = (res.ok ? await res.json() : DEFAULT_RECENT_PRODUCTS) as RecentProductsConfig
    const normalized = normalizeRecentProductsConfig(data)

    if (epochAtStart !== settingsEpoch) {
      return readCachedRecentProducts() ?? normalized
    }

    cacheRecentProducts(normalized)
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

export async function persistRecentProductsSettings(
  config: RecentProductsConfig
): Promise<RecentProductsConfig> {
  const normalized = normalizeRecentProductsConfig(config)
  const res = await fetch('/api/admin/recent-products-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(normalized),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to save recent products settings')
  const saved = normalizeRecentProductsConfig(
    (await res.json()) as Partial<RecentProductsConfig>
  )
  invalidateInflightFetch()
  clearCachedRecentProducts()
  notifyRecentProductsUpdated(saved)
  return saved
}
