export type AdminThemePageId =
  | 'home'
  | 'collections-list'
  | 'collection'
  | 'product'
  | 'cart'
  | 'checkout'
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
  { id: 'collections-list', name: 'Collection list', path: '/collections' },
  { id: 'collection', name: 'Collection', path: '/collections/all' },
  { id: 'product', name: 'Product', path: '/products/example' },
  { id: 'cart', name: 'Cart', path: '/cart' },
  { id: 'checkout', name: 'Checkout', path: '/checkout' },
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

  if (normalized === '/collections') {
    return ADMIN_THEME_PAGES.find((page) => page.id === 'collections-list')
  }

  if (normalized.startsWith('/collections/')) {
    return ADMIN_THEME_PAGES.find((page) => page.id === 'collection')
  }
  if (normalized.startsWith('/products')) {
    return ADMIN_THEME_PAGES.find((page) => page.id === 'product')
  }
  if (normalized === '/checkout') {
    return ADMIN_THEME_PAGES.find((page) => page.id === 'checkout')
  }
  if (normalized === '/account') {
    return ADMIN_THEME_PAGES.find((page) => page.id === 'account')
  }

  return undefined
}

export function resolveThemePageLabel(path: string): string {
  const page = getThemePageByPath(path)
  if (page) return page.name
  if (path === '/') return 'Home page'
  return path
}
