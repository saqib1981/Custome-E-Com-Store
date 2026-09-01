'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { DEFAULT_COLLECTIONS_LIST, type CollectionsListColumnsDesktop } from '@/lib/collections-list'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function CollectionsListSettingsPanel() {
  const {
    closeSection,
    collectionsListDraft,
    collectionsListDirty,
    collectionsListSaving,
    collectionsListStatus,
    updateCollectionsListDraft,
    saveCollectionsList,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Collection cards"
      subtitle="All Shopify collections on the /collections page"
      onBack={closeSection}
      onSave={() => void saveCollectionsList()}
      saveDisabled={!collectionsListDirty}
      saving={collectionsListSaving}
      status={collectionsListStatus}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show collections</span>
          <input
            type="checkbox"
            checked={collectionsListDraft.enabled}
            onChange={(e) => updateCollectionsListDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Page title" defaultOpen>
        <input
          type="text"
          value={collectionsListDraft.pageTitle}
          onChange={(e) => updateCollectionsListDraft({ pageTitle: e.target.value })}
          placeholder={DEFAULT_COLLECTIONS_LIST.pageTitle}
          className={inputClass}
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          All collections from Shopify are shown automatically — no manual selection needed.
        </p>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Card layout" defaultOpen>
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Title position
        </label>
        <select
          value={collectionsListDraft.titlePosition}
          onChange={(e) =>
            updateCollectionsListDraft({
              titlePosition: e.target.value === 'below' ? 'below' : 'overlay',
            })
          }
          className={`${inputClass} mb-4`}
        >
          <option value="overlay">Overlay on image</option>
          <option value="below">Below image</option>
        </select>

        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Columns on desktop
        </label>
        <select
          value={String(collectionsListDraft.columnsDesktop)}
          onChange={(e) =>
            updateCollectionsListDraft({
              columnsDesktop: Number(e.target.value) as CollectionsListColumnsDesktop,
            })
          }
          className={inputClass}
        >
          <option value="2">2 columns</option>
          <option value="3">3 columns</option>
          <option value="4">4 columns</option>
        </select>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Pagination" defaultOpen>
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Collections per page
        </label>
        <input
          type="number"
          min={1}
          max={48}
          value={collectionsListDraft.pageSize}
          onChange={(e) =>
            updateCollectionsListDraft({
              pageSize: Math.min(48, Math.max(1, Number(e.target.value) || 24)),
            })
          }
          className={`${inputClass} mb-4`}
        />

        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Navigation style
        </label>
        <select
          value={collectionsListDraft.paginationMode}
          onChange={(e) =>
            updateCollectionsListDraft({
              paginationMode: e.target.value === 'load-more' ? 'load-more' : 'pagination',
            })
          }
          className={inputClass}
        >
          <option value="pagination">Pagination (page numbers)</option>
          <option value="load-more">Load more (same page)</option>
        </select>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Default is pagination — 24 collections per page. Load more keeps adding cards on the same
          page when the button is pressed.
        </p>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
