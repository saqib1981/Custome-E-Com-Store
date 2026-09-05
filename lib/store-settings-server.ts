import { createClient, type SupabaseClient } from '@supabase/supabase-js'
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

function payloadMatches(
  payload: Record<string, unknown>,
  verified: Record<string, unknown> | null
): boolean {
  if (!verified) return false
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === 'boolean') {
      if (Boolean(verified[k]) !== v) return false
    } else if (typeof v === 'number') {
      const n = Number(verified[k])
      if (!Number.isFinite(n) || n !== v) return false
    } else if (typeof v === 'string') {
      if (String(verified[k] ?? '') !== v) return false
    }
  }
  return true
}

const MIGRATION_HINT =
  'Supabase SQL Editor me database/store-settings.sql dobara Run karo (poori file), phir admin hard-reload karke Save try karo.'

async function readFromTable(
  admin: SupabaseClient,
  key: string
): Promise<Record<string, unknown> | null> {
  const { data, error } = await admin
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

async function readUntilMatches(
  admin: SupabaseClient,
  key: string,
  payload: Record<string, unknown>,
  attempts = 6
): Promise<Record<string, unknown> | null> {
  let last: Record<string, unknown> | null = null
  for (let i = 0; i < attempts; i++) {
    last = await readFromTable(admin, key)
    if (payloadMatches(payload, last)) return last
    await new Promise((r) => setTimeout(r, 100 * (i + 1)))
  }
  return last
}

/** Read one store_settings row from the table (authoritative). */
export async function readStoreSettingValue(key: string): Promise<Record<string, unknown> | null> {
  if (!isSupabaseConfigured()) return null
  const safeKey = String(key ?? '').trim()
  if (!safeKey) return null
  return readFromTable(getSupabaseAdmin(), safeKey)
}

/**
 * Write settings, then confirm with repeated table reads.
 * Never return success unless a fresh read matches what we saved.
 */
export async function writeStoreSettingValue(
  key: string,
  value: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }

  const safeKey = String(key ?? '').trim()
  if (!safeKey) {
    throw new Error('Store setting key is required')
  }

  const admin = getSupabaseAdmin()
  const payload = JSON.parse(JSON.stringify(value)) as Record<string, unknown>

  // Prefer direct table upsert (service role) — avoids stale RPC/cache quirks.
  const up = await admin
    .from('store_settings')
    .upsert(
      { key: safeKey, value: payload, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    .select('value')
    .single()

  if (!up.error) {
    const fromUpsert = parseStoreSettingValue(up.data?.value)
    if (fromUpsert && payloadMatches(payload, fromUpsert)) {
      return fromUpsert
    }
  } else {
    console.error(`store_settings upsert[${safeKey}]`, up.error)
  }

  const rpc = await admin.rpc('force_upsert_store_setting', {
    p_key: safeKey,
    p_value: payload,
  })

  if (rpc.error) {
    console.error(`force_upsert_store_setting[${safeKey}]`, rpc.error)
    throw new Error(
      `${up.error?.message || rpc.error.message}. ${MIGRATION_HINT}`
    )
  }

  const rpcValue = parseStoreSettingValue(rpc.data)
  if (rpcValue && payloadMatches(payload, rpcValue)) {
    return rpcValue
  }

  const verified = await readUntilMatches(admin, safeKey, payload)
  if (!payloadMatches(payload, verified)) {
    console.error(`store_settings[${safeKey}] WRITE/READ MISMATCH after retries`, {
      payload,
      verified,
      rpcData: rpc.data ?? null,
      upsertData: up.data ?? null,
    })
    throw new Error(`Save DB me confirm nahi hua. ${MIGRATION_HINT}`)
  }

  return verified as Record<string, unknown>
}

export function createStoreSettingsAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: 'no-store' }),
      },
    }
  )
}
