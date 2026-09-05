/**
 * Shopify Admin API scopes this storefront needs.
 * Enable on Dev Dashboard → App → Access scopes, then reinstall / re-approve the app.
 */

/** Required — without these core features break. */
export const SHOPIFY_REQUIRED_SCOPES = [
  {
    handle: 'read_online_store_navigation',
    label: 'Navigation menus',
    description: 'Header / mobile menus from Online Store → Navigation',
  },
  {
    handle: 'read_products',
    label: 'Products & collections',
    description: 'Catalog, collection pages, product PDP, search, hero collection links',
  },
  {
    handle: 'read_files',
    label: 'Read files',
    description: 'Resolve permanent CDN URLs after logo / theme media upload',
  },
  {
    handle: 'write_files',
    label: 'Write files',
    description: 'Upload logo, favicon, hero images/videos to Shopify Files CDN',
  },
  {
    handle: 'write_orders',
    label: 'Orders (write)',
    description: 'Custom checkout places orders directly in Shopify Orders (no draft)',
  },
  {
    handle: 'read_orders',
    label: 'Orders',
    description: 'Customer order status + history on your store domain (/orders)',
  },
  {
    handle: 'write_customers',
    label: 'Customers (write)',
    description:
      'Checkout “Email me with news and offers” → mark customer as email marketing subscribed',
  },
  {
    handle: 'read_customers',
    label: 'Customers (read)',
    description:
      'Match existing Shopify customers by email/phone so checkout does not fail with “phone already taken”',
  },
] as const

/**
 * Recommended — checkout / markets polish. App still runs without them,
 * but Country list & Payment methods may fall back to defaults.
 */
export const SHOPIFY_RECOMMENDED_SCOPES = [
  {
    handle: 'read_markets',
    label: 'Markets',
    description: 'Checkout Country/Region from active Markets (fallback if shipsToCountries empty)',
  },
  {
    handle: 'unauthenticated_read_product_listings',
    label: 'Storefront product listings',
    description: 'Needed so Admin API can create a Storefront access token for /account login',
  },
] as const

export type ShopifyRequiredScope = (typeof SHOPIFY_REQUIRED_SCOPES)[number]
export type ShopifyRecommendedScope = (typeof SHOPIFY_RECOMMENDED_SCOPES)[number]

export function getMissingShopifyScopes(granted: string[]): ShopifyRequiredScope[] {
  const grantedSet = new Set(granted.map((scope) => scope.trim()).filter(Boolean))
  return SHOPIFY_REQUIRED_SCOPES.filter((scope) => !grantedSet.has(scope.handle))
}

export function getMissingRecommendedShopifyScopes(
  granted: string[]
): ShopifyRecommendedScope[] {
  const grantedSet = new Set(granted.map((scope) => scope.trim()).filter(Boolean))
  return SHOPIFY_RECOMMENDED_SCOPES.filter((scope) => !grantedSet.has(scope.handle))
}

export function formatMissingShopifyScopesMessage(missing: ShopifyRequiredScope[]): string {
  if (!missing.length) return ''

  const scopeList = missing.map((scope) => `${scope.handle} (${scope.label})`).join(', ')
  return `Missing Shopify access scopes: ${scopeList}. Open Dev Dashboard → your app → Access scopes, enable them, release a new version, then approve/install the app on this store.`
}
