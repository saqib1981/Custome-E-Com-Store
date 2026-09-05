import {
  DEFAULT_CHECKOUT,
  normalizeCheckoutConfig,
  type CheckoutConfig,
} from '@/lib/checkout'
import { settingsFetchUrl } from '@/lib/store-settings-cache'

const CACHE_KEY = 'store-checkout-settings-v1'

export const CHECKOUT_SETTINGS_CACHE_KEY = CACHE_KEY

let fetchInflight: Promise<CheckoutConfig> | null = null

export async function fetchCheckoutSettings(signal?: AbortSignal): Promise<CheckoutConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const req = (async () => {
    const res = await fetch(settingsFetchUrl('/api/admin/checkout-settings'), {
      cache: 'no-store',
      signal,
    })
    const data = (res.ok ? await res.json() : DEFAULT_CHECKOUT) as CheckoutConfig
    return normalizeCheckoutConfig(data)
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalized),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to save checkout settings')
  return normalizeCheckoutConfig((await res.json()) as Partial<CheckoutConfig>)
}

export async function fetchStoreCheckoutSettings(
  signal?: AbortSignal
): Promise<CheckoutConfig> {
  const res = await fetch(settingsFetchUrl('/api/store/checkout-settings'), {
    cache: 'no-store',
    signal,
  })
  const data = (res.ok ? await res.json() : DEFAULT_CHECKOUT) as CheckoutConfig
  return normalizeCheckoutConfig(data)
}
