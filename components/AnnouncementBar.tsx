'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_ANNOUNCEMENT, type AnnouncementConfig } from '@/lib/announcement'
import AnnouncementBarView from '@/components/announcement/AnnouncementBarView'

/** Storefront announcement bar — loads saved settings from admin API. */
export default function AnnouncementBar() {
  const [config, setConfig] = useState<AnnouncementConfig | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      void fetch('/api/admin/announcement', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : DEFAULT_ANNOUNCEMENT))
        .then((data: AnnouncementConfig) => {
          if (!cancelled) setConfig(data)
        })
        .catch(() => {
          if (!cancelled) setConfig(DEFAULT_ANNOUNCEMENT)
        })
    }

    load()
    window.addEventListener('focus', load)
    return () => {
      cancelled = true
      window.removeEventListener('focus', load)
    }
  }, [])

  if (!config) return null

  return <AnnouncementBarView config={config} />
}
