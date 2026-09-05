'use client'

import { ChevronLeft, Loader2, Save } from 'lucide-react'
import type { ReactNode } from 'react'

type AdminPanelShellProps = {
  title: string
  subtitle?: string
  onBack: () => void
  onSave?: () => void | Promise<void>
  saveDisabled?: boolean
  saving?: boolean
  status?: 'idle' | 'saved' | 'error'
  /** Optional detail under the generic error banner */
  errorMessage?: string | null
  children: ReactNode
}

/** Shared header for section / global setting detail panels. */
export default function AdminPanelShell({
  title,
  subtitle,
  onBack,
  onSave,
  saveDisabled = true,
  saving = false,
  status = 'idle',
  errorMessage = null,
  children,
}: AdminPanelShellProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 dark:border-gray-800">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back
          </button>
          {saving ? (
            <span
              className="ml-auto inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400"
              role="status"
            >
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Syncing
            </span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
            {subtitle ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            ) : null}
          </div>
          {onSave ? (
            <button
              type="button"
              onClick={() => void onSave()}
              disabled={saveDisabled || saving}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              Save
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {status === 'saved' && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-600 dark:bg-green-950/30 dark:text-green-400">
            {saving ? 'Saved — syncing…' : 'Settings saved.'}
          </p>
        )}
        {status === 'error' && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {errorMessage?.trim() || 'Could not save. Please try again.'}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
