import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { getShopifyConfig, isShopifyConfigured } from '@/lib/shopify-config'
import {
  formatMissingShopifyScopesMessage,
  getMissingShopifyScopes,
  type ShopifyRequiredScope,
} from '@/lib/shopify-scopes'

export type ShopifyConnectionStatus = {
  configured: boolean
  connected: boolean
  ok: boolean
  shop: string
  shopName: string
  grantedScopes: string[]
  missingScopes: ShopifyRequiredScope[]
  message: string | null
}

type ConnectionQueryResponse = {
  shop: {
    name: string
    myshopifyDomain: string
  }
  currentAppInstallation: {
    accessScopes: Array<{ handle: string }>
  }
}

function shopLabelFromConfig(): string {
  const config = getShopifyConfig()
  if (!config) return ''

  return config.shop.replace(/\.myshopify\.com$/i, '')
}

function disconnectedStatus(message: string): ShopifyConnectionStatus {
  const config = getShopifyConfig()

  return {
    configured: isShopifyConfigured(),
    connected: false,
    ok: false,
    shop: config?.shop ?? '',
    shopName: shopLabelFromConfig() || 'Store',
    grantedScopes: [],
    missingScopes: [],
    message,
  }
}

export async function getShopifyConnectionStatus(): Promise<ShopifyConnectionStatus> {
  if (!isShopifyConfigured()) {
    return {
      configured: false,
      connected: false,
      ok: false,
      shop: '',
      shopName: 'Store',
      grantedScopes: [],
      missingScopes: [],
      message: 'Shopify is not configured. Add SHOPIFY_STORE_URL and API credentials to .env.local.',
    }
  }

  const config = getShopifyConfig()
  if (!config) {
    return disconnectedStatus('Shopify configuration is incomplete.')
  }

  try {
    const data = await shopifyAdminGraphql<ConnectionQueryResponse>(`
      query ShopifyConnectionStatus {
        shop {
          name
          myshopifyDomain
        }
        currentAppInstallation {
          accessScopes {
            handle
          }
        }
      }
    `)

    const grantedScopes = data.currentAppInstallation.accessScopes.map((scope) => scope.handle)
    const missingScopes = getMissingShopifyScopes(grantedScopes)
    const message = missingScopes.length ? formatMissingShopifyScopesMessage(missingScopes) : null

    return {
      configured: true,
      connected: true,
      ok: missingScopes.length === 0,
      shop: data.shop.myshopifyDomain || config.shop,
      shopName: data.shop.name?.trim() || shopLabelFromConfig() || 'Store',
      grantedScopes,
      missingScopes,
      message,
    }
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'Unknown Shopify error'
    return disconnectedStatus(`Could not connect to ${config.shop}: ${detail}`)
  }
}

export function isShopifyAccessDeniedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /access denied/i.test(message)
}
