'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import type { CollectionProductCardAspect } from '@/lib/collection-products'
import {
  RECENT_PRODUCTS_LIMIT_OPTIONS,
  type RecentProductsColumns,
  type RecentProductsLimit,
} from '@/lib/recent-products'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function RecentProductsSettingsPanel() {
  const {
    closeSection,
    recentProductsDraft,
    recentProductsDirty,
    recentProductsSaving,
    recentProductsStatus,
    updateRecentProductsDraft,
    saveRecentProducts,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Recent products"
      subtitle="Products the shopper already viewed, below related products on /products/…"
      onBack={closeSection}
      onSave={() => void saveRecentProducts()}
      saveDisabled={!recentProductsDirty}
      saving={recentProductsSaving}
      status={recentProductsStatus}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Show recent products
          </span>
          <input
            type="checkbox"
            checked={recentProductsDraft.enabled}
            onChange={(e) => updateRecentProductsDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="mt-2 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Heading
          </span>
          <input
            type="text"
            value={recentProductsDraft.heading}
            onChange={(e) => updateRecentProductsDraft({ heading: e.target.value })}
            className={inputClass}
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Grid layout" defaultOpen>
        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Products to show
        </label>
        <select
          value={String(recentProductsDraft.limit)}
          onChange={(e) =>
            updateRecentProductsDraft({
              limit: Number(e.target.value) as RecentProductsLimit,
            })
          }
          className={`${inputClass} mb-4`}
        >
          {RECENT_PRODUCTS_LIMIT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} products
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Columns on desktop
        </label>
        <select
          value={String(recentProductsDraft.columnsDesktop)}
          onChange={(e) =>
            updateRecentProductsDraft({
              columnsDesktop: Number(e.target.value) as RecentProductsColumns,
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
          value={recentProductsDraft.cardImageAspect}
          onChange={(e) =>
            updateRecentProductsDraft({
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
          Shows products this browser already opened (excluding the current product). Click{' '}
          <strong>Save</strong> to push to Supabase. Sale and New badges are in Global settings →
          Badges.
        </p>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
