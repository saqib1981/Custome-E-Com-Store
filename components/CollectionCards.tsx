'use client'

import { useEffect, useMemo, useState } from 'react'
import CollectionCardsView from '@/components/home/CollectionCardsView'
import {
  DEFAULT_COLLECTION_CARDS,
  type CollectionCardsConfig,
  type ResolvedCollectionCard,
} from '@/lib/collection-cards'
import type { PreviewViewport } from '@/lib/preview-viewport'
import { previewCollectionColsClass } from '@/lib/preview-viewport'
import {
  PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS,
  STORE_SECTION_FOCUS_REFRESH_MS,
} from '@/lib/store-section-client'

type CollectionCardsProps = {
  preview?: boolean
  previewViewport?: PreviewViewport
  configOverride?: CollectionCardsConfig
  onPreviewNavigate?: (path: string) => void
}

export default function CollectionCards({
  preview = false,
  previewViewport,
  configOverride,
  onPreviewNavigate,
}: CollectionCardsProps) {
  const [config, setConfig] = useState<CollectionCardsConfig>(
    configOverride ?? DEFAULT_COLLECTION_CARDS
  )
  const [cards, setCards] = useState<ResolvedCollectionCard[]>([])

  const isPreviewMode = preview || Boolean(configOverride)
  const previewConfigKey = useMemo(
    () => (isPreviewMode && configOverride ? JSON.stringify(configOverride) : null),
    [isPreviewMode, configOverride]
  )

  useEffect(() => {
    if (configOverride) {
      setConfig(configOverride)
    }
  }, [configOverride])

  useEffect(() => {
    if (!isPreviewMode || !configOverride) return

    if (!configOverride.enabled) {
      setCards([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      void fetch('/api/admin/collection-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configOverride),
        cache: 'no-store',
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { cards?: ResolvedCollectionCard[] } | null) => {
          if (!cancelled) setCards(Array.isArray(data?.cards) ? data.cards : [])
        })
        .catch(() => {
          if (!cancelled) setCards([])
        })
    }, PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [isPreviewMode, configOverride, previewConfigKey])

  useEffect(() => {
    if (isPreviewMode) return

    let cancelled = false
    let lastFocusAt = 0

    const load = () => {
      void fetch('/api/store/collection-cards', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then(
          (data: {
            enabled?: boolean
            titlePosition?: CollectionCardsConfig['titlePosition']
            cards?: ResolvedCollectionCard[]
          } | null) => {
            if (cancelled || !data) return

            setConfig((prev) => {
              const nextEnabled = Boolean(data.enabled ?? prev.enabled)
              const nextTitlePosition = data.titlePosition === 'below' ? 'below' : 'overlay'
              if (prev.enabled === nextEnabled && prev.titlePosition === nextTitlePosition) {
                return prev
              }
              return { ...prev, enabled: nextEnabled, titlePosition: nextTitlePosition }
            })

            const nextCards = Array.isArray(data.cards) ? data.cards : []
            setCards((prev) =>
              JSON.stringify(prev) === JSON.stringify(nextCards) ? prev : nextCards
            )
          }
        )
        .catch(() => {
          if (!cancelled) setCards([])
        })
    }

    load()

    const onFocus = () => {
      const now = Date.now()
      if (now - lastFocusAt < STORE_SECTION_FOCUS_REFRESH_MS) return
      lastFocusAt = now
      load()
    }

    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
    }
  }, [isPreviewMode])

  return (
    <CollectionCardsView
      config={config}
      cards={cards}
      preview={preview}
      onPreviewNavigate={onPreviewNavigate}
      gridClassName={
        preview && previewViewport ? previewCollectionColsClass(previewViewport, 4) : undefined
      }
    />
  )
}
