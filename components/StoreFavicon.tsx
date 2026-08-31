'use client'

import { useEffect } from 'react'

type StoreFaviconProps = {
  faviconUrl?: string
}

/** Sets the document favicon from saved store settings. */
export default function StoreFavicon({ faviconUrl: faviconUrlOverride }: StoreFaviconProps = {}) {
  const faviconUrl = faviconUrlOverride?.trim() ?? ''

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
