import type { HomeDividerConfig } from '@/lib/home-divider'
import {
  DEFAULT_HOME_DIVIDER,
  HOME_DIVIDER_SETTING_KEY,
  normalizeHomeDividerConfig,
} from '@/lib/home-divider'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

export async function readHomeDividerConfig(): Promise<HomeDividerConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default home divider settings')
    return DEFAULT_HOME_DIVIDER
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('value')
      .eq('key', HOME_DIVIDER_SETTING_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read home divider error:', error.message)
      return DEFAULT_HOME_DIVIDER
    }

    if (!data?.value) return DEFAULT_HOME_DIVIDER

    return normalizeHomeDividerConfig(data.value as Partial<HomeDividerConfig>)
  } catch (e) {
    console.error('readHomeDividerConfig error:', e)
    return DEFAULT_HOME_DIVIDER
  }
}

export async function writeHomeDividerConfig(
  config: Partial<HomeDividerConfig> | HomeDividerConfig
): Promise<HomeDividerConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeHomeDividerConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: HOME_DIVIDER_SETTING_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('value')
    .single()

  if (error) {
    console.error('Supabase write home divider error:', error.message)
    throw new Error('Failed to save home divider settings to Supabase')
  }

  return normalizeHomeDividerConfig(data.value as Partial<HomeDividerConfig>)
}
