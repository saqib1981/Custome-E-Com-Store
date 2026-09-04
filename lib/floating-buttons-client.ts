import {
  DEFAULT_FLOATING_BUTTONS,
  type FloatingButtonsConfig,
  normalizeFloatingButtonsConfig,
} from '@/lib/floating-buttons'
import { settingsFetchUrl } from '@/lib/store-settings-cache'

const CACHE_KEY = 'store-floating-buttons-v2'

export const FLOATING_BUTTONS_CACHE_KEY = CACHE_KEY

export const FLOATING_BUTTONS_UPDATED_EVENT = 'store-floating-buttons-updated'

/** Debounced auto-save while editing floating buttons in admin. */
export const FLOATING_BUTTONS_AUTOSAVE_MS = 400

let fetchInflight: Promise<FloatingButtonsConfig> | null = null
let settingsEpoch = 0

export function readCachedFloatingButtons(): FloatingButtonsConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_FLOATING_BUTTONS }
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return { ...DEFAULT_FLOATING_BUTTONS }
    return normalizeFloatingButtonsConfig(JSON.parse(raw) as Partial<FloatingButtonsConfig>)
  } catch {
    return { ...DEFAULT_FLOATING_BUTTONS }
  }
}

export function cacheFloatingButtons(config: FloatingButtonsConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(normalizeFloatingButtonsConfig(config)))
  } catch {
    // ignore
  }
}

export function notifyFloatingButtonsUpdated(config: FloatingButtonsConfig): void {
  if (typeof window === 'undefined') return
  const normalized = normalizeFloatingButtonsConfig(config)
  cacheFloatingButtons(normalized)
  window.dispatchEvent(
    new CustomEvent<FloatingButtonsConfig>(FLOATING_BUTTONS_UPDATED_EVENT, { detail: normalized })
  )
}

function invalidateInflightFetch(): void {
  settingsEpoch += 1
  fetchInflight = null
}

export async function fetchFloatingButtons(signal?: AbortSignal): Promise<FloatingButtonsConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const epochAtStart = settingsEpoch

  const req = (async () => {
    const res = await fetch(settingsFetchUrl('/api/admin/floating-buttons'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal,
    })
    const data = (res.ok ? await res.json() : DEFAULT_FLOATING_BUTTONS) as FloatingButtonsConfig
    const normalized = normalizeFloatingButtonsConfig(data)

    if (epochAtStart !== settingsEpoch) {
      return readCachedFloatingButtons()
    }

    cacheFloatingButtons(normalized)
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

export async function persistFloatingButtons(
  config: FloatingButtonsConfig
): Promise<FloatingButtonsConfig> {
  const normalized = normalizeFloatingButtonsConfig(config)
  const res = await fetch('/api/admin/floating-buttons', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(normalized),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to save floating buttons')
  const saved = normalizeFloatingButtonsConfig((await res.json()) as Partial<FloatingButtonsConfig>)
  invalidateInflightFetch()
  try {
    window.localStorage.removeItem('store-floating-buttons-v1')
  } catch {
    // ignore
  }
  notifyFloatingButtonsUpdated(saved)
  return saved
}
