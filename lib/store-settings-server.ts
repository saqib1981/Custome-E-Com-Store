import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'

/** Normalize jsonb / stringified jsonb from store_settings.value */
export function parseStoreSettingValue(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return null
    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
      return null
    } catch {
      return null
    }
  }

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }

  return null
}

/**
 * Read one store_settings row. Always select('*' — selecting only `value` has been
 * unreliable with some Supabase/PostgREST setups and silently returns empty defaults.
 */
export async function readStoreSettingValue(key: string): Promise<Record<string, unknown> | null> {
  if (!isSupabaseConfigured()) return null

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .select('*')
    .eq('key', key)
    .maybeSingle()

  if (error) {
    console.error(`Supabase read store_settings[${key}] error:`, error.message, error)
    return null
  }

  return parseStoreSettingValue(data?.value)
}

/** Upsert one store_settings row and return the persisted value. */
export async function writeStoreSettingValue(
  key: string,
  value: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const { data, error } = await getSupabaseAdmin()
    .from('store_settings')
    .upsert({ key, value }, { onConflict: 'key' })
    .select('*')
    .single()

  if (error) {
    console.error(`Supabase write store_settings[${key}] error:`, error.message, error)
    throw new Error(`Failed to save "${key}" settings to Supabase`)
  }

  const parsed = parseStoreSettingValue(data?.value)
  if (!parsed) {
    console.error(`Supabase write store_settings[${key}] returned empty value`, { data })
    throw new Error(`Failed to save "${key}" settings to Supabase`)
  }

  return parsed
}
