/** Client events / helpers for refreshing store theme settings after admin saves. */

export const STORE_THEME_REFRESH_EVENT = 'store-theme-refresh'

export type StoreThemeRefreshDetail = {
  /** When set, only that slice needs refresh. Omit to refresh all theme slices. */
  keys?: Array<'logo-favicon' | 'general' | 'header-nav'>
}

export function dispatchStoreThemeRefresh(detail: StoreThemeRefreshDetail = {}): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(STORE_THEME_REFRESH_EVENT, { detail }))
}
