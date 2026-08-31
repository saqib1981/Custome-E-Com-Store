import { getShopifyConfig, isShopifyConfigured } from '@/lib/shopify-config'
import { shopifyAdminGraphql } from '@/lib/shopify-admin'

type ShopQueryResponse = {
  shop: {
    name: string
  }
}

function shopNameFromDomain(): string {
  const config = getShopifyConfig()
  if (!config) return 'Store'

  const handle = config.shop.replace(/\.myshopify\.com$/i, '')
  if (!handle) return 'Store'

  return handle
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function fetchShopifyShopName(): Promise<string> {
  if (!isShopifyConfigured()) return shopNameFromDomain()

  try {
    const data = await shopifyAdminGraphql<ShopQueryResponse>(`
      query StoreShopName {
        shop {
          name
        }
      }
    `)
    const name = data.shop?.name?.trim()
    return name || shopNameFromDomain()
  } catch (e) {
    console.error('fetchShopifyShopName error:', e)
    return shopNameFromDomain()
  }
}
