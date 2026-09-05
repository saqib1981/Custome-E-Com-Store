import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'
import { revalidateStoreSettings } from '@/lib/store-settings-revalidate'

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

/** Stable JSON for deep compare (key-order independent). */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`
}

/**
 * Verify saved jsonb matches what we intended to write.
 * Scalars compared with coercion; nested objects/arrays via stable JSON.
 */
export function payloadMatches(
  payload: Record<string, unknown>,
  verified: Record<string, unknown> | null
): boolean {
  if (!verified) return false

  for (const [k, v] of Object.entries(payload)) {
    const got = verified[k]
    if (typeof v === 'boolean') {
      if (Boolean(got) !== v) return false
      continue
    }
    if (typeof v === 'number') {
      const n = Number(got)
      if (!Number.isFinite(n) || n !== v) return false
      continue
    }
    if (typeof v === 'string') {
      if (String(got ?? '') !== v) return false
      continue
    }
    if (v == null) {
      if (got != null) return false
      continue
    }
    // arrays / objects
    if (stableStringify(v) !== stableStringify(got)) return false
  }
  return true
}

const MIGRATION_HINT =
  'Supabase SQL Editor me database/store-settings.sql dobara Run karo (poori file), phir admin hard-reload karke Save try karo.'

async function readFromTable(
  admin: SupabaseClient,
  key: string
): Promise<Record<string, unknown> | null> {
  const { data, error, status } = await admin
    .from('store_settings')
    .select('key,value,updated_at')
    .eq('key', key)
    .maybeSingle()

  if (error) {
    console.error(`Supabase read store_settings[${key}] error:`, {
      message: error.message,
      code: error.code,
      status,
      details: error.details,
    })
    return null
  }
  return parseStoreSettingValue(data?.value)
}

async function readUntilMatches(
  admin: SupabaseClient,
  key: string,
  payload: Record<string, unknown>,
  attempts = 8
): Promise<Record<string, unknown> | null> {
  let last: Record<string, unknown> | null = null
  for (let i = 0; i < attempts; i++) {
    last = await readFromTable(admin, key)
    if (payloadMatches(payload, last)) return last
    await new Promise((r) => setTimeout(r, 50 * (i + 1)))
  }
  return last
}

/** Read one store_settings row from the table (authoritative, no Next fetch cache). */
export async function readStoreSettingValue(key: string): Promise<Record<string, unknown> | null> {
  if (!isSupabaseConfigured()) return null
  const safeKey = String(key ?? '').trim()
  if (!safeKey) return null
  return readFromTable(getSupabaseAdmin(), safeKey)
}

/**
 * Write settings, then confirm with a fresh table read.
 * Never return success unless verified data matches the payload (including nested fields).
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
  const updatedAt = new Date().toISOString()

  // 1) Direct upsert via service role (bypasses RLS)
  const up = await admin
    .from('store_settings')
    .upsert({ key: safeKey, value: payload, updated_at: updatedAt }, { onConflict: 'key' })
    .select('key,value,updated_at')
    .single()

  if (up.error) {
    console.error(`store_settings upsert[${safeKey}]`, up.error)

    // 2) Fallback RPC
    const rpc = await admin.rpc('force_upsert_store_setting', {
      p_key: safeKey,
      p_value: payload,
    })
    if (rpc.error) {
      console.error(`force_upsert_store_setting[${safeKey}]`, rpc.error)
      throw new Error(`${up.error.message} | ${rpc.error.message}. ${MIGRATION_HINT}`)
    }
  }

  // 3) Always re-read from table (never trust upsert echo alone — Next/PostgREST can be stale)
  const verified = await readUntilMatches(admin, safeKey, payload)
  if (!payloadMatches(payload, verified)) {
    console.error(`store_settings[${safeKey}] WRITE/READ MISMATCH`, {
      payload,
      verified,
      upsertEcho: up.data?.value ?? null,
    })
    throw new Error(`Save DB me confirm nahi hua. ${MIGRATION_HINT}`)
  }

  revalidateStoreSettings(safeKey)
  return verified as Record<string, unknown>
}

export function createStoreSettingsAdminClient(): SupabaseClient {
  return getSupabaseAdmin()
}
