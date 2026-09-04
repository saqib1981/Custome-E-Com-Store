import type { SearchConfig } from '@/lib/search'
import { DEFAULT_SEARCH, SEARCH_SETTING_KEY, normalizeSearchConfig } from '@/lib/search'
import { isSupabaseConfigured } from '@/lib/supabase-server'
import { readStoreSettingValue, writeStoreSettingValue } from '@/lib/store-settings-server'

export async function readSearchConfig(): Promise<SearchConfig> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — using default search settings')
    return normalizeSearchConfig(DEFAULT_SEARCH)
  }

  try {
    const value = await readStoreSettingValue(SEARCH_SETTING_KEY)
    if (!value) return normalizeSearchConfig(DEFAULT_SEARCH)
    return normalizeSearchConfig(value as Partial<SearchConfig>)
  } catch (e) {
    console.error('readSearchConfig error:', e)
    return normalizeSearchConfig(DEFAULT_SEARCH)
  }
}

export async function writeSearchConfig(
  config: Partial<SearchConfig> | SearchConfig
): Promise<SearchConfig> {
  const normalized = normalizeSearchConfig(config)
  const saved = await writeStoreSettingValue(
    SEARCH_SETTING_KEY,
    normalized as unknown as Record<string, unknown>
  )
  return normalizeSearchConfig(saved as Partial<SearchConfig>)
}
