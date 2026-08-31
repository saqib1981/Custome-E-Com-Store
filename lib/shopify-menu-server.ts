import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { getShopifyConfig, isShopifyConfigured } from '@/lib/shopify-config'
import {
  getShopifyConnectionStatus,
  isShopifyAccessDeniedError,
} from '@/lib/shopify-connection-server'
import { normalizeMenuId } from '@/lib/header-settings'
import { readHeaderNavSettingsConfig } from '@/lib/header-settings-server'
import {
  FALLBACK_MAIN_MENU,
  mapShopifyMenuItems,
  resolveMainMenuHandle,
  type StoreNavItem,
} from '@/lib/shopify-menu'

export type ShopifyMenuSummary = {
  id: string
  handle: string
  title: string
}

export type ShopifyMenuSelection = {
  menuId?: string | null
  menuHandle?: string | null
}

export type ShopifyMenusListResult = {
  menus: ShopifyMenuSummary[]
  error: string | null
}

type MenuNode = {
  id: string
  handle: string
  title: string
  items: Array<{
    id: string
    title: string
    url: string | null
    items: Array<{
      id: string
      title: string
      url: string | null
      items: Array<{
        id: string
        title: string
        url: string | null
        items: []
      }>
    }>
  }>
}

type MenusQueryResponse = {
  menus: {
    nodes: MenuNode[]
  }
}

type MenuByIdQueryResponse = {
  menu: MenuNode | null
}

type MenusListQueryResponse = {
  menus: {
    nodes: ShopifyMenuSummary[]
  }
}

const MENU_ITEMS_FRAGMENT = `
  items {
    id
    title
    url
    items {
      id
      title
      url
      items {
        id
        title
        url
      }
    }
  }
`

function mapMenuNodeItems(menu: MenuNode | null | undefined, shopDomain: string): StoreNavItem[] | null {
  if (!menu?.items?.length) return null
  return mapShopifyMenuItems(menu.items, shopDomain)
}

async function ensureNavigationAccess(): Promise<{ ok: true } | { ok: false; message: string | null }> {
  const connection = await getShopifyConnectionStatus()
  if (!connection.connected) {
    return { ok: false, message: connection.message }
  }
  if (connection.missingScopes.some((scope) => scope.handle === 'read_online_store_navigation')) {
    return { ok: false, message: connection.message }
  }
  return { ok: true }
}

export async function fetchShopifyMenusList(): Promise<ShopifyMenusListResult> {
  if (!isShopifyConfigured()) {
    return { menus: [], error: 'Shopify is not configured.' }
  }

  const access = await ensureNavigationAccess()
  if (!access.ok) {
    return { menus: [], error: access.message }
  }

  try {
    const data = await shopifyAdminGraphql<MenusListQueryResponse>(
      `
        query ShopifyMenusList {
          menus(first: 50) {
            nodes {
              id
              handle
              title
            }
          }
        }
      `
    )

    return {
      menus: data.menus.nodes
        .map((menu) => ({
          id: menu.id,
          handle: menu.handle,
          title: menu.title,
        }))
        .sort((a, b) => a.title.localeCompare(b.title)),
      error: null,
    }
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'Failed to load menus'
    console.error('fetchShopifyMenusList error:', e)

    if (isShopifyAccessDeniedError(e)) {
      const connection = await getShopifyConnectionStatus()
      return {
        menus: [],
        error:
          connection.message ??
          'Shopify denied menu access. Enable read_online_store_navigation on this store app.',
      }
    }

    return { menus: [], error: detail }
  }
}

export async function fetchShopifyMenuById(menuId: string): Promise<StoreNavItem[] | null> {
  if (!isShopifyConfigured()) return null

  const config = getShopifyConfig()
  if (!config) return null

  const id = normalizeMenuId(menuId)
  if (!id) return null

  const access = await ensureNavigationAccess()
  if (!access.ok) return null

  try {
    const data = await shopifyAdminGraphql<MenuByIdQueryResponse>(
      `
        query StoreMenuById($id: ID!) {
          menu(id: $id) {
            id
            handle
            title
            ${MENU_ITEMS_FRAGMENT}
          }
        }
      `,
      { id }
    )

    return mapMenuNodeItems(data.menu, config.shop)
  } catch (e) {
    console.error(`fetchShopifyMenuById("${id}") error:`, e)
    return null
  }
}

export async function fetchShopifyMenuByHandle(handle: string): Promise<StoreNavItem[]> {
  const items = await fetchShopifyMenuByHandleRaw(handle)
  return items ?? FALLBACK_MAIN_MENU
}

async function fetchShopifyMenuByHandleRaw(handle: string): Promise<StoreNavItem[] | null> {
  if (!isShopifyConfigured()) return null

  const config = getShopifyConfig()
  if (!config) return null

  const menuHandle = resolveMainMenuHandle(handle)
  const access = await ensureNavigationAccess()
  if (!access.ok) {
    console.warn(
      access.message ??
        `Shopify menu "${menuHandle}" unavailable — navigation scope missing on ${config.shop}`
    )
    return null
  }

  try {
    const data = await shopifyAdminGraphql<MenusQueryResponse>(
      `
        query StoreMenuByHandle($query: String!) {
          menus(first: 1, query: $query) {
            nodes {
              id
              handle
              title
              ${MENU_ITEMS_FRAGMENT}
            }
          }
        }
      `,
      { query: `handle:${menuHandle}` }
    )

    const menu = data.menus.nodes[0]
    if (!menu) {
      console.warn(`Shopify menu "${menuHandle}" not found`)
      return null
    }

    return mapMenuNodeItems(menu, config.shop)
  } catch (e) {
    console.error(`fetchShopifyMenuByHandle("${menuHandle}") error:`, e)
    return null
  }
}

/** Saved menu id → handle → store default main-menu → fallback home link. */
export async function fetchShopifyMenuSelection(
  selection: ShopifyMenuSelection
): Promise<StoreNavItem[]> {
  if (!isShopifyConfigured()) {
    return FALLBACK_MAIN_MENU
  }

  const menuId = normalizeMenuId(selection.menuId)
  const menuHandle = String(selection.menuHandle ?? '').trim()

  if (menuId) {
    const byId = await fetchShopifyMenuById(menuId)
    if (byId?.length) return byId
  }

  if (menuHandle) {
    const byHandle = await fetchShopifyMenuByHandleRaw(menuHandle)
    if (byHandle?.length) return byHandle
  }

  const defaultMenu = await fetchShopifyMenuByHandleRaw('')
  if (defaultMenu?.length) return defaultMenu

  return FALLBACK_MAIN_MENU
}

export async function fetchShopifyMainMenu(): Promise<StoreNavItem[]> {
  if (!isShopifyConfigured()) {
    return FALLBACK_MAIN_MENU
  }

  try {
    const settings = await readHeaderNavSettingsConfig()
    return fetchShopifyMenuSelection({
      menuId: settings.menuId,
      menuHandle: settings.menuHandle,
    })
  } catch (e) {
    console.error('fetchShopifyMainMenu error:', e)
    return FALLBACK_MAIN_MENU
  }
}
