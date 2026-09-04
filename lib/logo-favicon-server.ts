import {
  assertLogoFaviconMediaUrls,
  DEFAULT_LOGO_FAVICON,
  LOGO_FAVICON_SETTING_KEY,
  normalizeLogoFaviconConfig,
  type LogoFaviconConfig,
} from '@/lib/logo-favicon'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readLogoFaviconConfig(): Promise<LogoFaviconConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default logo/favicon settings')
    return DEFAULT_LOGO_FAVICON
  }

  try {
    const value = await readStoreSettingValue(LOGO_FAVICON_SETTING_KEY)
    if (!value) return DEFAULT_LOGO_FAVICON
    return normalizeLogoFaviconConfig(value as Partial<LogoFaviconConfig>)
  } catch (e) {
    console.error('readLogoFaviconConfig error:', e)
    return DEFAULT_LOGO_FAVICON
  }
}

export async function writeLogoFaviconConfig(
  config: Partial<LogoFaviconConfig> | LogoFaviconConfig
): Promise<LogoFaviconConfig> {
  const normalized = assertLogoFaviconMediaUrls(normalizeLogoFaviconConfig(config))
  const saved = await writeStoreSettingValue(
    LOGO_FAVICON_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeLogoFaviconConfig(saved as Partial<LogoFaviconConfig>)
}
