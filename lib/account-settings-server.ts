import type { AccountConfig } from '@/lib/account'
import { ACCOUNT_SETTING_KEY, DEFAULT_ACCOUNT, normalizeAccountConfig } from '@/lib/account'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readAccountConfig(): Promise<AccountConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default account settings')
    return normalizeAccountConfig(DEFAULT_ACCOUNT)
  }

  try {
    const value = await readStoreSettingValue(ACCOUNT_SETTING_KEY)
    if (!value) return normalizeAccountConfig(DEFAULT_ACCOUNT)
    return normalizeAccountConfig(value as Partial<AccountConfig>)
  } catch (e) {
    console.error('readAccountConfig error:', e)
    return normalizeAccountConfig(DEFAULT_ACCOUNT)
  }
}

export async function writeAccountConfig(
  config: Partial<AccountConfig> | AccountConfig
): Promise<AccountConfig> {
  const normalized = normalizeAccountConfig(config)
  const saved = await writeStoreSettingValue(
    ACCOUNT_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeAccountConfig(saved as Partial<AccountConfig>)
}
