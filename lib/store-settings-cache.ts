/** Browser caches for theme settings — can show stale admin values after save. */

export const STORE_SETTINGS_CACHE_KEYS = [
  'store-collection-products-v1',
  'store-collection-products-v2',
  'store-product-page-v1',
  'store-product-page-v2',
  'store-related-products-v1',
  'store-recent-products-v1',
  'store-floating-buttons-v1',
  'store-floating-buttons-v2',
  'store-badges-v1',
  'store-search-v1',
  'store-cart-settings-v1',
  'store-account-settings-v1',
  'store-checkout-settings-v1',
] as const

/** Shared no-store headers for admin/store settings API responses. */
export const SETTINGS_NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

/** Drop all known settings caches (call once on admin boot + after every successful save). */
export function clearStoreSettingsBrowserCaches(): void {
  if (typeof window === 'undefined') return
  try {
    for (const key of STORE_SETTINGS_CACHE_KEYS) {
      window.localStorage.removeItem(key)
    }
  } catch {
    // private mode / quota
  }
}

/** Overwrite a settings cache key with fresh JSON (preferred over leaving stale after mutation). */
export function writeStoreSettingsBrowserCache(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // private mode / quota
  }
}

/** Cache-busting query for settings GETs (avoids stale browser/HTTP cache). */
export function settingsFetchUrl(path: string): string {
  const join = path.includes('?') ? '&' : '?'
  return `${path}${join}_ts=${Date.now()}`
}

/**
 * When a settings fetch was invalidated mid-flight, prefer fresh cache from the
 * newer write — never prefer the stale in-flight response over a post-save cache.
 */
export function resolveInvalidatedSettingsFetch<T>(
  readCached: () => T | null,
  staleNormalized: T
): T {
  const cached = readCached()
  return cached ?? staleNormalized
}
