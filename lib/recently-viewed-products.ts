/** Browser history of product pages the shopper has opened (most recent first). */

export const RECENTLY_VIEWED_STORAGE_KEY = 'store-recently-viewed-products-v1'
export const RECENTLY_VIEWED_UPDATED_EVENT = 'store-recently-viewed-updated'

const MAX_STORED = 24

function normalizeHandle(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function readRecentlyViewedHandles(options?: {
  exclude?: string
  limit?: number
}): string[] {
  if (typeof window === 'undefined') return []

  const exclude = normalizeHandle(options?.exclude)
  const limit =
    typeof options?.limit === 'number' && Number.isFinite(options.limit)
      ? Math.max(0, Math.min(MAX_STORED, Math.round(options.limit)))
      : MAX_STORED

  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    const seen = new Set<string>()
    const handles: string[] = []
    for (const entry of parsed) {
      const handle = normalizeHandle(entry)
      if (!handle || handle === 'example') continue
      if (exclude && handle === exclude) continue
      if (seen.has(handle)) continue
      seen.add(handle)
      handles.push(handle)
      if (handles.length >= limit) break
    }
    return handles
  } catch {
    return []
  }
}

export function recordRecentlyViewedProduct(handle: string): string[] {
  if (typeof window === 'undefined') return []

  const nextHandle = normalizeHandle(handle)
  if (!nextHandle || nextHandle === 'example') {
    return readRecentlyViewedHandles()
  }

  const previous = readRecentlyViewedHandles()
  const next = [nextHandle, ...previous.filter((h) => h !== nextHandle)].slice(0, MAX_STORED)

  try {
    window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(
      new CustomEvent<string[]>(RECENTLY_VIEWED_UPDATED_EVENT, { detail: next })
    )
  } catch {
    // ignore quota / private mode
  }

  return next
}
