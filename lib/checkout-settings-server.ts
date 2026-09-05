import type { CheckoutConfig } from '@/lib/checkout'
import {
  CHECKOUT_SETTING_KEY,
  DEFAULT_CHECKOUT,
  normalizeCheckoutConfig,
} from '@/lib/checkout'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readCheckoutConfig(): Promise<CheckoutConfig> {
  if (!isSupabaseConfigured()) {
    return normalizeCheckoutConfig(DEFAULT_CHECKOUT)
  }
  try {
    const value = await readStoreSettingValue(CHECKOUT_SETTING_KEY)
    if (!value) return normalizeCheckoutConfig(DEFAULT_CHECKOUT)
    return normalizeCheckoutConfig(value as Partial<CheckoutConfig>)
  } catch (e) {
    console.error('readCheckoutConfig error:', e)
    return normalizeCheckoutConfig(DEFAULT_CHECKOUT)
  }
}

export async function writeCheckoutConfig(
  config: Partial<CheckoutConfig> | CheckoutConfig
): Promise<CheckoutConfig> {
  const normalized = normalizeCheckoutConfig(config)
  const saved = await writeStoreSettingValue(
    CHECKOUT_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeCheckoutConfig(saved as Partial<CheckoutConfig>)
}
