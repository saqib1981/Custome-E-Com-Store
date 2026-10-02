'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import {
  COLLECTION_TABS_MAX,
  createCollectionTabSlot,
  type CollectionTabSlot,
} from '@/lib/collection-tabs'
import type { ShopifyCollectionSummary } from '@/lib/shopify-collections'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

type TabEditorProps = {
  index: number
  tab: CollectionTabSlot
  collections: ShopifyCollectionSummary[]
  onSelect: (collectionId: string) => void
  onRemove: () => void
}

function TabEditor({ index, tab, collections, onSelect, onRemove }: TabEditorProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Tab {index + 1}</p>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          aria-label={`Remove tab ${index + 1}`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Remove
        </button>
      </div>
      <label htmlFor={`collection-tab-${tab.id}`} className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
        Shopify collection
      </label>
      <select
        id={`collection-tab-${tab.id}`}
        value={tab.collectionId}
        onChange={(e) => onSelect(e.target.value)}
        className={inputClass}
      >
        <option value="">Select collection…</option>
        {collections.map((collection) => (
          <option key={collection.id} value={collection.id}>
            {collection.title}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function CollectionTabsSettingsPanel() {
  const {
    closeSection,
    collectionTabsDraft,
    collectionTabsDirty,
    collectionTabsSaving,
    collectionTabsStatus,
    updateCollectionTabsDraft,
    saveCollectionTabs,
  } = useAdminEditor()

  const [collections, setCollections] = useState<ShopifyCollectionSummary[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)
  const [collectionsError, setCollectionsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setCollectionsLoading(true)

    void fetch('/api/admin/shopify-collections', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load collections'))))
      .then((data: { collections?: ShopifyCollectionSummary[]; error?: string | null }) => {
        if (cancelled) return
        setCollections(Array.isArray(data.collections) ? data.collections : [])
        setCollectionsError(data.error ?? null)
      })
      .catch(() => {
        if (cancelled) return
        setCollections([])
        setCollectionsError('Could not load collections from Shopify.')
      })
      .finally(() => {
        if (!cancelled) setCollectionsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const updateTab = (tabId: string, collectionId: string) => {
    const collection = collections.find((item) => item.id === collectionId)
    updateCollectionTabsDraft({
      tabs: collectionTabsDraft.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              collectionId: collection?.id ?? '',
              collectionHandle: collection?.handle ?? '',
            }
          : tab
      ),
    })
  }

  const addTab = () => {
    if (collectionTabsDraft.tabs.length >= COLLECTION_TABS_MAX) return
    updateCollectionTabsDraft({
      tabs: [...collectionTabsDraft.tabs, createCollectionTabSlot()],
    })
  }

  const removeTab = (tabId: string) => {
    updateCollectionTabsDraft({
      tabs: collectionTabsDraft.tabs.filter((tab) => tab.id !== tabId),
    })
  }

  return (
    <AdminPanelShell
      title="Collection tabs"
      subtitle="Tabbed product rows from Shopify collections"
      onBack={closeSection}
      onSave={() => void saveCollectionTabs()}
      saveDisabled={!collectionTabsDirty}
      saving={collectionTabsSaving}
      status={collectionTabsStatus}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show collection tabs</span>
          <input
            type="checkbox"
            checked={collectionTabsDraft.enabled}
            onChange={(e) => updateCollectionTabsDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Products" defaultOpen>
        <div className="space-y-2 px-3 pb-2">
          <label htmlFor="collection-tabs-products-per-tab" className="block text-sm font-medium text-gray-800 dark:text-gray-200">
            Products per tab
          </label>
          <select
            id="collection-tabs-products-per-tab"
            value={collectionTabsDraft.productsPerTab}
            onChange={(e) => updateCollectionTabsDraft({ productsPerTab: Number(e.target.value) })}
            className={inputClass}
          >
            <option value={4}>4 products</option>
            <option value={8}>8 products</option>
            <option value={12}>12 products</option>
            <option value={24}>24 products</option>
          </select>
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Tabs" defaultOpen>
        <p className="mb-3 px-3 text-xs text-gray-500 dark:text-gray-400">
          Add tabs and pick a Shopify collection for each. Tab labels and products come from Shopify automatically.
        </p>
        {collectionsLoading ? (
          <div className="mx-3 mb-3 flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-500 dark:border-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading collections…
          </div>
        ) : collectionsError ? (
          <p className="mx-3 mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            {collectionsError}
          </p>
        ) : null}
        <div className="space-y-3 px-3 pb-2">
          {collectionTabsDraft.tabs.map((tab, index) => (
            <TabEditor
              key={tab.id}
              index={index}
              tab={tab}
              collections={collections}
              onSelect={(collectionId) => updateTab(tab.id, collectionId)}
              onRemove={() => removeTab(tab.id)}
            />
          ))}
        </div>
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={addTab}
            disabled={collectionTabsDraft.tabs.length >= COLLECTION_TABS_MAX}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add tab
          </button>
          {collectionTabsDraft.tabs.length >= COLLECTION_TABS_MAX ? (
            <p className="mt-2 text-xs text-gray-500">Maximum {COLLECTION_TABS_MAX} tabs.</p>
          ) : null}
        </div>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
