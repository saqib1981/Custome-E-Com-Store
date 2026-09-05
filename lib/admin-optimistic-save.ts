/** Optimistic admin settings save — apply UI first, persist in background, rollback on failure. */

export type AdminSaveStatus = 'idle' | 'saved' | 'error'

export type OptimisticSaveOptions<T> = {
  /** Last confirmed server state (for rollback). */
  getSnapshot: () => T
  /** Draft value to show immediately. */
  getOptimistic: () => T
  /** Apply value to saved + draft (+ refs). */
  applyLocal: (value: T) => void
  /** Network write; return verified server payload. */
  persist: (value: T) => Promise<T>
  setSaving: (saving: boolean) => void
  setStatus: (status: AdminSaveStatus) => void
  setErrorMessage?: (message: string | null) => void
  /** Cache bust / local authority after optimistic + confirmed writes. */
  onWriteSuccess?: () => void
}

/**
 * Instant UI update (&lt;10ms), then background persist.
 * On failure: restore snapshot and surface error.
 */
export async function runOptimisticSettingsSave<T>(
  opts: OptimisticSaveOptions<T>
): Promise<boolean> {
  const snapshot = opts.getSnapshot()
  const optimistic = opts.getOptimistic()

  opts.applyLocal(optimistic)
  opts.setErrorMessage?.(null)
  opts.setStatus('saved')
  opts.setSaving(true)
  opts.onWriteSuccess?.()

  try {
    const confirmed = await opts.persist(optimistic)
    opts.applyLocal(confirmed)
    opts.setStatus('saved')
    opts.onWriteSuccess?.()
    return true
  } catch (e) {
    opts.applyLocal(snapshot)
    opts.setStatus('error')
    opts.setErrorMessage?.(
      e instanceof Error ? e.message : 'Could not save. Please try again.'
    )
    return false
  } finally {
    opts.setSaving(false)
  }
}

/** PUT JSON helper for admin settings routes. */
export async function putAdminSettingsJson<T>(
  url: string,
  body: unknown,
  fallbackError = 'Save failed'
): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    let message = fallbackError
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error?.trim()) message = data.error.trim()
    } catch {
      // ignore
    }
    if (res.status === 401) {
      message = 'Session expired. Sign in again at /myadmin/login.'
    }
    throw new Error(message)
  }
  return (await res.json()) as T
}
