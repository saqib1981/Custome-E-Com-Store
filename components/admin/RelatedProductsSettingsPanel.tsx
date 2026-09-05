'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import type { CollectionProductCardAspect } from '@/lib/collection-products'
import {
  RELATED_PRODUCTS_LIMIT_OPTIONS,
  type RelatedProductsColumns,
  type RelatedProductsLimit,
} from '@/lib/related-products'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function RelatedProductsSettingsPanel() {
  const {
    closeSection,
    relatedProductsDraft,
    relatedProductsDirty,
    relatedProductsSaving,
    relatedProductsStatus,
    updateRelatedProductsDraft,
    saveRelatedProducts,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Related products"
      subtitle="Shown below the product details on /products/…"
      onBack={closeSection}
      onSave={() => void saveRelatedProducts()}
      saveDisabled={!relatedProductsDirty}
      saving={relatedProductsSaving}
      status={relatedProductsStatus}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Show related products
          </span>
          <input
            type="checkbox"
            checked={relatedProductsDraft.enabled}
            onChange={(e) => updateRelatedProductsDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="mt-2 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Heading
          </span>
          <input
            type="text"
            value={relatedProductsDraft.heading}
            onChange={(e) => updateRelatedProductsDraft({ heading: e.target.value })}
            className={inputClass}
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Grid layout" defaultOpen>
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Products to show
        </label>
        <select
          value={String(relatedProductsDraft.limit)}
          onChange={(e) =>
            updateRelatedProductsDraft({
              limit: Number(e.target.value) as RelatedProductsLimit,
            })
          }
          className={`${inputClass} mb-4`}
        >
          {RELATED_PRODUCTS_LIMIT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} products
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Columns on desktop
        </label>
        <select
          value={String(relatedProductsDraft.columnsDesktop)}
          onChange={(e) =>
            updateRelatedProductsDraft({
              columnsDesktop: Number(e.target.value) as RelatedProductsColumns,
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
          value={relatedProductsDraft.cardImageAspect}
          onChange={(e) =>
            updateRelatedProductsDraft({
              cardImageAspect: e.target.value as CollectionProductCardAspect,
            })
          }
          className={inputClass}
        >
          <option value="square">Square</option>
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Related products come from the current product&apos;s collection (fallback: recent
          products). Click <strong>Save</strong> to push to Supabase.
        </p>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Badges" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Sale badge</span>
          <input
            type="checkbox"
            checked={relatedProductsDraft.showSaleBadge}
            onChange={(e) => updateRelatedProductsDraft({ showSaleBadge: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">New badge</span>
          <input
            type="checkbox"
            checked={relatedProductsDraft.showNewBadge}
            onChange={(e) => updateRelatedProductsDraft({ showNewBadge: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        {relatedProductsDraft.showNewBadge ? (
          <label className="mt-2 block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              New for (days)
            </span>
            <input
              type="number"
              min={1}
              max={365}
              value={relatedProductsDraft.newBadgeDays}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '') return
                const parsed = Number(raw)
                if (!Number.isFinite(parsed)) return
                updateRelatedProductsDraft({
                  newBadgeDays: Math.min(365, Math.max(1, Math.round(parsed))),
                })
              }}
              className={inputClass}
            />
          </label>
        ) : null}
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
