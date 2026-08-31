import type { StoreNavItem } from '@/lib/shopify-menu'

const CACHE_KEY = 'store-main-menu-v2'

export const STORE_MENU_REFRESH_EVENT = 'store-menu-refresh'

type MenuCachePayload = {
  menuKey: string
  items: StoreNavItem[]
}

export function buildMenuCacheKey(menuId: string, menuHandle: string): string {
  const id = menuId.trim()
  const handle = menuHandle.trim()
  if (id) return `id:${id}`
  if (handle) return `handle:${handle}`
  return 'default'
}

export function clearCachedMainMenu(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}

export function readCachedMainMenu(menuKey?: string): StoreNavItem[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MenuCachePayload
    if (!parsed || !Array.isArray(parsed.items) || !parsed.items.length) return null
    if (menuKey && parsed.menuKey !== menuKey) return null
    return parsed.items
  } catch {
    return null
  }
}

export function writeCachedMainMenu(
  items: StoreNavItem[],
  menuKey: string = 'default'
): void {
  if (typeof window === 'undefined') return
  try {
    const payload: MenuCachePayload = { menuKey, items }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

export function mainMenusEqual(a: StoreNavItem[], b: StoreNavItem[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Matches /api/store/menu revalidate window. */
export const MENU_BACKGROUND_REFRESH_MS = 5 * 60 * 1000
