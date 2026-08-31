import type { AnnouncementConfig } from '@/lib/announcement'
import {
  ANNOUNCEMENT_SETTING_KEY,
  DEFAULT_ANNOUNCEMENT,
  normalizeHexColor,
  normalizeHeight,
} from '@/lib/announcement'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

export function normalizeAnnouncementConfig(input: Partial<AnnouncementConfig> | null | undefined): AnnouncementConfig {
  const enabled = input?.enabled ?? DEFAULT_ANNOUNCEMENT.enabled
  const message = String(input?.message ?? DEFAULT_ANNOUNCEMENT.message).trim()
  const speedRaw = String(input?.speed ?? DEFAULT_ANNOUNCEMENT.speed).trim()
  const gapRaw = String(input?.gap ?? DEFAULT_ANNOUNCEMENT.gap).trim()

  const speedMatch = speedRaw.match(/^(\d+)s$/)
  const speedSeconds = speedMatch ? Math.min(90, Math.max(8, Number(speedMatch[1]))) : 15

  return {
    enabled: Boolean(enabled),
    message: message.slice(0, 280),
    speed: `${speedSeconds}s`,
    gap: gapRaw || DEFAULT_ANNOUNCEMENT.gap,
    backgroundColor: normalizeHexColor(input?.backgroundColor, DEFAULT_ANNOUNCEMENT.backgroundColor),
    textColor: normalizeHexColor(input?.textColor, DEFAULT_ANNOUNCEMENT.textColor),
    height: normalizeHeight(input?.height, DEFAULT_ANNOUNCEMENT.height),
  }
}

export async function readAnnouncementConfig(): Promise<AnnouncementConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default announcement settings')
    return DEFAULT_ANNOUNCEMENT
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('value')
      .eq('key', ANNOUNCEMENT_SETTING_KEY)
      .maybeSingle()

    if (error) {
      console.error('Supabase read announcement error:', error.message)
      return DEFAULT_ANNOUNCEMENT
    }

    if (!data?.value) return DEFAULT_ANNOUNCEMENT

    return normalizeAnnouncementConfig(data.value as Partial<AnnouncementConfig>)
  } catch (e) {
    console.error('readAnnouncementConfig error:', e)
    return DEFAULT_ANNOUNCEMENT
  }
}

export async function writeAnnouncementConfig(
  config: Partial<AnnouncementConfig> | AnnouncementConfig
): Promise<AnnouncementConfig> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const normalized = normalizeAnnouncementConfig(config)

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert(
      {
        key: ANNOUNCEMENT_SETTING_KEY,
        value: normalized,
      },
      { onConflict: 'key' }
    )
    .select('value')
    .single()

  if (error) {
    console.error('Supabase write announcement error:', error.message)
    throw new Error('Failed to save announcement settings to Supabase')
  }

  return normalizeAnnouncementConfig(data.value as Partial<AnnouncementConfig>)
}
