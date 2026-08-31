'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import ColorField from '@/components/admin/ColorField'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import {
  DEFAULT_TRUST_BANNER,
  TRUST_BANNER_ITEM_COUNT,
  type TrustBannerItem,
} from '@/lib/trust-banner'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

const ITEM_LABELS = ['Shipping', 'Returns', 'Support'] as const

type ItemEditorProps = {
  index: number
  item: TrustBannerItem
  onChange: (patch: Partial<TrustBannerItem>) => void
}

function ItemEditor({ index, item, onChange }: ItemEditorProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
        {ITEM_LABELS[index] ?? `Item ${index + 1}`}
      </p>
      <label htmlFor={`trust-banner-title-${item.id}`} className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
        Title
      </label>
      <input
        id={`trust-banner-title-${item.id}`}
        type="text"
        value={item.title}
        onChange={(e) => onChange({ title: e.target.value })}
        className={`${inputClass} mb-3`}
      />
      <label
        htmlFor={`trust-banner-description-${item.id}`}
        className="mb-1 block text-xs text-gray-500 dark:text-gray-400"
      >
        Description
      </label>
      <textarea
        id={`trust-banner-description-${item.id}`}
        value={item.description}
        onChange={(e) => onChange({ description: e.target.value })}
        rows={3}
        className={inputClass}
      />
    </div>
  )
}

export default function TrustBannerSettingsPanel() {
  const {
    closeSection,
    trustBannerDraft,
    trustBannerDirty,
    trustBannerSaving,
    trustBannerStatus,
    updateTrustBannerDraft,
    saveTrustBanner,
  } = useAdminEditor()

  const updateItem = (itemId: string, patch: Partial<TrustBannerItem>) => {
    updateTrustBannerDraft({
      items: trustBannerDraft.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    })
  }

  return (
    <AdminPanelShell
      title="Trust banner"
      subtitle="Free shipping, returns, and support highlights"
      onBack={closeSection}
      onSave={() => void saveTrustBanner()}
      saveDisabled={!trustBannerDirty}
      saving={trustBannerSaving}
      status={trustBannerStatus}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show trust banner</span>
          <input
            type="checkbox"
            checked={trustBannerDraft.enabled}
            onChange={(e) => updateTrustBannerDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Style" defaultOpen>
        <div className="space-y-4 px-3 pb-2">
          <ColorField
            id="trust-banner-background"
            label="Background color"
            value={trustBannerDraft.backgroundColor}
            fallback={DEFAULT_TRUST_BANNER.backgroundColor}
            onChange={(backgroundColor) => updateTrustBannerDraft({ backgroundColor })}
          />
          <ColorField
            id="trust-banner-text"
            label="Text color"
            value={trustBannerDraft.textColor}
            fallback={DEFAULT_TRUST_BANNER.textColor}
            onChange={(textColor) => updateTrustBannerDraft({ textColor })}
          />
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Content" defaultOpen>
        <p className="mb-3 px-3 text-xs text-gray-500 dark:text-gray-400">
          Three benefit blocks with icons — same layout as your previous store.
        </p>
        <div className="space-y-3 px-3 pb-2">
          {trustBannerDraft.items.slice(0, TRUST_BANNER_ITEM_COUNT).map((item, index) => (
            <ItemEditor key={item.id} index={index} item={item} onChange={(patch) => updateItem(item.id, patch)} />
          ))}
        </div>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
