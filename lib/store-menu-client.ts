import type { StoreNavItem } from '@/lib/shopify-menu'

const CACHE_KEY = 'store-main-menu-v1'

export function readCachedMainMenu(): StoreNavItem[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoreNavItem[]
    if (!Array.isArray(parsed) || !parsed.length) return null
    return parsed
  } catch {
    return null
  }
}

export function writeCachedMainMenu(items: StoreNavItem[]): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota / private mode
  }
}

export function mainMenusEqual(a: StoreNavItem[], b: StoreNavItem[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Matches /api/store/menu revalidate window. */
export const MENU_BACKGROUND_REFRESH_MS = 5 * 60 * 1000
