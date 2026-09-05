import {
  DEFAULT_SEARCH,
  normalizeSearchConfig,
  type SearchConfig,
} from '@/lib/search'
import {
  resolveInvalidatedSettingsFetch,
  settingsFetchUrl,
} from '@/lib/store-settings-cache'

const CACHE_KEY = 'store-search-v1'

export const SEARCH_CACHE_KEY = CACHE_KEY
export const SEARCH_UPDATED_EVENT = 'store-search-updated'

let fetchInflight: Promise<SearchConfig> | null = null
let settingsEpoch = 0

export function readCachedSearch(): SearchConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return normalizeSearchConfig(JSON.parse(raw) as Partial<SearchConfig>)
  } catch {
    return null
  }
}

export function cacheSearch(config: SearchConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(normalizeSearchConfig(config)))
  } catch {
    // ignore
  }
}

export function clearCachedSearch(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}

export function notifySearchUpdated(config: SearchConfig): void {
  if (typeof window === 'undefined') return
  const normalized = normalizeSearchConfig(config)
  cacheSearch(normalized)
  window.dispatchEvent(
    new CustomEvent<SearchConfig>(SEARCH_UPDATED_EVENT, { detail: normalized })
  )
}

function invalidateInflightFetch(): void {
  settingsEpoch += 1
  fetchInflight = null
}

export async function fetchSearchSettings(signal?: AbortSignal): Promise<SearchConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const epochAtStart = settingsEpoch

  const req = (async () => {
    const res = await fetch(settingsFetchUrl('/api/admin/search-settings'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal,
    })
    const data = (res.ok ? await res.json() : DEFAULT_SEARCH) as SearchConfig
    const normalized = normalizeSearchConfig(data)

    if (epochAtStart !== settingsEpoch) {
      return resolveInvalidatedSettingsFetch(readCachedSearch, normalized)
    }

    cacheSearch(normalized)
    return normalized
  })()

  if (!signal) {
    fetchInflight = req
    req.finally(() => {
      if (fetchInflight === req) fetchInflight = null
    })
  }

  return req
}

export async function persistSearchSettings(config: SearchConfig): Promise<SearchConfig> {
  const normalized = normalizeSearchConfig(config)
  const res = await fetch('/api/admin/search-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(normalized),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to save search settings')
  const saved = normalizeSearchConfig((await res.json()) as Partial<SearchConfig>)
  invalidateInflightFetch()
  clearCachedSearch()
  notifySearchUpdated(saved)
  return saved
}

export async function fetchStoreSearchSettings(signal?: AbortSignal): Promise<SearchConfig> {
  const res = await fetch(settingsFetchUrl('/api/store/search-settings'), {
    cache: 'no-store',
    signal,
  })
  const data = (res.ok ? await res.json() : DEFAULT_SEARCH) as SearchConfig
  return normalizeSearchConfig(data)
}
