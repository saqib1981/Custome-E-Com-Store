function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }
  return ''
}

export type ShopifyConfig = {
  shop: string
  clientId: string
  clientSecret: string
  apiVersion: string
  adminAccessToken: string
}

export function getShopifyConfig(): ShopifyConfig | null {
  const shopRaw = readEnv('SHOPIFY_STORE_URL', 'Shopify_Store_URL')
  const clientId = readEnv('SHOPIFY_CLIENT_ID', 'Shopify_Store_Client_ID')
  const clientSecret = readEnv('SHOPIFY_CLIENT_SECRET', 'Shopify_Store_Client_Secret')
  const apiVersion = readEnv('SHOPIFY_API_VERSION', 'API_version') || '2025-07'
  const adminAccessToken = readEnv('SHOPIFY_ADMIN_ACCESS_TOKEN', 'Shopify_Admin_Access_Token')

  if (!shopRaw) return null

  const shop = shopRaw
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .replace(/\.myshopify\.com.*$/, '')
    .concat('.myshopify.com')

  if (adminAccessToken) {
    return { shop, clientId, clientSecret, apiVersion, adminAccessToken }
  }

  if (!clientId || !clientSecret) return null

  return { shop, clientId, clientSecret, apiVersion, adminAccessToken: '' }
}

export function isShopifyConfigured(): boolean {
  return getShopifyConfig() !== null
}
