import type { TrustBannerConfig } from '@/lib/trust-banner'
import {
  DEFAULT_TRUST_BANNER,
  TRUST_BANNER_SETTING_KEY,
  normalizeTrustBannerConfig,
} from '@/lib/trust-banner'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

export async function readTrustBannerConfig(): Promise<TrustBannerConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default trust banner settings')
    return normalizeTrustBannerConfig(DEFAULT_TRUST_BANNER)
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('value')
      .eq('key', TRUST_BANNER_SETTING_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read trust banner error:', error.message)
      return normalizeTrustBannerConfig(DEFAULT_TRUST_BANNER)
    }

    if (!data?.value) return normalizeTrustBannerConfig(DEFAULT_TRUST_BANNER)

    return normalizeTrustBannerConfig(data.value as Partial<TrustBannerConfig>)
  } catch (e) {
    console.error('readTrustBannerConfig error:', e)
    return normalizeTrustBannerConfig(DEFAULT_TRUST_BANNER)
  }
}

export async function writeTrustBannerConfig(
  config: Partial<TrustBannerConfig> | TrustBannerConfig
): Promise<TrustBannerConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeTrustBannerConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: TRUST_BANNER_SETTING_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('value')
    .single()

  if (error) {
    console.error('Supabase write trust banner error:', error.message)
    throw new Error('Failed to save trust banner settings to Supabase')
  }

  return normalizeTrustBannerConfig(data.value as Partial<TrustBannerConfig>)
}
