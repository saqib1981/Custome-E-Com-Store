import { getShopifyConfig } from '@/lib/shopify-config'

/** Navigation link normalized from Shopify Online Store menu. */
export type StoreNavItem = {
  id: string
  title: string
  /** Original Shopify URL. */
  url: string
  /** In-app path (e.g. `/collections/women`) or external URL. */
  href: string
  external: boolean
  items: StoreNavItem[]
}

export const DEFAULT_MAIN_MENU_HANDLE = 'main-menu'

export function getMainMenuHandle(): string {
  return (
    process.env.SHOPIFY_MAIN_MENU_HANDLE?.trim() ||
    process.env.Shopify_Main_Menu_Handle?.trim() ||
    DEFAULT_MAIN_MENU_HANDLE
  )
}

/** Map Shopify menu URLs to paths on this storefront. */
export function normalizeShopifyMenuHref(url: string, shopDomain: string): { href: string; external: boolean } {
  const raw = String(url ?? '').trim()
  if (!raw) return { href: '/', external: false }

  if (raw.startsWith('/')) {
    return { href: raw.split('?')[0] || '/', external: false }
  }

  try {
    const parsed = new URL(raw)
    const shopHost = shopDomain.replace(/^https?:\/\//, '').toLowerCase()
    const host = parsed.hostname.toLowerCase()

    const isShopHost =
      host === shopHost ||
      host.endsWith('.myshopify.com') ||
      host === shopHost.replace('.myshopify.com', '')

    if (isShopHost) {
      return { href: parsed.pathname || '/', external: false }
    }

    return { href: raw, external: true }
  } catch {
    const path = raw.startsWith('/') ? raw : `/${raw}`
    return { href: path.split('?')[0] || '/', external: false }
  }
}

export function isStoreNavActive(pathname: string, item: StoreNavItem): boolean {
  if (item.items.some((child) => isStoreNavActive(pathname, child))) return true
  if (item.external) return false
  if (item.href === '/') return pathname === '/'
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export const FALLBACK_MAIN_MENU: StoreNavItem[] = [
  {
    id: 'fallback-home',
    title: 'Home',
    url: '/',
    href: '/',
    external: false,
    items: [],
  },
]

type ShopifyMenuItemNode = {
  id: string
  title: string
  url: string | null
  items: ShopifyMenuItemNode[]
}

export function mapShopifyMenuItems(
  items: ShopifyMenuItemNode[],
  shopDomain: string
): StoreNavItem[] {
  return items.map((item) => {
    const { href, external } = normalizeShopifyMenuHref(item.url ?? '', shopDomain)
    return {
      id: item.id,
      title: item.title,
      url: item.url ?? href,
      href,
      external,
      items: mapShopifyMenuItems(item.items ?? [], shopDomain),
    }
  })
}
