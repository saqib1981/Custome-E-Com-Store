import {
  DEFAULT_LOGO_FAVICON,
  LOGO_FAVICON_SETTING_KEY,
  normalizeLogoFaviconConfig,
  type LogoFaviconConfig,
} from '@/lib/logo-favicon'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

export async function readLogoFaviconConfig(): Promise<LogoFaviconConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default logo/favicon settings')
    return DEFAULT_LOGO_FAVICON
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('value')
      .eq('key', LOGO_FAVICON_SETTING_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read logo-favicon error:', error.message)
      return DEFAULT_LOGO_FAVICON
    }

    if (!data?.value) return DEFAULT_LOGO_FAVICON

    return normalizeLogoFaviconConfig(data.value as Partial<LogoFaviconConfig>)
  } catch (e) {
    console.error('readLogoFaviconConfig error:', e)
    return DEFAULT_LOGO_FAVICON
  }
}

export async function writeLogoFaviconConfig(
  config: Partial<LogoFaviconConfig> | LogoFaviconConfig
): Promise<LogoFaviconConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeLogoFaviconConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: LOGO_FAVICON_SETTING_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('value')
    .single()

  if (error) {
    console.error('Supabase write logo-favicon error:', error.message)
    throw new Error('Failed to save logo and favicon settings to Supabase')
  }

  return normalizeLogoFaviconConfig(data.value as Partial<LogoFaviconConfig>)
}
