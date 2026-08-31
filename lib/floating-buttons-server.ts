import type { FloatingButtonsConfig } from '@/lib/floating-buttons'
import {
  DEFAULT_FLOATING_BUTTONS,
  FLOATING_BUTTONS_SETTING_KEY,
  normalizeFloatingButtonsConfig,
} from '@/lib/floating-buttons'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

export async function readFloatingButtonsConfig(): Promise<FloatingButtonsConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default floating buttons settings')
    return normalizeFloatingButtonsConfig(DEFAULT_FLOATING_BUTTONS)
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('*')
      .eq('key', FLOATING_BUTTONS_SETTING_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read floating buttons error:', error.message, error)
      return normalizeFloatingButtonsConfig(DEFAULT_FLOATING_BUTTONS)
    }

    if (!data?.value) {
      return normalizeFloatingButtonsConfig(DEFAULT_FLOATING_BUTTONS)
    }

    const raw = data.value
    const parsed =
      typeof raw === 'string'
        ? (JSON.parse(raw) as Partial<FloatingButtonsConfig>)
        : (raw as Partial<FloatingButtonsConfig>)

    return normalizeFloatingButtonsConfig(parsed)
  } catch (e) {
    console.error('readFloatingButtonsConfig error:', e)
    return normalizeFloatingButtonsConfig(DEFAULT_FLOATING_BUTTONS)
  }
}

export async function writeFloatingButtonsConfig(
  config: Partial<FloatingButtonsConfig> | FloatingButtonsConfig
): Promise<FloatingButtonsConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeFloatingButtonsConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: FLOATING_BUTTONS_SETTING_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('*')
    .single()

  if (error) {
    console.error('Supabase write floating buttons error:', error.message, error)
    throw new Error('Failed to save floating buttons settings to Supabase')
  }

  if (!data?.value) {
    console.error('Supabase write floating buttons: upsert returned no value', { data })
    throw new Error('Failed to save floating buttons settings to Supabase')
  }

  return normalizeFloatingButtonsConfig(data.value as Partial<FloatingButtonsConfig>)
}
