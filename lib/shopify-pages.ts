/** Shared Online Store page types + path helpers (safe for client + server). */

export type ShopifyOnlinePage = {
  id: string
  title: string
  handle: string
  bodyHtml: string
  bodySummary: string
  seoTitle: string
  seoDescription: string
}

/** Sanitize Online Store page handles (Shopify: lowercase letters, numbers, hyphens). */
export function sanitizeShopifyPageHandle(handle: string): string {
  return String(handle ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
}

/** `/pages/about-us` → `about-us`; otherwise null. */
export function parseShopifyPageHandleFromPath(path: string): string | null {
  const pathname = String(path ?? '')
    .trim()
    .split('?')[0]
    .replace(/\/+$/, '')
  const match = pathname.match(/^\/pages\/([^/]+)$/i)
  if (!match?.[1]) return null
  const handle = sanitizeShopifyPageHandle(decodeURIComponent(match[1]))
  return handle || null
}
