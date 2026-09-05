import {
  DEFAULT_ACCOUNT,
  normalizeAccountConfig,
  type AccountConfig,
} from '@/lib/account'
import { settingsFetchUrl } from '@/lib/store-settings-cache'

const CACHE_KEY = 'store-account-settings-v1'

export const ACCOUNT_SETTINGS_CACHE_KEY = CACHE_KEY
export const ACCOUNT_SETTINGS_UPDATED_EVENT = 'store-account-settings-updated'

let fetchInflight: Promise<AccountConfig> | null = null
let settingsEpoch = 0

export function readCachedAccountSettings(): AccountConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return normalizeAccountConfig(JSON.parse(raw) as Partial<AccountConfig>)
  } catch {
    return null
  }
}

export function cacheAccountSettings(config: AccountConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(normalizeAccountConfig(config)))
  } catch {
    // ignore
  }
}

export function clearCachedAccountSettings(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}

export function notifyAccountSettingsUpdated(config: AccountConfig): void {
  if (typeof window === 'undefined') return
  const normalized = normalizeAccountConfig(config)
  cacheAccountSettings(normalized)
  window.dispatchEvent(
    new CustomEvent<AccountConfig>(ACCOUNT_SETTINGS_UPDATED_EVENT, { detail: normalized })
  )
}

function invalidateInflightFetch(): void {
  settingsEpoch += 1
  fetchInflight = null
}

export async function fetchAccountSettings(signal?: AbortSignal): Promise<AccountConfig> {
  if (!signal && fetchInflight) return fetchInflight

  const epochAtStart = settingsEpoch

  const req = (async () => {
    const res = await fetch(settingsFetchUrl('/api/admin/account-settings'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal,
    })
    const data = (res.ok ? await res.json() : DEFAULT_ACCOUNT) as AccountConfig
    const normalized = normalizeAccountConfig(data)

    if (epochAtStart !== settingsEpoch) {
      return readCachedAccountSettings() ?? normalized
    }

    cacheAccountSettings(normalized)
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

export async function fetchStoreAccountSettings(signal?: AbortSignal): Promise<AccountConfig> {
  const res = await fetch(settingsFetchUrl('/api/store/account-settings'), {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    signal,
  })
  const data = (res.ok ? await res.json() : DEFAULT_ACCOUNT) as AccountConfig
  return normalizeAccountConfig(data)
}

export async function persistAccountSettings(config: AccountConfig): Promise<AccountConfig> {
  const normalized = normalizeAccountConfig(config)
  const res = await fetch('/api/admin/account-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(normalized),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to save account settings')
  const saved = normalizeAccountConfig((await res.json()) as Partial<AccountConfig>)
  invalidateInflightFetch()
  clearCachedAccountSettings()
  notifyAccountSettingsUpdated(saved)
  return saved
}
