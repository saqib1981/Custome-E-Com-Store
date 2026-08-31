'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { COLLECTION_CARDS_COUNT, type CollectionCardSlot } from '@/lib/collection-cards'
import type { ShopifyCollectionSummary } from '@/lib/shopify-collections'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

type CardEditorProps = {
  index: number
  card: CollectionCardSlot
  collections: ShopifyCollectionSummary[]
  onSelect: (collectionId: string) => void
}

function CardEditor({ index, card, collections, onSelect }: CardEditorProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Card {index + 1}</p>
      <label htmlFor={`collection-card-${card.id}`} className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
        Shopify collection
      </label>
      <select
        id={`collection-card-${card.id}`}
        value={card.collectionId}
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

export default function CollectionCardsSettingsPanel() {
  const {
    closeSection,
    collectionCardsDraft,
    collectionCardsDirty,
    collectionCardsSaving,
    collectionCardsStatus,
    updateCollectionCardsDraft,
    saveCollectionCards,
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

  const updateCard = (cardId: string, collectionId: string) => {
    const collection = collections.find((item) => item.id === collectionId)
    updateCollectionCardsDraft({
      cards: collectionCardsDraft.cards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              collectionId: collection?.id ?? '',
              collectionHandle: collection?.handle ?? '',
            }
          : card
      ),
    })
  }

  return (
    <AdminPanelShell
      title="Collection cards"
      subtitle="Four portrait collection tiles below the divider (3:4 ratio)"
      onBack={closeSection}
      onSave={() => void saveCollectionCards()}
      saveDisabled={!collectionCardsDirty}
      saving={collectionCardsSaving}
      status={collectionCardsStatus}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show collection cards</span>
          <input
            type="checkbox"
            checked={collectionCardsDraft.enabled}
            onChange={(e) => updateCollectionCardsDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Title" defaultOpen>
        <div className="space-y-2 px-3 pb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Choose where the collection name appears on each card.
          </p>
          <label className="flex cursor-pointer items-center gap-2 py-1.5">
            <input
              type="radio"
              name="collection-card-title-position"
              checked={collectionCardsDraft.titlePosition === 'overlay'}
              onChange={() => updateCollectionCardsDraft({ titlePosition: 'overlay' })}
              className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200">On the card (overlay)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 py-1.5">
            <input
              type="radio"
              name="collection-card-title-position"
              checked={collectionCardsDraft.titlePosition === 'below'}
              onChange={() => updateCollectionCardsDraft({ titlePosition: 'below' })}
              className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200">Below the card</span>
          </label>
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Collections" defaultOpen>
        <p className="mb-3 px-3 text-xs text-gray-500 dark:text-gray-400">
          Pick one Shopify collection for each of the {COLLECTION_CARDS_COUNT} cards. Images and titles come from
          Shopify automatically.
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
          {collectionCardsDraft.cards.map((card, index) => (
            <CardEditor
              key={card.id}
              index={index}
              card={card}
              collections={collections}
              onSelect={(collectionId) => updateCard(card.id, collectionId)}
            />
          ))}
        </div>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
