'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function BadgesSettingsPanel() {
  const {
    closeGlobalSetting,
    badgesDraft,
    badgesDirty,
    badgesSaving,
    badgesStatus,
    updateBadgesDraft,
    saveBadges,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Badges"
      subtitle="Sale and New badges for product cards and the product page · saves automatically"
      onBack={closeGlobalSetting}
      onSave={() => void saveBadges()}
      saveDisabled={!badgesDirty || badgesSaving}
      saving={badgesSaving}
      status={badgesStatus}
    >
      <SettingsCollapsibleSection title="Product badges" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Sale badge</span>
          <input
            type="checkbox"
            checked={badgesDraft.showSaleBadge}
            onChange={(e) => updateBadgesDraft({ showSaleBadge: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">New badge</span>
          <input
            type="checkbox"
            checked={badgesDraft.showNewBadge}
            onChange={(e) => updateBadgesDraft({ showNewBadge: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        {badgesDraft.showNewBadge ? (
          <label className="mt-2 block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              New for (days)
            </span>
            <input
              type="number"
              min={1}
              max={365}
              value={badgesDraft.newBadgeDays}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '') return
                const parsed = Number(raw)
                if (!Number.isFinite(parsed)) return
                updateBadgesDraft({
                  newBadgeDays: Math.min(365, Math.max(1, Math.round(parsed))),
                })
              }}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Shows on products created in this window, or tagged <code>new</code> in Shopify.
              Applies to collection grids, related products, and recent products. New sits on the
              left; Sale on the right.
            </p>
          </label>
        ) : null}
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
