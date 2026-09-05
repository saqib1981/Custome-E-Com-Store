import {
  DEFAULT_CHECKOUT,
  normalizeCheckoutConfig,
  type CheckoutConfig,
} from '@/lib/checkout'
import {
  resolveInvalidatedSettingsFetch,
  settingsFetchUrl,
} from '@/lib/store-settings-cache'

const CACHE_KEY = 'store-checkout-settings-v1'

export const CHECKOUT_SETTINGS_CACHE_KEY = CACHE_KEY
export const CHECKOUT_SETTINGS_UPDATED_EVENT = 'store-checkout-settings-updated'

let fetchInflight: Promise<CheckoutConfig> | null = null
let settingsEpoch = 0

function readCachedCheckoutSettings(): CheckoutConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return normalizeCheckoutConfig(JSON.parse(raw) as Partial<CheckoutConfig>)
  } catch {
    return null
  }
}

function cacheCheckoutSettings(config: CheckoutConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(normalizeCheckoutConfig(config)))
  } catch {
    // ignore
  }
}

function clearCachedCheckoutSettings(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}

function invalidateInflightFetch(): void {
  settingsEpoch += 1
  fetchInflight = null
}

export async function fetchCheckoutSettings(signal?: AbortSignal): Promise<CheckoutConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const epochAtStart = settingsEpoch

  const req = (async () => {
    const res = await fetch(settingsFetchUrl('/api/admin/checkout-settings'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal,
    })
    const data = (res.ok ? await res.json() : DEFAULT_CHECKOUT) as CheckoutConfig
    const normalized = normalizeCheckoutConfig(data)

    if (epochAtStart !== settingsEpoch) {
      return resolveInvalidatedSettingsFetch(readCachedCheckoutSettings, normalized)
    }

    cacheCheckoutSettings(normalized)
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

export async function persistCheckoutSettings(
  config: CheckoutConfig
): Promise<CheckoutConfig> {
  const normalized = normalizeCheckoutConfig(config)
  const res = await fetch('/api/admin/checkout-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(normalized),
    cache: 'no-store',
  })
  if (!res.ok) {
    let message = 'Failed to save checkout settings'
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error?.trim()) message = body.error.trim()
    } catch {
      // ignore
    }
    if (res.status === 401) {
      message = 'Session expired. Sign in again at /myadmin/login.'
    }
    throw new Error(message)
  }
  const saved = normalizeCheckoutConfig((await res.json()) as Partial<CheckoutConfig>)
  invalidateInflightFetch()
  clearCachedCheckoutSettings()
  cacheCheckoutSettings(saved)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(CHECKOUT_SETTINGS_UPDATED_EVENT, { detail: saved })
    )
  }
  return saved
}

export async function fetchStoreCheckoutSettings(
  signal?: AbortSignal
): Promise<CheckoutConfig> {
  const res = await fetch(settingsFetchUrl('/api/store/checkout-settings'), {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    signal,
  })
  const data = (res.ok ? await res.json() : DEFAULT_CHECKOUT) as CheckoutConfig
  return normalizeCheckoutConfig(data)
}
