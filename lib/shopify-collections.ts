export type ShopifyCollectionSummary = {
  id: string
  title: string
  handle: string
  imageUrl?: string
  imageAlt?: string
}

export function shopifyCollectionPath(handle: string): string {
  const safe = String(handle ?? '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/^collections\/?/, '')
  return safe ? `/collections/${safe}` : '/collections/all'
}

export function parseCollectionHandleFromLink(linkUrl: string): string | null {
  const raw = String(linkUrl ?? '').trim()
  const match = raw.match(/^\/collections\/([^/?#]+)\/?$/i)
  return match ? decodeURIComponent(match[1]) : null
}
