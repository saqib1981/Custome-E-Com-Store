export type AdminThemePageId =
  | 'home'
  | 'collection'
  | 'product'
  | 'cart'
  | 'search'
  | 'account'

export type AdminThemePage = {
  id: AdminThemePageId
  name: string
  path: string
}

/** Theme editor pages — extend as new templates are added. */
export const ADMIN_THEME_PAGES: AdminThemePage[] = [
  { id: 'home', name: 'Home page', path: '/' },
  { id: 'collection', name: 'Collection', path: '/collections/all' },
  { id: 'product', name: 'Product', path: '/products/example' },
  { id: 'cart', name: 'Cart', path: '/cart' },
  { id: 'search', name: 'Search', path: '/search' },
  { id: 'account', name: 'Account', path: '/account' },
]

export const DEFAULT_ADMIN_THEME_PAGE_ID: AdminThemePageId = 'home'

export function getThemePageById(id: AdminThemePageId): AdminThemePage {
  return ADMIN_THEME_PAGES.find((page) => page.id === id) ?? ADMIN_THEME_PAGES[0]
}

export function getThemePageByPath(path: string): AdminThemePage | undefined {
  const normalized = (path.split('?')[0] || '/').replace(/\/+$/, '') || '/'

  const exact = ADMIN_THEME_PAGES.find((page) => page.path === normalized)
  if (exact) return exact

  if (normalized.startsWith('/collections')) {
    return ADMIN_THEME_PAGES.find((page) => page.id === 'collection')
  }
  if (normalized.startsWith('/products')) {
    return ADMIN_THEME_PAGES.find((page) => page.id === 'product')
  }

  return undefined
}

export function resolveThemePageLabel(path: string): string {
  const page = getThemePageByPath(path)
  if (page) return page.name
  if (path === '/') return 'Home page'
  return path
}
