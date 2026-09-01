import {
  DEFAULT_FLOATING_BUTTONS,
  type FloatingButtonsConfig,
  normalizeFloatingButtonsConfig,
} from '@/lib/floating-buttons'

const CACHE_KEY = 'store-floating-buttons-v1'

export const FLOATING_BUTTONS_CACHE_KEY = CACHE_KEY

export const FLOATING_BUTTONS_UPDATED_EVENT = 'store-floating-buttons-updated'

/** Debounced auto-save while editing floating buttons in admin. */
export const FLOATING_BUTTONS_AUTOSAVE_MS = 400

let fetchInflight: Promise<FloatingButtonsConfig> | null = null

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
    // ignore quota / private mode
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

export async function fetchFloatingButtons(signal?: AbortSignal): Promise<FloatingButtonsConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const req = (async () => {
    const res = await fetch('/api/admin/floating-buttons', { cache: 'no-store', signal })
    const data = (res.ok ? await res.json() : DEFAULT_FLOATING_BUTTONS) as FloatingButtonsConfig
    const normalized = normalizeFloatingButtonsConfig(data)
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalized),
  })
  if (!res.ok) throw new Error('Failed to save floating buttons')
  const saved = normalizeFloatingButtonsConfig((await res.json()) as Partial<FloatingButtonsConfig>)
  notifyFloatingButtonsUpdated(saved)
  return saved
}
