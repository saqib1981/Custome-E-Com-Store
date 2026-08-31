'use client'

import { useEffect, useState } from 'react'
import CollectionTabsView from '@/components/home/CollectionTabsView'
import {
  DEFAULT_COLLECTION_TABS,
  type CollectionTabsConfig,
  type ResolvedCollectionTab,
} from '@/lib/collection-tabs'
import type { PreviewViewport } from '@/lib/preview-viewport'

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

  useEffect(() => {
    if (configOverride) {
      setConfig(configOverride)
    }
  }, [configOverride])

  useEffect(() => {
    if (!config.enabled) {
      setTabs([])
      return
    }

    let cancelled = false

    const load = () => {
      if (preview || configOverride) {
        void fetch('/api/admin/collection-tabs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
          cache: 'no-store',
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data: { tabs?: ResolvedCollectionTab[] } | null) => {
            if (!cancelled) setTabs(Array.isArray(data?.tabs) ? data.tabs : [])
          })
          .catch(() => {
            if (!cancelled) setTabs([])
          })
        return
      }

      void fetch('/api/store/collection-tabs', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then(
          (data: {
            enabled?: boolean
            productsPerTab?: number
            tabs?: ResolvedCollectionTab[]
          } | null) => {
            if (cancelled) return
            setConfig((prev) => ({
              ...prev,
              enabled: Boolean(data?.enabled ?? prev.enabled),
              productsPerTab: typeof data?.productsPerTab === 'number' ? data.productsPerTab : prev.productsPerTab,
            }))
            setTabs(Array.isArray(data?.tabs) ? data.tabs : [])
          }
        )
        .catch(() => {
          if (!cancelled) setTabs([])
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
    <CollectionTabsView
      config={config}
      tabs={tabs}
      preview={preview}
      previewViewport={previewViewport}
      onPreviewNavigate={onPreviewNavigate}
    />
  )
}
