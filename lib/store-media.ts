/** Theme media must be hosted on Shopify Files (CDN) — never Supabase Storage or external URLs. */

const SHOPIFY_CDN_HOSTS = ['cdn.shopify.com', 'shopifycdn.com'] as const

export function isShopifyFilesUrl(url: string): boolean {
  const raw = String(url ?? '').trim()
  if (!raw) return true

  try {
    const host = new URL(raw).hostname.toLowerCase()
    return SHOPIFY_CDN_HOSTS.some((shopHost) => host === shopHost || host.endsWith(`.${shopHost}`))
  } catch {
    return false
  }
}

export function assertShopifyFilesUrl(url: string, fieldLabel: string): string {
  const raw = String(url ?? '').trim()
  if (!raw) return ''
  if (!isShopifyFilesUrl(raw)) {
    throw new Error(`${fieldLabel} must be uploaded to Shopify Files (cdn.shopify.com). External URLs are not allowed.`)
  }
  return raw
}
