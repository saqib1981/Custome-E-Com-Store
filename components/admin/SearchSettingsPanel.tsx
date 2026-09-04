'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function SearchSettingsPanel() {
  const {
    closeSection,
    searchDraft,
    searchDirty,
    searchSaving,
    searchStatus,
    updateSearchDraft,
    saveSearch,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Search"
      subtitle="Search popup — find products across the store"
      onBack={closeSection}
      onSave={() => void saveSearch()}
      saveDisabled={!searchDirty}
      saving={searchSaving}
      status={searchStatus}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Enable search
          </span>
          <input
            type="checkbox"
            checked={searchDraft.enabled}
            onChange={(e) => updateSearchDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Show product images
          </span>
          <input
            type="checkbox"
            checked={searchDraft.showProductImages}
            onChange={(e) => updateSearchDraft({ showProductImages: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show prices</span>
          <input
            type="checkbox"
            checked={searchDraft.showPrices}
            onChange={(e) => updateSearchDraft({ showPrices: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Search bar" defaultOpen>
        <label className="mt-1 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Placeholder
          </span>
          <input
            type="text"
            value={searchDraft.placeholder}
            onChange={(e) => updateSearchDraft({ placeholder: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Max results ({searchDraft.maxResults})
          </span>
          <input
            type="range"
            min={4}
            max={24}
            step={1}
            value={searchDraft.maxResults}
            onChange={(e) => updateSearchDraft({ maxResults: Number(e.target.value) })}
            className="w-full"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Min characters ({searchDraft.minQueryLength})
          </span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={searchDraft.minQueryLength}
            onChange={(e) => updateSearchDraft({ minQueryLength: Number(e.target.value) })}
            className="w-full"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Messaging" defaultOpen>
        <label className="mt-1 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Empty hint
          </span>
          <input
            type="text"
            value={searchDraft.emptyHintText}
            onChange={(e) => updateSearchDraft({ emptyHintText: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            No results text
          </span>
          <input
            type="text"
            value={searchDraft.noResultsText}
            onChange={(e) => updateSearchDraft({ noResultsText: e.target.value })}
            className={inputClass}
          />
        </label>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Changes show in preview immediately. Click <strong>Save</strong> to push to Supabase.
        </p>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
