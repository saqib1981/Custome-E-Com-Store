'use client'

import { useEffect } from 'react'
import { useStoreTheme } from '@/context/StoreThemeContext'

/** Sets the document favicon from saved store settings. */
export default function StoreFavicon() {
  const { logoFavicon } = useStoreTheme()
  const faviconUrl = logoFavicon.faviconUrl.trim()

  useEffect(() => {
    if (!faviconUrl) return

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = faviconUrl
  }, [faviconUrl])

  return null
}
