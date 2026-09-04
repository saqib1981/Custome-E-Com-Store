'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import {
  COLLECTION_PRODUCTS_SORT_OPTIONS,
  type CollectionProductCardAspect,
  type CollectionProductsColumns,
} from '@/lib/collection-products'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function CollectionProductsSettingsPanel() {
  const {
    closeSection,
    collectionProductsDraft,
    collectionProductsDirty,
    collectionProductsSaving,
    collectionProductsStatus,
    collectionProductsErrorMessage,
    updateCollectionProductsDraft,
    saveCollectionProducts,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Products"
      subtitle="Product grid on each collection page (/collections/…)"
      onBack={closeSection}
      onSave={() => void saveCollectionProducts()}
      saveDisabled={!collectionProductsDirty}
      saving={collectionProductsSaving}
      status={collectionProductsStatus}
      errorMessage={collectionProductsErrorMessage}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show products</span>
          <input
            type="checkbox"
            checked={collectionProductsDraft.enabled}
            onChange={(e) => updateCollectionProductsDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Sale badge</span>
          <input
            type="checkbox"
            checked={collectionProductsDraft.showSaleBadge}
            onChange={(e) => updateCollectionProductsDraft({ showSaleBadge: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">New badge</span>
          <input
            type="checkbox"
            checked={collectionProductsDraft.showNewBadge}
            onChange={(e) => updateCollectionProductsDraft({ showNewBadge: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        {collectionProductsDraft.showNewBadge ? (
          <label className="mt-2 block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              New for (days)
            </span>
            <input
              type="number"
              min={1}
              max={365}
              value={collectionProductsDraft.newBadgeDays}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '') return
                const parsed = Number(raw)
                if (!Number.isFinite(parsed)) return
                updateCollectionProductsDraft({
                  newBadgeDays: Math.min(365, Math.max(1, Math.round(parsed))),
                })
              }}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Shows on products created in this window, or tagged <code>new</code> in Shopify.
              Click <strong>Save</strong> to push to Supabase. Position: left. Sale stays on the right.
            </p>
          </label>
        ) : null}
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Grid layout" defaultOpen>
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Columns on desktop
        </label>
        <select
          value={String(collectionProductsDraft.columnsDesktop)}
          onChange={(e) =>
            updateCollectionProductsDraft({
              columnsDesktop: Number(e.target.value) as CollectionProductsColumns,
            })
          }
          className={`${inputClass} mb-4`}
        >
          <option value="2">2 columns</option>
          <option value="3">3 columns</option>
          <option value="4">4 columns</option>
        </select>

        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Card image size
        </label>
        <select
          value={collectionProductsDraft.cardImageAspect}
          onChange={(e) =>
            updateCollectionProductsDraft({
              cardImageAspect: e.target.value as CollectionProductCardAspect,
            })
          }
          className={inputClass}
        >
          <option value="square">Square (1:1) — same size for all</option>
          <option value="portrait">Portrait (3:4) — same size for all</option>
          <option value="landscape">Landscape (4:3) — same size for all</option>
        </select>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Every product card uses the same image frame and text block height so the grid stays even.
        </p>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Sorting" defaultOpen>
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Fallback sort (All products only)
        </label>
        <select
          value={collectionProductsDraft.defaultSort}
          onChange={(e) =>
            updateCollectionProductsDraft({
              defaultSort: e.target.value as typeof collectionProductsDraft.defaultSort,
            })
          }
          className={inputClass}
        >
          {COLLECTION_PRODUCTS_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Each real collection page uses the sort order set on that collection in Shopify Admin.
          Shoppers can still change Sort by on the page.
        </p>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Pagination" defaultOpen>
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Products per page
        </label>
        <input
          type="number"
          min={1}
          max={48}
          value={collectionProductsDraft.pageSize}
          onChange={(e) =>
            updateCollectionProductsDraft({
              pageSize: Math.min(48, Math.max(1, Number(e.target.value) || 24)),
            })
          }
          className={`${inputClass} mb-4`}
        />

        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Navigation style
        </label>
        <select
          value={collectionProductsDraft.paginationMode}
          onChange={(e) =>
            updateCollectionProductsDraft({
              paginationMode: e.target.value === 'pagination' ? 'pagination' : 'load-more',
            })
          }
          className={inputClass}
        >
          <option value="load-more">Load more (same page)</option>
          <option value="pagination">Pagination (Previous / Next)</option>
        </select>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Each Shopify collection shows its own products. Default is load more — 24 products per
          request.
        </p>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
