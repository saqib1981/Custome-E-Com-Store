import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { getShopifyConfig, isShopifyConfigured } from '@/lib/shopify-config'
import {
  FALLBACK_MAIN_MENU,
  getMainMenuHandle,
  mapShopifyMenuItems,
  type StoreNavItem,
} from '@/lib/shopify-menu'

type MenusQueryResponse = {
  menus: {
    nodes: Array<{
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
    }>
  }
}

export async function fetchShopifyMainMenu(): Promise<StoreNavItem[]> {
  if (!isShopifyConfigured()) {
    return FALLBACK_MAIN_MENU
  }

  const config = getShopifyConfig()
  if (!config) return FALLBACK_MAIN_MENU

  const handle = getMainMenuHandle()

  try {
    const data = await shopifyAdminGraphql<MenusQueryResponse>(
      `
        query StoreMainMenu($query: String!) {
          menus(first: 1, query: $query) {
            nodes {
              id
              handle
              title
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
            }
          }
        }
      `,
      { query: `handle:${handle}` }
    )

    const menu = data.menus.nodes[0]
    if (!menu?.items?.length) {
      console.warn(`Shopify main menu "${handle}" is empty — using fallback`)
      return FALLBACK_MAIN_MENU
    }

    return mapShopifyMenuItems(menu.items, config.shop)
  } catch (e) {
    console.error('fetchShopifyMainMenu error:', e)
    return FALLBACK_MAIN_MENU
  }
}
