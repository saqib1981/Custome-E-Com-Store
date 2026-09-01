'use client'

import { useEffect, useState } from 'react'
import StoreFooterView from '@/components/home/StoreFooterView'
import { DEFAULT_STORE_FOOTER, type StoreFooterConfig } from '@/lib/store-footer'
import type { PreviewViewport } from '@/lib/preview-viewport'
import { useStoreTheme } from '@/context/StoreThemeContext'

type StoreFooterProps = {
  preview?: boolean
  previewViewport?: PreviewViewport
  configOverride?: StoreFooterConfig
  storeNameOverride?: string
  onPreviewNavigate?: (path: string) => void
}

export default function StoreFooter({
  preview = false,
  previewViewport,
  configOverride,
  storeNameOverride,
  onPreviewNavigate,
}: StoreFooterProps) {
  const { storeName: themeStoreName } = useStoreTheme()
  const storeName = storeNameOverride ?? themeStoreName
  const [config, setConfig] = useState<StoreFooterConfig>(configOverride ?? DEFAULT_STORE_FOOTER)

  useEffect(() => {
    if (configOverride) {
      setConfig(configOverride)
      return
    }

    let cancelled = false

    void fetch('/api/store/store-footer', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_STORE_FOOTER))
      .then((data: StoreFooterConfig) => {
        if (!cancelled) setConfig(data)
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_STORE_FOOTER)
      })

    return () => {
      cancelled = true
    }
  }, [configOverride])

  return (
    <StoreFooterView
      config={config}
      storeName={storeName}
      preview={preview}
      previewViewport={previewViewport}
      onPreviewNavigate={onPreviewNavigate}
    />
  )
}
