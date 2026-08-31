import { Home, type LucideIcon } from 'lucide-react'

export interface MenuSubItem {
  name: string
  path: string
  subItems?: MenuSubItem[]
}

export interface MenuItem {
  name: string
  path: string
  icon: LucideIcon
  subItems?: MenuSubItem[]
}

/** Fallback local menu — live navigation comes from Shopify main menu. */
export const MENU_ITEMS: MenuItem[] = [
  {
    name: 'Home',
    path: '/',
    icon: Home,
  },
]

/** Root path `/` must match exactly. */
export function isSubPathActive(pathname: string, sub: MenuSubItem): boolean {
  if (sub.subItems?.some((nested) => isSubPathActive(pathname, nested))) return true
  if (sub.path === '/') return pathname === '/'
  return pathname === sub.path || pathname.startsWith(sub.path + '/')
}
