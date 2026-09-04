/** Theme media must be hosted on Shopify Files (CDN) — never staged/tmp, Supabase Storage, or external URLs. */

export type StoreAssetFolder = 'favicon' | 'logo' | 'logo-transparent' | 'hero'

const SHOPIFY_CDN_HOSTS = ['cdn.shopify.com', 'shopifycdn.com'] as const

/**
 * Temporary Shopify staged-upload hosts/paths. These expire and must never be persisted.
 * Example: https://shopify-staged-uploads.storage.googleapis.com/tmp/...
 */
export function isShopifyTemporaryUploadUrl(url: string): boolean {
  const raw = String(url ?? '').trim()
  if (!raw) return false

  try {
    const parsed = new URL(raw)
    const host = parsed.hostname.toLowerCase()
    const path = parsed.pathname.toLowerCase()

    if (host.includes('shopify-staged-uploads')) return true
    if (host.endsWith('storage.googleapis.com') && path.includes('/tmp/')) return true
    if (path.includes('/shopify-staged-uploads/')) return true
    return false
  } catch {
    return false
  }
}

function isShopifyCdnHostname(host: string): boolean {
  return SHOPIFY_CDN_HOSTS.some((shopHost) => host === shopHost || host.endsWith(`.${shopHost}`))
}

/**
 * Permanent storefront file URLs on the shop domain, e.g.
 * https://your-store.myshopify.com/cdn/shop/files/logo.png
 */
function isShopifyMyshopifyFilesUrl(host: string, path: string): boolean {
  if (!host.endsWith('.myshopify.com')) return false
  return path.startsWith('/cdn/shop/') || path.startsWith('/cdn/shopify/')
}

/** True only for permanent Shopify Files CDN URLs (non-empty). */
export function isShopifyFilesUrl(url: string): boolean {
  const raw = String(url ?? '').trim()
  if (!raw) return false
  if (isShopifyTemporaryUploadUrl(raw)) return false

  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false

    const host = parsed.hostname.toLowerCase()
    const path = parsed.pathname.toLowerCase()

    if (isShopifyCdnHostname(host)) return true
    if (isShopifyMyshopifyFilesUrl(host, path)) return true
    return false
  } catch {
    return false
  }
}

/** Read/normalize: keep CDN URLs, drop expired staged/external links as empty. */
export function sanitizeShopifyFilesUrl(url: unknown): string {
  const raw = String(url ?? '').trim()
  if (!raw) return ''
  return isShopifyFilesUrl(raw) ? raw : ''
}

/** Save-time: empty allowed; non-empty must be permanent CDN. */
export function assertShopifyFilesUrl(url: string, fieldLabel: string): string {
  const raw = String(url ?? '').trim()
  if (!raw) return ''
  if (isShopifyTemporaryUploadUrl(raw)) {
    throw new Error(
      `${fieldLabel} is a temporary Shopify upload link that expires. Re-upload the file so it is stored on cdn.shopify.com.`
    )
  }
  if (!isShopifyFilesUrl(raw)) {
    throw new Error(
      `${fieldLabel} must be uploaded to Shopify Files (cdn.shopify.com). External or temporary URLs are not allowed.`
    )
  }
  return raw
}

/** Upload API / client: must always return a permanent CDN URL (never empty, never staged). */
export function requireShopifyCdnUploadUrl(url: unknown, fieldLabel = 'Upload'): string {
  const raw = String(url ?? '').trim()
  if (!raw) {
    throw new Error(`${fieldLabel} did not return a file URL — try again`)
  }
  if (isShopifyTemporaryUploadUrl(raw)) {
    throw new Error(
      `${fieldLabel} returned a temporary staged URL. Wait for Shopify Files CDN and try again.`
    )
  }
  if (!isShopifyFilesUrl(raw)) {
    throw new Error(`${fieldLabel} must return a Shopify CDN URL (cdn.shopify.com)`)
  }
  return raw
}
