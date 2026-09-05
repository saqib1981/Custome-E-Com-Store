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
  'store-checkout-settings-v1',
] as const

/** Drop all known settings caches (call once on admin boot). */
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

/** Cache-busting query for settings GETs (avoids stale browser/HTTP cache). */
export function settingsFetchUrl(path: string): string {
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}_ts=${Date.now()}`
}
