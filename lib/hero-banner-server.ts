import {
  DEFAULT_HERO_BANNER,
  HERO_BANNER_SETTING_KEY,
  normalizeHeroBannerConfig,
  type HeroBannerConfig,
} from '@/lib/hero-banner'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

export async function readHeroBannerConfig(): Promise<HeroBannerConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default hero banner settings')
    return DEFAULT_HERO_BANNER
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('value')
      .eq('key', HERO_BANNER_SETTING_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read hero banner error:', error.message)
      return DEFAULT_HERO_BANNER
    }

    if (!data?.value) return DEFAULT_HERO_BANNER

    return normalizeHeroBannerConfig(data.value as Partial<HeroBannerConfig>)
  } catch (e) {
    console.error('readHeroBannerConfig error:', e)
    return DEFAULT_HERO_BANNER
  }
}

export async function writeHeroBannerConfig(
  config: Partial<HeroBannerConfig> | HeroBannerConfig
): Promise<HeroBannerConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeHeroBannerConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: HERO_BANNER_SETTING_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('value')
    .single()

  if (error) {
    console.error('Supabase write hero banner error:', error.message)
    throw new Error('Failed to save hero banner settings to Supabase')
  }

  return normalizeHeroBannerConfig(data.value as Partial<HeroBannerConfig>)
}
