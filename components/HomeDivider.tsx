'use client'

import { useEffect, useState } from 'react'
import HomeDividerSection from '@/components/home/HomeDividerSection'
import { DEFAULT_HOME_DIVIDER, type HomeDividerConfig } from '@/lib/home-divider'

type HomeDividerProps = {
  children: React.ReactNode
  contentClassName?: string
}

/** Homepage divider below hero — loads saved settings from admin API. */
export default function HomeDivider({ children, contentClassName }: HomeDividerProps) {
  const [config, setConfig] = useState<HomeDividerConfig | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      void fetch('/api/admin/home-divider', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : DEFAULT_HOME_DIVIDER))
        .then((data: HomeDividerConfig) => {
          if (!cancelled) setConfig(data)
        })
        .catch(() => {
          if (!cancelled) setConfig(DEFAULT_HOME_DIVIDER)
        })
    }

    load()
    window.addEventListener('focus', load)
    return () => {
      cancelled = true
      window.removeEventListener('focus', load)
    }
  }, [])

  if (!config) {
    return (
      <HomeDividerSection config={DEFAULT_HOME_DIVIDER} contentClassName={contentClassName}>
        {children}
      </HomeDividerSection>
    )
  }

  return (
    <HomeDividerSection config={config} contentClassName={contentClassName}>
      {children}
    </HomeDividerSection>
  )
}
