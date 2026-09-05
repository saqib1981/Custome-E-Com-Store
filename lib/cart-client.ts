import {
  DEFAULT_CART,
  normalizeCartConfig,
  type CartConfig,
} from '@/lib/cart'
import { settingsFetchUrl } from '@/lib/store-settings-cache'

const CACHE_KEY = 'store-cart-settings-v1'

export const CART_SETTINGS_CACHE_KEY = CACHE_KEY
export const CART_SETTINGS_UPDATED_EVENT = 'store-cart-settings-updated'

let fetchInflight: Promise<CartConfig> | null = null
let settingsEpoch = 0

export function readCachedCartSettings(): CartConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return normalizeCartConfig(JSON.parse(raw) as Partial<CartConfig>)
  } catch {
    return null
  }
}

export function cacheCartSettings(config: CartConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(normalizeCartConfig(config)))
  } catch {
    // ignore
  }
}

export function clearCachedCartSettings(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}

export function notifyCartSettingsUpdated(config: CartConfig): void {
  if (typeof window === 'undefined') return
  const normalized = normalizeCartConfig(config)
  cacheCartSettings(normalized)
  window.dispatchEvent(
    new CustomEvent<CartConfig>(CART_SETTINGS_UPDATED_EVENT, { detail: normalized })
  )
}

function invalidateInflightFetch(): void {
  settingsEpoch += 1
  fetchInflight = null
}

export async function fetchCartSettings(signal?: AbortSignal): Promise<CartConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const epochAtStart = settingsEpoch

  const req = (async () => {
    const res = await fetch(settingsFetchUrl('/api/admin/cart-settings'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal,
    })
    const data = (res.ok ? await res.json() : DEFAULT_CART) as CartConfig
    const normalized = normalizeCartConfig(data)

    if (epochAtStart !== settingsEpoch) {
      return readCachedCartSettings() ?? normalized
    }

    cacheCartSettings(normalized)
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

export async function persistCartSettings(config: CartConfig): Promise<CartConfig> {
  const normalized = normalizeCartConfig(config)
  const res = await fetch('/api/admin/cart-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(normalized),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to save cart settings')
  const saved = normalizeCartConfig((await res.json()) as Partial<CartConfig>)
  invalidateInflightFetch()
  clearCachedCartSettings()
  notifyCartSettingsUpdated(saved)
  return saved
}

export async function fetchStoreCartSettings(signal?: AbortSignal): Promise<CartConfig> {
  const res = await fetch(settingsFetchUrl('/api/store/cart-settings'), {
    cache: 'no-store',
    signal,
  })
  const data = (res.ok ? await res.json() : DEFAULT_CART) as CartConfig
  return normalizeCartConfig(data)
}
