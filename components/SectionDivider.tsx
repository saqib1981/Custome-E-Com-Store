'use client'

import { useEffect, useState } from 'react'
import HomeDividerSection from '@/components/home/HomeDividerSection'
import { DEFAULT_HOME_DIVIDER, type HomeDividerConfig } from '@/lib/home-divider'

type SectionDividerProps = {
  apiPath: string
  children?: React.ReactNode
  contentClassName?: string
}

/** Loads divider settings from admin API and renders the line + optional children. */
export default function SectionDivider({ apiPath, children, contentClassName }: SectionDividerProps) {
  const [config, setConfig] = useState<HomeDividerConfig | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      void fetch(apiPath, { cache: 'no-store' })
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
  }, [apiPath])

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
