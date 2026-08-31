/** Admin API scopes this storefront needs — enable these on every Shopify app install. */
export const SHOPIFY_REQUIRED_SCOPES = [
  {
    handle: 'read_online_store_navigation',
    label: 'Navigation menus',
    description: 'Load header / mobile menus from Online Store → Navigation',
  },
  {
    handle: 'read_products',
    label: 'Products & collections',
    description: 'List collections for hero slider links and catalog features',
  },
  {
    handle: 'write_files',
    label: 'Files',
    description: 'Upload logo and favicon to Shopify Files (CDN)',
  },
] as const

export type ShopifyRequiredScope = (typeof SHOPIFY_REQUIRED_SCOPES)[number]

export function getMissingShopifyScopes(granted: string[]): ShopifyRequiredScope[] {
  const grantedSet = new Set(granted.map((scope) => scope.trim()).filter(Boolean))
  return SHOPIFY_REQUIRED_SCOPES.filter((scope) => !grantedSet.has(scope.handle))
}

export function formatMissingShopifyScopesMessage(missing: ShopifyRequiredScope[]): string {
  if (!missing.length) return ''

  const scopeList = missing.map((scope) => `${scope.handle} (${scope.label})`).join(', ')
  return `Missing Shopify access scopes: ${scopeList}. Open Dev Dashboard → your app → Access scopes, enable them, release a new version, then approve/install the app on this store.`
}
