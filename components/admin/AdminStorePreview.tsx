'use client'

import { Loader2 } from 'lucide-react'
import AnnouncementBarView from '@/components/announcement/AnnouncementBarView'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { DEFAULT_STORE_PROFILE } from '@/lib/storeProfile'
import StoreBrandMark from '@/components/StoreBrandMark'

export default function AdminStorePreview() {
  const { activeSection, announcementDraft, announcementLoading } = useAdminEditor()

  if (!activeSection) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Select a section</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Choose a section from the left panel to edit and preview your store.
          </p>
        </div>
      </div>
    )
  }

  if (announcementLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" aria-hidden />
        Loading preview…
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-gray-200/70 dark:bg-gray-950 overflow-hidden">
      <div className="shrink-0 px-4 py-3 border-b border-gray-300/70 dark:border-gray-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Preview</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">Changes update live before you save.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
        <div className="flex w-full min-h-full flex-col rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-lg overflow-hidden">
          {activeSection === 'announcement' && <AnnouncementBarView config={announcementDraft} repeats={6} />}
          <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" aria-hidden />
            <StoreBrandMark
              storeName={DEFAULT_STORE_PROFILE.storeName}
              logoUrl={DEFAULT_STORE_PROFILE.logoUrl}
              size="sm"
            />
            <span className="text-base font-bold text-primary-600 dark:text-primary-400 truncate">
              {DEFAULT_STORE_PROFILE.storeName}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-8 sm:p-12">
            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700 mb-4" aria-hidden />
            <div className="space-y-2">
              <div className="h-3 w-full max-w-md rounded bg-gray-200 dark:bg-gray-700" aria-hidden />
              <div className="h-3 w-full max-w-sm rounded bg-gray-200 dark:bg-gray-700" aria-hidden />
              <div className="h-3 w-full max-w-lg rounded bg-gray-200 dark:bg-gray-700" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
