import type { StoreFooterConfig } from '@/lib/store-footer'
import {
  DEFAULT_STORE_FOOTER,
  STORE_FOOTER_SETTING_KEY,
  normalizeStoreFooterConfig,
} from '@/lib/store-footer'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

export async function readStoreFooterConfig(): Promise<StoreFooterConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default store footer settings')
    return normalizeStoreFooterConfig(DEFAULT_STORE_FOOTER)
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('*')
      .eq('key', STORE_FOOTER_SETTING_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read store footer error:', error.message)
      return normalizeStoreFooterConfig(DEFAULT_STORE_FOOTER)
    }

    if (!data?.value) return normalizeStoreFooterConfig(DEFAULT_STORE_FOOTER)

    return normalizeStoreFooterConfig(data.value as Partial<StoreFooterConfig>)
  } catch (e) {
    console.error('readStoreFooterConfig error:', e)
    return normalizeStoreFooterConfig(DEFAULT_STORE_FOOTER)
  }
}

export async function writeStoreFooterConfig(
  config: Partial<StoreFooterConfig> | StoreFooterConfig
): Promise<StoreFooterConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeStoreFooterConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: STORE_FOOTER_SETTING_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('*')
    .single()

  if (error) {
    console.error('Supabase write store footer error:', error.message)
    throw new Error('Failed to save store footer settings to Supabase')
  }

  if (!data?.value) {
    throw new Error('Failed to save store footer settings to Supabase')
  }

  return normalizeStoreFooterConfig(data.value as Partial<StoreFooterConfig>)
}
