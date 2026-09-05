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

/** Persist a plain jsonb-safe object (no class instances / undefined). */
function toCheckoutStorePayload(config: CheckoutConfig): Record<string, unknown> {
  return {
    enabled: config.enabled,
    pageTitle: config.pageTitle,
    submitLabel: config.submitLabel,
    successTitle: config.successTitle,
    successMessage: config.successMessage,
    emptyCartText: config.emptyCartText,
    showOrderNotes: config.showOrderNotes,
    requirePhone: config.requirePhone,
    requireEmail: config.requireEmail,
    requireAddress: config.requireAddress,
    requireCity: config.requireCity,
    paymentMethods: config.paymentMethods.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      manual: m.manual,
    })),
    shippingAmount: config.shippingAmount,
    shippingTitle: config.shippingTitle,
    freeShippingEnabled: config.freeShippingEnabled,
    freeShippingThreshold: config.freeShippingThreshold,
  }
}

export async function writeCheckoutConfig(
  config: Partial<CheckoutConfig> | CheckoutConfig
): Promise<CheckoutConfig> {
  const normalized = normalizeCheckoutConfig(config)
  const saved = await writeStoreSettingValue(
    CHECKOUT_SETTING_KEY,
    toCheckoutStorePayload(normalized)
  )
  return normalizeCheckoutConfig(saved as Partial<CheckoutConfig>)
}
