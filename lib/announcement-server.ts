import type { AnnouncementConfig } from '@/lib/announcement'
import {
  ANNOUNCEMENT_SETTING_KEY,
  DEFAULT_ANNOUNCEMENT,
  normalizeHexColor,
  normalizeHeight,
} from '@/lib/announcement'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

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
    const value = await readStoreSettingValue(ANNOUNCEMENT_SETTING_KEY)
    if (!value) return DEFAULT_ANNOUNCEMENT
    return normalizeAnnouncementConfig(value as Partial<AnnouncementConfig>)
  } catch (e) {
    console.error('readAnnouncementConfig error:', e)
    return DEFAULT_ANNOUNCEMENT
  }
}

export async function writeAnnouncementConfig(
  config: Partial<AnnouncementConfig> | AnnouncementConfig
): Promise<AnnouncementConfig> {
  const normalized = normalizeAnnouncementConfig(config)
  const saved = await writeStoreSettingValue(
    ANNOUNCEMENT_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeAnnouncementConfig(saved as Partial<AnnouncementConfig>)
}
