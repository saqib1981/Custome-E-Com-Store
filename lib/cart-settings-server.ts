import type { CartConfig } from '@/lib/cart'
import { CART_SETTING_KEY, DEFAULT_CART, normalizeCartConfig } from '@/lib/cart'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readCartConfig(): Promise<CartConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default cart settings')
    return normalizeCartConfig(DEFAULT_CART)
  }

  try {
    const value = await readStoreSettingValue(CART_SETTING_KEY)
    if (!value) return normalizeCartConfig(DEFAULT_CART)
    return normalizeCartConfig(value as Partial<CartConfig>)
  } catch (e) {
    console.error('readCartConfig error:', e)
    return normalizeCartConfig(DEFAULT_CART)
  }
}

export async function writeCartConfig(
  config: Partial<CartConfig> | CartConfig
): Promise<CartConfig> {
  const normalized = normalizeCartConfig(config)
  const saved = await writeStoreSettingValue(
    CART_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeCartConfig(saved as Partial<CartConfig>)
}
