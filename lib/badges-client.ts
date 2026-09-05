import {
  DEFAULT_BADGES,
  normalizeBadgesConfig,
  type BadgesConfig,
} from '@/lib/badges'
import {
  resolveInvalidatedSettingsFetch,
  settingsFetchUrl,
} from '@/lib/store-settings-cache'

const CACHE_KEY = 'store-badges-v1'

export const BADGES_CACHE_KEY = CACHE_KEY

export const BADGES_UPDATED_EVENT = 'store-badges-updated'

/** Debounced auto-save while editing badges in admin. */
export const BADGES_AUTOSAVE_MS = 400

let fetchInflight: Promise<BadgesConfig> | null = null
let settingsEpoch = 0

export function readCachedBadges(): BadgesConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_BADGES }
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return { ...DEFAULT_BADGES }
    return normalizeBadgesConfig(JSON.parse(raw) as Partial<BadgesConfig>)
  } catch {
    return { ...DEFAULT_BADGES }
  }
}

export function cacheBadges(config: BadgesConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(normalizeBadgesConfig(config)))
  } catch {
    // ignore
  }
}

export function notifyBadgesUpdated(config: BadgesConfig): void {
  if (typeof window === 'undefined') return
  const normalized = normalizeBadgesConfig(config)
  cacheBadges(normalized)
  window.dispatchEvent(
    new CustomEvent<BadgesConfig>(BADGES_UPDATED_EVENT, { detail: normalized })
  )
}

function invalidateInflightFetch(): void {
  settingsEpoch += 1
  fetchInflight = null
}

export async function fetchBadgesSettings(signal?: AbortSignal): Promise<BadgesConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const epochAtStart = settingsEpoch

  const req = (async () => {
    const res = await fetch(settingsFetchUrl('/api/admin/badges'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal,
    })
    const data = (res.ok ? await res.json() : DEFAULT_BADGES) as BadgesConfig
    const normalized = normalizeBadgesConfig(data)

    if (epochAtStart !== settingsEpoch) {
      return resolveInvalidatedSettingsFetch(readCachedBadges, normalized)
    }

    cacheBadges(normalized)
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

export async function persistBadgesSettings(config: BadgesConfig): Promise<BadgesConfig> {
  const normalized = normalizeBadgesConfig(config)
  const res = await fetch('/api/admin/badges', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(normalized),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to save badge settings')
  const saved = normalizeBadgesConfig((await res.json()) as Partial<BadgesConfig>)
  invalidateInflightFetch()
  notifyBadgesUpdated(saved)
  return saved
}
