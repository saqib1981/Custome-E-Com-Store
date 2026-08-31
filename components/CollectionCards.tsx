'use client'

import { useEffect, useState } from 'react'
import CollectionCardsView from '@/components/home/CollectionCardsView'
import {
  DEFAULT_COLLECTION_CARDS,
  type CollectionCardsConfig,
  type ResolvedCollectionCard,
} from '@/lib/collection-cards'

type CollectionCardsProps = {
  preview?: boolean
  configOverride?: CollectionCardsConfig
  onPreviewNavigate?: (path: string) => void
}

export default function CollectionCards({
  preview = false,
  configOverride,
  onPreviewNavigate,
}: CollectionCardsProps) {
  const [config, setConfig] = useState<CollectionCardsConfig>(
    configOverride ?? DEFAULT_COLLECTION_CARDS
  )
  const [cards, setCards] = useState<ResolvedCollectionCard[]>([])

  useEffect(() => {
    if (configOverride) {
      setConfig(configOverride)
    }
  }, [configOverride])

  useEffect(() => {
    if (!config.enabled) {
      setCards([])
      return
    }

    let cancelled = false

    const load = () => {
      if (preview || configOverride) {
        void fetch('/api/admin/collection-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
          cache: 'no-store',
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data: { cards?: ResolvedCollectionCard[] } | null) => {
            if (!cancelled) setCards(Array.isArray(data?.cards) ? data.cards : [])
          })
          .catch(() => {
            if (!cancelled) setCards([])
          })
        return
      }

      void fetch('/api/store/collection-cards', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { enabled?: boolean; titlePosition?: CollectionCardsConfig['titlePosition']; cards?: ResolvedCollectionCard[] } | null) => {
          if (cancelled) return
          setConfig((prev) => ({
            ...prev,
            enabled: Boolean(data?.enabled ?? prev.enabled),
            titlePosition: data?.titlePosition === 'below' ? 'below' : 'overlay',
          }))
          setCards(Array.isArray(data?.cards) ? data.cards : [])
        })
        .catch(() => {
          if (!cancelled) setCards([])
        })
    }

    load()
    window.addEventListener('focus', load)
    return () => {
      cancelled = true
      window.removeEventListener('focus', load)
    }
  }, [config, preview, configOverride])

  return (
    <CollectionCardsView
      config={config}
      cards={cards}
      preview={preview}
      onPreviewNavigate={onPreviewNavigate}
    />
  )
}
