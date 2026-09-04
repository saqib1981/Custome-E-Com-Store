import {
  DEFAULT_PRODUCT_PAGE,
  normalizeProductPageConfig,
  type ProductPageConfig,
} from '@/lib/product-page'
import { settingsFetchUrl } from '@/lib/store-settings-cache'

const CACHE_KEY = 'store-product-page-v2'

export const PRODUCT_PAGE_CACHE_KEY = CACHE_KEY

export const PRODUCT_PAGE_UPDATED_EVENT = 'store-product-page-updated'

let fetchInflight: Promise<ProductPageConfig> | null = null
let settingsEpoch = 0

export function readCachedProductPage(): ProductPageConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return normalizeProductPageConfig(JSON.parse(raw) as Partial<ProductPageConfig>)
  } catch {
    return null
  }
}

export function cacheProductPage(config: ProductPageConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(normalizeProductPageConfig(config)))
  } catch {
    // ignore
  }
}

export function clearCachedProductPage(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CACHE_KEY)
    window.localStorage.removeItem('store-product-page-v1')
  } catch {
    // ignore
  }
}

export function notifyProductPageUpdated(config: ProductPageConfig): void {
  if (typeof window === 'undefined') return
  const normalized = normalizeProductPageConfig(config)
  cacheProductPage(normalized)
  window.dispatchEvent(
    new CustomEvent<ProductPageConfig>(PRODUCT_PAGE_UPDATED_EVENT, { detail: normalized })
  )
}

function invalidateInflightFetch(): void {
  settingsEpoch += 1
  fetchInflight = null
}

export async function fetchProductPageSettings(signal?: AbortSignal): Promise<ProductPageConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const epochAtStart = settingsEpoch

  const req = (async () => {
    const res = await fetch(settingsFetchUrl('/api/admin/product-page-settings'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal,
    })
    const data = (res.ok ? await res.json() : DEFAULT_PRODUCT_PAGE) as ProductPageConfig
    const normalized = normalizeProductPageConfig(data)

    if (epochAtStart !== settingsEpoch) {
      return readCachedProductPage() ?? normalized
    }

    cacheProductPage(normalized)
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

export async function persistProductPageSettings(
  config: ProductPageConfig
): Promise<ProductPageConfig> {
  const normalized = normalizeProductPageConfig(config)
  const res = await fetch('/api/admin/product-page-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(normalized),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to save product page settings')
  const saved = normalizeProductPageConfig((await res.json()) as Partial<ProductPageConfig>)
  invalidateInflightFetch()
  clearCachedProductPage()
  notifyProductPageUpdated(saved)
  return saved
}
