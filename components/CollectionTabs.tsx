'use client'

import { useEffect, useMemo, useState } from 'react'
import CollectionTabsView from '@/components/home/CollectionTabsView'
import {
  DEFAULT_COLLECTION_TABS,
  type CollectionTabsConfig,
  type ResolvedCollectionTab,
} from '@/lib/collection-tabs'
import type { PreviewViewport } from '@/lib/preview-viewport'
import {
  PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS,
  STORE_SECTION_FOCUS_REFRESH_MS,
} from '@/lib/store-section-client'

type CollectionTabsProps = {
  preview?: boolean
  previewViewport?: PreviewViewport
  configOverride?: CollectionTabsConfig
  onPreviewNavigate?: (path: string) => void
}

export default function CollectionTabs({
  preview = false,
  previewViewport,
  configOverride,
  onPreviewNavigate,
}: CollectionTabsProps) {
  const [config, setConfig] = useState<CollectionTabsConfig>(configOverride ?? DEFAULT_COLLECTION_TABS)
  const [tabs, setTabs] = useState<ResolvedCollectionTab[]>([])

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
      setTabs([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      void fetch('/api/admin/collection-tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configOverride),
        cache: 'no-store',
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { tabs?: ResolvedCollectionTab[] } | null) => {
          if (!cancelled) setTabs(Array.isArray(data?.tabs) ? data.tabs : [])
        })
        .catch(() => {
          if (!cancelled) setTabs([])
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
      void fetch('/api/store/collection-tabs', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then(
          (data: {
            enabled?: boolean
            productsPerTab?: number
            tabs?: ResolvedCollectionTab[]
          } | null) => {
            if (cancelled || !data) return

            setConfig((prev) => {
              const nextEnabled = Boolean(data.enabled ?? prev.enabled)
              const nextProductsPerTab =
                typeof data.productsPerTab === 'number' ? data.productsPerTab : prev.productsPerTab
              if (prev.enabled === nextEnabled && prev.productsPerTab === nextProductsPerTab) {
                return prev
              }
              return { ...prev, enabled: nextEnabled, productsPerTab: nextProductsPerTab }
            })

            const nextTabs = Array.isArray(data.tabs) ? data.tabs : []
            setTabs((prev) => (JSON.stringify(prev) === JSON.stringify(nextTabs) ? prev : nextTabs))
          }
        )
        .catch(() => {
          if (!cancelled) setTabs([])
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
    <CollectionTabsView
      config={config}
      tabs={tabs}
      preview={preview}
      previewViewport={previewViewport}
      onPreviewNavigate={onPreviewNavigate}
    />
  )
}
